import type { Metadata } from "next";
import Gallery from "@/components/Gallery";
import { FilterPill, PageHero } from "@/components/ui";
import { countGalleryItems, getCategories, getGalleryItems } from "@/lib/queries";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Female model AI visuals & prompts",
  description:
    "Explore AI-generated fashion editorials, beauty close-ups and night-city stories — every frame with its copyable prompt.",
};

export default async function FemalePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const sp = await searchParams;
  const category = sp.category || undefined;
  const [items, total, categories] = await Promise.all([
    getGalleryItems({ gender: "female", category }, 48),
    countGalleryItems({ gender: "female", category }),
    getCategories(),
  ]);

  return (
    <div>
      <PageHero
        eyebrow="Female muses"
        title="Feminine frames, editorial prompts"
        description="Couture editorials, sculpted-light beauty and metropolitan nights — all built on consistent female models. Open any frame to copy its prompt."
        count={total}
      />
      <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6">
        <div className="thin-scroll flex items-center gap-2 overflow-x-auto pb-1" role="group" aria-label="Category filter">
          <FilterPill href="/female" active={!category}>
            Every category
          </FilterPill>
          {categories.map((c) => (
            <FilterPill key={c.id} href={`/female?category=${c.slug}`} active={category === c.slug}>
              {c.name}
            </FilterPill>
          ))}
        </div>
        <div className="mt-8">
          <Gallery items={items} eagerCount={4} emptyTitle="No female visuals yet" emptyHint="New shoots are added regularly — check the full explore page." />
        </div>
      </div>
    </div>
  );
}
