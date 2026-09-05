import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/ui";
import { getCategories, getCategoryCounts } from "@/lib/queries";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Categories — browse by aesthetic",
  description: "Browse the prompt library by category — fashion, editorial, portrait, streetwear, beauty and more.",
};

export default async function CategoriesPage() {
  const [categories, counts] = await Promise.all([getCategories(), getCategoryCounts()]);
  return (
    <div>
      <PageHero
        eyebrow="Shelves of the library"
        title="Categories"
        description="Each category is a curated shelf with its own mood. Step into one and start collecting prompts."
      />
      <div className="mx-auto grid max-w-[1600px] gap-4 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/categories/${c.slug}`}
            className="group relative min-h-[220px] overflow-hidden rounded-3xl bg-neutral-900 text-white"
          >
            {c.coverImageUrl && (
              <Image
                src={c.coverImageUrl}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                loading="lazy"
                className="object-cover opacity-75 transition duration-500 group-hover:scale-[1.04] group-hover:opacity-65"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" aria-hidden="true" />
            <div className="absolute inset-x-0 bottom-0 p-6">
              <h2 className="font-display text-2xl font-medium">{c.name}</h2>
              {c.description && <p className="clamp-2 mt-1.5 text-[13px] leading-relaxed text-white/70">{c.description}</p>}
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-white/80">
                {counts[c.slug] ?? 0} visuals →
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
