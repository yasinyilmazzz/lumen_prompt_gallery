import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "vpl_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

function secret(): string {
  return process.env.ADMIN_SESSION_SECRET || "dev-only-session-secret-change-me";
}

export function adminPassword(): string {
  return process.env.ADMIN_PASSWORD || "admin123";
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

export function createSessionToken(): string {
  const expires = Date.now() + SESSION_TTL_MS;
  const payload = `admin:${expires}`;
  const sig = sign(payload);
  return Buffer.from(`${payload}:${sig}`).toString("base64url");
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const [role, expiresRaw, sig] = decoded.split(":");
    if (role !== "admin" || !expiresRaw || !sig) return false;
    const expires = Number(expiresRaw);
    if (!Number.isFinite(expires) || expires < Date.now()) return false;
    const expected = sign(`${role}:${expiresRaw}`);
    const a = Buffer.from(expected, "utf8");
    const b = Buffer.from(sig, "utf8");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function getAdminSession(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(COOKIE_NAME)?.value);
}

export function sessionCookieName(): string {
  return COOKIE_NAME;
}

export function sessionMaxAge(): number {
  return Math.floor(SESSION_TTL_MS / 1000);
}
