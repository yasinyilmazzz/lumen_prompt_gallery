import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { images, prompts } from "@/db/schema";
import { requireAdminPage } from "../layout";
import { ConfirmButton } from "@/components/admin/admin-ui";
import { deleteImage } from "@/lib/admin-actions";

export const dynamic = "force-dynamic";

export default async function AdminImagesPage() {
  await requireAdminPage();
  const rows = await db
    .select({
      id: images.id,
      imageUrl: images.imageUrl,
      thumbnailUrl: images.thumbnailUrl,
      altText: images.altText,
      sortOrder: images.sortOrder,
      promptId: images.promptId,
      promptTitle: prompts.title,
      promptStatus: prompts.status,
    })
    .from(images)
    .innerJoin(prompts, eq(prompts.id, images.promptId))
    .orderBy(desc(images.createdAt))
    .limit(100);

  return (
    <div>
      <h1 className="font-display text-3xl font-medium tracking-tight">Images</h1>
      <p className="mb-6 mt-1 text-sm text-neutral-500">
        Latest {rows.length} image{rows.length === 1 ? "" : "s"} — manage per-prompt from the prompt editor.
      </p>
      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-black/15 bg-white px-6 py-14 text-center">
          <p className="font-medium">No images yet.</p>
          <p className="mt-1 text-sm text-neutral-500">Open a prompt and upload its first visual.</p>
          <Link href="/admin/prompts" className="mt-4 inline-block rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white">
            Go to prompts
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
          {rows.map((img) => (
            <div key={img.id} className="overflow-hidden rounded-2xl border border-black/[0.07] bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.thumbnailUrl || img.imageUrl} alt="" className="aspect-[4/5] w-full object-cover" loading="lazy" />
              <div className="p-3">
                <Link href={`/admin/prompts/${img.promptId}`} className="truncate text-[13px] font-semibold hover:underline">
                  {img.promptTitle}
                </Link>
                <p className="mt-0.5 truncate text-xs text-neutral-400">#{img.sortOrder + 1} · {img.promptStatus}</p>
                <div className="mt-1.5 flex justify-end">
                  <ConfirmButton
                    id={img.id}
                    title="Delete image?"
                    message="The image record is removed and its CDN asset is destroyed best-effort. This cannot be undone."
                    action={deleteImage}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
