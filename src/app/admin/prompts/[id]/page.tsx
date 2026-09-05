import Link from "next/link";
import { notFound } from "next/navigation";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { imageTags, images, prompts, tags } from "@/db/schema";
import { getCategories, getModels, getTags } from "@/lib/queries";
import { requireAdminPage } from "../../layout";
import PromptForm from "@/components/admin/PromptForm";

export const dynamic = "force-dynamic";

export default async function AdminPromptEditor({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPage();
  const { id } = await params;
  const isNew = id === "new";

  const [models, categories, allTags] = await Promise.all([getModels(false), getCategories(false), getTags(200)]);

  if (isNew) {
    return (
      <div>
        <BackLink />
        <h1 className="mt-2 font-display text-3xl font-medium tracking-tight">New prompt</h1>
        <p className="mb-6 mt-1 text-sm text-neutral-500">Write the recipe, then attach the visuals.</p>
        <PromptForm mode="create" models={models} categories={categories} allTagNames={allTags.map((t) => t.name)} />
      </div>
    );
  }

  const [prompt] = await db.select().from(prompts).where(eq(prompts.id, id)).limit(1);
  if (!prompt) notFound();

  const promptImages = await db.select().from(images).where(eq(images.promptId, id));
  let tagNames: string[] = [];
  if (promptImages.length > 0) {
    const rows = await db
      .select({ name: tags.name })
      .from(tags)
      .innerJoin(imageTags, eq(imageTags.tagId, tags.id))
      .where(
        inArray(
          imageTags.imageId,
          promptImages.map((i) => i.id)
        )
      );
    tagNames = [...new Set(rows.map((r) => r.name))];
  }

  return (
    <div>
      <BackLink />
      <div className="mb-6 mt-2 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-medium tracking-tight">Edit prompt</h1>
          <p className="mt-1 font-mono text-[13px] text-neutral-400">/{prompt.slug}</p>
        </div>
        {prompt.status === "published" && (
          <Link
            href={`/prompts/${prompt.slug}`}
            target="_blank"
            className="rounded-full border border-black/15 bg-white px-5 py-2.5 text-sm font-medium transition hover:border-black"
          >
            View live ↗
          </Link>
        )}
      </div>
      <PromptForm
        mode="edit"
        initial={prompt}
        initialImages={promptImages}
        initialTagNames={tagNames}
        models={models}
        categories={categories}
        allTagNames={allTags.map((t) => t.name)}
      />
    </div>
  );
}

function BackLink() {
  return (
    <Link href="/admin/prompts" className="text-sm font-medium text-neutral-500 hover:text-black">
      ← All prompts
    </Link>
  );
}
