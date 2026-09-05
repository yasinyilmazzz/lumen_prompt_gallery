"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAdmin } from "@/lib/admin-actions";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const res = await loginAdmin(password);
    setPending(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-sm rounded-3xl border border-black/[0.07] bg-white p-8 shadow-[0_24px_60px_rgba(0,0,0,0.08)]">
        <p className="font-display text-2xl font-semibold tracking-tight">LUMEN admin</p>
        <p className="mt-2 text-sm text-neutral-500">Restricted area. Enter the admin password to continue.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="password" className="text-[13px] font-semibold">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="••••••••"
              className="mt-1.5 w-full rounded-xl border border-black/15 px-4 py-3 text-[15px] outline-none focus:border-black"
            />
          </div>
          {error && (
            <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={pending || !password}
            className="w-full rounded-xl bg-black py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-40"
          >
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
