import Link from "next/link";
import { getAdminPrompts } from "@/lib/queries";
import { requireAdminPage } from "../layout";
import { PromptRowActions } from "@/components/admin/admin-ui";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminPromptsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdminPage();
  const sp = await searchParams;
  const status = sp.status === "published" || sp.status === "draft" ? sp.status : undefined;
  const rows = await getAdminPrompts(status);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-medium tracking-tight">Prompts</h1>
          <p className="mt-1 text-sm text-neutral-500">{rows.length} prompt{rows.length === 1 ? "" : "s"}</p>
        </div>
        <Link href="/admin/prompts/new" className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-neutral-800">
          + New prompt
        </Link>
      </div>

      <div className="mt-5 flex gap-2">
        <Link href="/admin/prompts" className={`rounded-full px-4 py-2 text-[13px] font-medium ${!status ? "bg-black text-white" : "border border-black/10 bg-white"}`}>
          All
        </Link>
        <Link href="/admin/prompts?status=published" className={`rounded-full px-4 py-2 text-[13px] font-medium ${status === "published" ? "bg-black text-white" : "border border-black/10 bg-white"}`}>
          Published
        </Link>
        <Link href="/admin/prompts?status=draft" className={`rounded-full px-4 py-2 text-[13px] font-medium ${status === "draft" ? "bg-black text-white" : "border border-black/10 bg-white"}`}>
          Drafts
        </Link>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-black/[0.07] bg-white">
        {rows.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="font-medium">No prompts yet.</p>
            <p className="mt-1 text-sm text-neutral-500">Create your first prompt to fill the library.</p>
            <Link href="/admin/prompts/new" className="mt-4 inline-block rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white">
              Create your first prompt
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-black/[0.05]">
            {rows.map((p) => (
              <li key={p.id} className="flex items-center gap-4 px-4 py-3 sm:px-5">
                {p.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.coverUrl} alt="" className="hidden h-12 w-10 shrink-0 rounded-lg object-cover sm:block" />
                ) : (
                  <span className="hidden h-12 w-10 shrink-0 rounded-lg bg-black/[0.06] sm:block" aria-hidden="true" />
                )}
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/prompts/${p.id}`} className="truncate text-sm font-semibold hover:underline">
                    {p.featured && <span className="mr-1 text-amber-500">★</span>}
                    {p.title}
                  </Link>
                  <p className="mt-0.5 truncate text-[13px] text-neutral-400">
                    {p.modelName ?? "—"} · {p.categoryName ?? "—"} · {Number(p.imageCount)} img · ⧉ {p.copyCount} · {formatDate(p.updatedAt)}
                  </p>
                </div>
                <span className={`hidden shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold md:inline ${p.status === "published" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                  {p.status}
                </span>
                <PromptRowActions id={p.id} status={p.status} featured={p.featured} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
