/**
 * Cloudinary image architecture.
 *
 * Production: images live on Cloudinary. We store only the secure URL +
 * public_id + metadata in Postgres, and derive responsive transformation
 * URLs on the fly (no physical duplicates).
 *
 * Sandbox / MVP: Cloudinary credentials may be absent. In that case we
 * gracefully fall back to the stored URL (external CDN / local uploads).
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_CONFIGURED = Boolean(CLOUD_NAME);

export type ImagePreset = "thumb" | "small" | "medium" | "large" | "original";

const PRESETS: Record<Exclude<ImagePreset, "original">, string> = {
  thumb: "c_fill,w_480,q_auto,f_auto",
  small: "c_limit,w_640,q_auto,f_auto",
  medium: "c_limit,w_960,q_auto,f_auto",
  large: "c_limit,w_1600,q_auto,f_auto",
};

export function isCloudinaryConfigured(): boolean {
  return CLOUDINARY_CONFIGURED;
}

/** True when the URL is already a Cloudinary delivery URL. */
export function isCloudinaryUrl(url: string): boolean {
  return url.includes("res.cloudinary.com");
}

/**
 * Build a responsive Cloudinary URL from a stored URL.
 * - If it's a Cloudinary URL, inject/replace the transformation segment.
 * - Otherwise return the original URL untouched (external CDN fallback).
 */
export function cloudinaryUrl(storedUrl: string, preset: ImagePreset = "medium"): string {
  if (!storedUrl) return storedUrl;
  if (preset === "original") return storedUrl;
  if (!isCloudinaryUrl(storedUrl)) return storedUrl;
  const transform = PRESETS[preset];
  // Insert transformation right after /upload/ (replacing existing transforms)
  return storedUrl.replace(
    /\/upload\/(?:[^/]+\/)*v?\d*\/?/,
    (match) => {
      // Keep it simple: always rebuild as /upload/<transform>/
      void match;
      return `/upload/${transform}/`;
    }
  );
}

/** Derive thumbnail URL at write-time (stored in DB for fast reads). */
export function deriveThumbnailUrl(storedUrl: string): string {
  return cloudinaryUrl(storedUrl, "thumb");
}

/**
 * Responsive srcSet for masonry / detail rendering.
 * Falls back to single URL when Cloudinary is not the host.
 */
export function responsiveSrcSet(storedUrl: string): string | undefined {
  if (!isCloudinaryUrl(storedUrl)) return undefined;
  return [
    `${cloudinaryUrl(storedUrl, "small")} 640w`,
    `${cloudinaryUrl(storedUrl, "medium")} 960w`,
    `${cloudinaryUrl(storedUrl, "large")} 1600w`,
  ].join(", ");
}

export const CLOUDINARY_SIZES = {
  masonry: "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1536px) 25vw, 20vw",
  detail: "(max-width: 1024px) 100vw, 60vw",
  hero: "100vw",
} as const;

export type CloudinaryUploadResult = {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
};

/** Server-side signature for signed uploads (secret never leaves the server). */
export async function signUploadParams(params: Record<string, string>): Promise<{
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
}> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary is not configured");
  }
  const timestamp = Math.floor(Date.now() / 1000);
  const { createHmac } = await import("node:crypto");
  const toSign: Record<string, string> = { ...params, timestamp: String(timestamp) };
  const sorted = Object.keys(toSign)
    .sort()
    .map((k) => `${k}=${toSign[k]}`)
    .join("&");
  const signature = createHmac("sha1", apiSecret).update(sorted).digest("hex");
  return { signature, timestamp, apiKey, cloudName };
}

const UPLOAD_FOLDER = "lumen";

/** Upload image bytes to Cloudinary (server-side fallback when client can't sign). */
export async function uploadBufferToCloudinary(
  buffer: Buffer,
  filename: string
): Promise<CloudinaryUploadResult> {
  const signed = await signUploadParams({ folder: UPLOAD_FOLDER });
  const body = new FormData();
  body.append("file", new Blob([new Uint8Array(buffer)]), filename);
  body.append("api_key", signed.apiKey);
  body.append("timestamp", String(signed.timestamp));
  body.append("signature", signed.signature);
  body.append("folder", UPLOAD_FOLDER);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${signed.cloudName}/image/upload`, {
    method: "POST",
    body,
  });
  const data = (await res.json()) as CloudinaryUploadResult & { error?: { message?: string } };
  if (!res.ok) throw new Error(data.error?.message ?? "Cloudinary upload failed.");
  return data;
}

export { UPLOAD_FOLDER };
