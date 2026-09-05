import Link from "next/link";
import { getAdminStats, getAdminPrompts } from "@/lib/queries";
import { requireAdminPage } from "./layout";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  await requireAdminPage();
  const [stats, recent] = await Promise.all([getAdminStats(), getAdminPrompts()]);
  const latest = recent.slice(0, 5);

  const cards = [
    { label: "Total prompts", value: stats.totalPrompts, href: "/admin/prompts", accent: "bg-black text-white" },
    { label: "Published", value: stats.publishedPrompts, href: "/admin/prompts?status=published", accent: "bg-emerald-600 text-white" },
    { label: "Drafts", value: stats.draftPrompts, href: "/admin/prompts?status=draft", accent: "bg-amber-500 text-white" },
    { label: "Images", value: stats.totalImages, href: "/admin/images", accent: "bg-white" },
    { label: "Models", value: stats.totalModels, href: "/admin/models", accent: "bg-white" },
    { label: "Categories", value: stats.totalCategories, href: "/admin/categories", accent: "bg-white" },
    { label: "Prompt copies", value: stats.totalCopies, href: "/admin/prompts", accent: "bg-white" },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-medium tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-neutral-500">Your library at a glance.</p>
        </div>
        <Link
          href="/admin/prompts/new"
          className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
        >
          + New prompt
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className={`rounded-2xl border border-black/[0.07] p-5 transition hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] ${c.accent}`}
          >
            <p className={`font-display text-3xl font-medium ${c.accent === "bg-white" ? "" : ""}`}>{c.value}</p>
            <p className={`mt-1 text-[13px] font-medium ${c.accent === "bg-white" ? "text-neutral-500" : "opacity-80"}`}>
              {c.label}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-black/[0.07] bg-white">
        <div className="flex items-center justify-between border-b border-black/[0.06] px-5 py-4">
          <h2 className="font-semibold">Recently updated</h2>
          <Link href="/admin/prompts" className="text-sm font-medium text-neutral-500 hover:text-black">
            View all →
          </Link>
        </div>
        {latest.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="font-medium">No prompts yet.</p>
            <p className="mt-1 text-sm text-neutral-500">Create your first prompt to fill the library.</p>
            <Link href="/admin/prompts/new" className="mt-4 inline-block rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white">
              Create your first prompt
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-black/[0.05]">
            {latest.map((p) => (
              <li key={p.id}>
                <Link href={`/admin/prompts/${p.id}`} className="flex items-center gap-4 px-5 py-3.5 transition hover:bg-black/[0.02]">
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${p.status === "published" ? "bg-emerald-500" : "bg-amber-400"}`} aria-hidden="true" />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{p.title}</span>
                  <span className="hidden text-[13px] text-neutral-400 sm:inline">{p.modelName ?? "—"}</span>
                  <span className="text-[13px] text-neutral-400">{formatDate(p.updatedAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
