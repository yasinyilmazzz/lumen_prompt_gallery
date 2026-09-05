import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { getAdminSession } from "@/lib/auth";
import { signUploadParams } from "@/lib/cloudinary";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

/**
 * GET → Cloudinary signed-upload params (production path).
 * Returns { configured: false } when Cloudinary env is absent so the
 * admin UI falls back to direct POST upload below.
 */
export async function GET() {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const signed = await signUploadParams({ folder: "lumen" });
    return NextResponse.json({ configured: true, ...signed, folder: "lumen" });
  } catch {
    return NextResponse.json({ configured: false });
  }
}

/**
 * POST → multipart file upload (sandbox / fallback path).
 * Production should prefer signed Cloudinary uploads; this keeps the
 * content workflow frictionless everywhere.
 */
export async function POST(req: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload payload." }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof Blob)) return NextResponse.json({ error: "No file provided." }, { status: 400 });
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: "Only JPEG, PNG, WebP or AVIF images are allowed." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File is too large (max 8 MB)." }, { status: 400 });
  }

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : file.type === "image/avif" ? "avif" : "jpg";
  const name = `${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;
  const dir = join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(join(dir, name), buffer);

  // Best-effort dimensions probe (PNG/JPEG magic not required — UI tolerates nulls)
  return NextResponse.json({ ok: true, url: `/uploads/${name}`, width: null, height: null });
}
