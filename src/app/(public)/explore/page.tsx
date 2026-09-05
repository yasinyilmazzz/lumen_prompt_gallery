import type { Metadata } from "next";
import Gallery from "@/components/Gallery";
import { FilterPill, PageHero } from "@/components/ui";
import { countGalleryItems, getCategories, getGalleryItems, type ExploreFilters } from "@/lib/queries";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Explore all AI visuals & prompts",
  description:
    "Browse the full AI visual prompt library — filter by gender, category and search every prompt, model and tag.",
};

const PAGE_SIZE = 24;

type SearchParams = Promise<{
  q?: string;
  gender?: string;
  category?: string;
  featured?: string;
  page?: string;
}>;

function pageUrl(params: Record<string, string | undefined>, page: number): string {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.gender) sp.set("gender", params.gender);
  if (params.category) sp.set("category", params.category);
  if (params.featured) sp.set("featured", params.featured);
  if (page > 1) sp.set("page", String(page));
  const qs = sp.toString();
  return `/explore${qs ? `?${qs}` : ""}`;
}

export default async function ExplorePage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const gender = sp.gender === "male" || sp.gender === "female" ? sp.gender : undefined;
  const category = sp.category || undefined;
  const q = sp.q?.trim() || undefined;
  const featured = sp.featured === "1" ? true : undefined;
  const page = Math.max(1, Number(sp.page) || 1);

  const filters: ExploreFilters = { gender, category, q, featured };
  const [items, total, categories] = await Promise.all([
    getGalleryItems(filters, PAGE_SIZE, (page - 1) * PAGE_SIZE),
    countGalleryItems(filters),
    getCategories(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const base = { q: sp.q, gender: sp.gender, category: sp.category, featured: sp.featured };

  return (
    <div>
      <PageHero
        eyebrow="The library"
        title={q ? `Results for “${q}”` : "Explore every visual"}
        description="Filter by gender or category, search across titles, prompts and models. Every frame carries its exact prompt."
        count={total}
      />

      <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6">
        {/* gender + featured row */}
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Gender filter">
          <FilterPill href={pageUrl({ ...base, gender: undefined }, 1)} active={!gender}>
            All
          </FilterPill>
          <FilterPill href={pageUrl({ ...base, gender: "male" }, 1)} active={gender === "male"}>
            Male
          </FilterPill>
          <FilterPill href={pageUrl({ ...base, gender: "female" }, 1)} active={gender === "female"}>
            Female
          </FilterPill>
          <span className="mx-1 h-5 w-px bg-black/10" aria-hidden="true" />
          <FilterPill href={pageUrl({ ...base, featured: featured ? undefined : "1" }, 1)} active={featured}>
            ★ Featured
          </FilterPill>
        </div>

        {/* category row */}
        <div className="thin-scroll mt-3 flex items-center gap-2 overflow-x-auto pb-1" role="group" aria-label="Category filter">
          <FilterPill href={pageUrl({ ...base, category: undefined }, 1)} active={!category}>
            Every category
          </FilterPill>
          {categories.map((c) => (
            <FilterPill
              key={c.id}
              href={pageUrl({ ...base, category: c.slug }, 1)}
              active={category === c.slug}
            >
              {c.name}
            </FilterPill>
          ))}
        </div>

        <div className="mt-8">
          <Gallery
            items={items}
            eagerCount={4}
            emptyTitle={q ? `Nothing found for “${q}”` : "No visuals here yet"}
            emptyHint="Try clearing a filter or searching for cinematic, streetwear, Emma…"
          />
        </div>

        {/* pagination */}
        {totalPages > 1 && (
          <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
            {page > 1 && (
              <a
                href={pageUrl(base, page - 1)}
                className="rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-medium transition hover:border-black"
              >
                ← Newer
              </a>
            )}
            <span className="px-3 text-sm text-neutral-500" aria-current="page">
              Page {page} of {totalPages}
            </span>
            {page < totalPages && (
              <a
                href={pageUrl(base, page + 1)}
                className="rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                Older →
              </a>
            )}
          </nav>
        )}
      </div>
    </div>
  );
}
