import type { Metadata } from "next";
import Gallery from "@/components/Gallery";
import { FilterPill, PageHero } from "@/components/ui";
import { countGalleryItems, getCategories, getGalleryItems } from "@/lib/queries";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Male model AI visuals & prompts",
  description:
    "Explore AI-generated menswear editorials, moody portraits and streetwear stories — every frame with its copyable prompt.",
};

export default async function MalePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const sp = await searchParams;
  const category = sp.category || undefined;
  const [items, total, categories] = await Promise.all([
    getGalleryItems({ gender: "male", category }, 48),
    countGalleryItems({ gender: "male", category }),
    getCategories(),
  ]);

  return (
    <div>
      <PageHero
        eyebrow="Male muses"
        title="Masculine frames, cinematic prompts"
        description="Menswear editorials, noir portraits and urban stories — all built on consistent male models. Open any frame to copy its prompt."
        count={total}
      />
      <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6">
        <div className="thin-scroll flex items-center gap-2 overflow-x-auto pb-1" role="group" aria-label="Category filter">
          <FilterPill href="/male" active={!category}>
            Every category
          </FilterPill>
          {categories.map((c) => (
            <FilterPill key={c.id} href={`/male?category=${c.slug}`} active={category === c.slug}>
              {c.name}
            </FilterPill>
          ))}
        </div>
        <div className="mt-8">
          <Gallery items={items} eagerCount={4} emptyTitle="No male visuals yet" emptyHint="New shoots are added regularly — check the full explore page." />
        </div>
      </div>
    </div>
  );
}
