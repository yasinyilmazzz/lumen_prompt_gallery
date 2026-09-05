import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Gallery from "@/components/Gallery";
import { PageHero } from "@/components/ui";
import { countGalleryItems, getGalleryItems, getTagBySlug } from "@/lib/queries";
import { siteUrl } from "@/lib/utils";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getTagBySlug(slug).catch(() => null);
  if (!tag) return { title: "Tag not found" };
  return {
    title: `#${tag.name} — AI visuals & prompts`,
    description: `Explore every AI visual tagged “${tag.name}” and copy the exact prompts.`,
    alternates: { canonical: `${siteUrl()}/tags/${tag.slug}` },
  };
}

export default async function TagPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tag = await getTagBySlug(slug).catch(() => null);
  if (!tag) notFound();

  const [items, total] = await Promise.all([
    getGalleryItems({ tag: tag.slug }, 48),
    countGalleryItems({ tag: tag.slug }),
  ]);

  return (
    <div>
      <PageHero eyebrow="Tag" title={`#${tag.name}`} description={`Every frame carrying the “${tag.name}” mood.`} count={total} />
      <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6">
        <Gallery items={items} eagerCount={4} emptyTitle={`Nothing tagged “${tag.name}” yet`} emptyHint="Try another tag from the tags page." />
      </div>
    </div>
  );
}
