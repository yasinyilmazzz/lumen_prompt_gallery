import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Gallery from "@/components/Gallery";
import { PageHero } from "@/components/ui";
import { countGalleryItems, getCategories, getCategoryBySlug, getGalleryItems } from "@/lib/queries";
import { siteUrl } from "@/lib/utils";

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const cats = await getCategories();
    return cats.map((c) => ({ slug: c.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const cat = await getCategoryBySlug(slug).catch(() => null);
  if (!cat) return { title: "Category not found" };
  const title = `${cat.name} AI visuals & prompts`;
  const description = cat.description || `Explore ${cat.name} AI visuals and copy the exact prompts.`;
  return {
    title,
    description,
    alternates: { canonical: `${siteUrl()}/categories/${cat.slug}` },
    openGraph: {
      title,
      description,
      ...(cat.coverImageUrl ? { images: [{ url: cat.coverImageUrl, alt: `${cat.name} cover` }] } : {}),
    },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cat = await getCategoryBySlug(slug).catch(() => null);
  if (!cat || !cat.isActive) notFound();

  const [items, total] = await Promise.all([
    getGalleryItems({ category: cat.slug }, 48),
    countGalleryItems({ category: cat.slug }),
  ]);

  return (
    <div>
      <PageHero eyebrow="Category" title={cat.name} description={cat.description || undefined} count={total} />
      <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6">
        <Gallery items={items} eagerCount={4} emptyTitle={`No visuals in ${cat.name} yet`} emptyHint="New shoots are added regularly." />
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: siteUrl() },
              { "@type": "ListItem", position: 2, name: "Categories", item: `${siteUrl()}/categories` },
              { "@type": "ListItem", position: 3, name: cat.name, item: `${siteUrl()}/categories/${cat.slug}` },
            ],
          }),
        }}
      />
    </div>
  );
}
