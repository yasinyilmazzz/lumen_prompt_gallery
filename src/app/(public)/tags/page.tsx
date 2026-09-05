import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui";
import { getTags } from "@/lib/queries";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Tags — every mood & style",
  description: "Browse the prompt library by tag — cinematic, editorial, moody, street-style and more.",
};

export default async function TagsPage() {
  const tags = await getTags(100);
  return (
    <div>
      <PageHero
        eyebrow="Micro-moods"
        title="Tags"
        description="Small labels, big aesthetics. Follow a tag to collect every frame that carries its mood."
      />
      <div className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6">
        <div className="flex flex-wrap gap-2.5">
          {tags.map((t) => (
            <Link
              key={t.id}
              href={`/tags/${t.slug}`}
              className="rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 transition hover:border-black hover:text-black"
            >
              #{t.name}
            </Link>
          ))}
          {tags.length === 0 && <p className="text-sm text-neutral-500">No tags yet.</p>}
        </div>
      </div>
    </div>
  );
}
