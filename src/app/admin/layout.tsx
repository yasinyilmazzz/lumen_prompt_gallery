import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { logoutAdmin } from "@/lib/admin-actions";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "▦" },
  { href: "/admin/prompts", label: "Prompts", icon: "✎" },
  { href: "/admin/images", label: "Images", icon: "◐" },
  { href: "/admin/models", label: "Models", icon: "◑" },
  { href: "/admin/categories", label: "Categories", icon: "▤" },
  { href: "/admin/tags", label: "Tags", icon: "#" },
];

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}

async function AdminShell({ children }: { children: ReactNode }) {
  const authed = await getAdminSession();
  // Login page renders its own minimal shell (it checks auth itself)
  return (
    <div className="min-h-screen bg-[#f4f4f6]">
      {authed ? (
        <div className="mx-auto flex min-h-screen max-w-[1400px]">
          {/* desktop sidebar */}
          <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-black/[0.07] bg-white p-5 lg:flex">
            <Link href="/admin" className="px-2 font-display text-xl font-semibold tracking-tight">
              LUMEN <span className="text-sm font-normal text-neutral-400">admin</span>
            </Link>
            <nav className="mt-8 flex-1 space-y-1" aria-label="Admin">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-600 transition hover:bg-black/[0.05] hover:text-black"
                >
                  <span className="w-5 text-center text-neutral-400" aria-hidden="true">{n.icon}</span>
                  {n.label}
                </Link>
              ))}
            </nav>
            <Link href="/" className="rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-500 hover:text-black">
              ← View site
            </Link>
            <form action={logoutAdmin}>
              <button type="submit" className="mt-1 w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-neutral-500 hover:text-black">
                Sign out
              </button>
            </form>
          </aside>

          <div className="min-w-0 flex-1">
            {/* mobile top bar */}
            <div className="sticky top-0 z-40 border-b border-black/[0.07] bg-white/90 backdrop-blur lg:hidden">
              <div className="flex items-center justify-between px-4 py-3">
                <Link href="/admin" className="font-display text-lg font-semibold">LUMEN admin</Link>
                <form action={logoutAdmin}>
                  <button type="submit" className="text-sm font-medium text-neutral-500">Sign out</button>
                </form>
              </div>
              <nav className="thin-scroll flex gap-1 overflow-x-auto px-4 pb-3" aria-label="Admin mobile">
                {NAV.map((n) => (
                  <Link
                    key={n.href}
                    href={n.href}
                    className="shrink-0 rounded-full border border-black/10 bg-white px-4 py-1.5 text-[13px] font-medium"
                  >
                    {n.label}
                  </Link>
                ))}
              </nav>
            </div>
            <main className="p-4 sm:p-8">{children}</main>
          </div>
        </div>
      ) : (
        <>{children}</>
      )}
    </div>
  );
}

export async function requireAdminPage() {
  const authed = await getAdminSession();
  if (!authed) redirect("/admin/login");
}
