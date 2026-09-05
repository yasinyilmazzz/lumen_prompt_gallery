import Image from "next/image";
import Link from "next/link";
import type { GalleryItem } from "@/lib/queries";
import { CLOUDINARY_SIZES, responsiveSrcSet } from "@/lib/cloudinary";

export function ImageCard({ item, priority = false }: { item: GalleryItem; priority?: boolean }) {
  const alt = item.altText || `${item.title} — AI generated image`;
  return (
    <article className="group relative overflow-hidden rounded-2xl bg-ink-100">
      <Link href={`/prompts/${item.promptSlug}`} aria-label={`View prompt: ${item.title}`}>
        <div className="zoom-frame relative w-full bg-[#e9e9ee]">
          <Image
            src={item.imageUrl}
            alt={alt}
            width={item.width || 800}
            height={item.height || 1000}
            sizes={CLOUDINARY_SIZES.masonry}
            priority={priority}
            loading={priority ? undefined : "lazy"}
            className="h-auto w-full object-cover"
          />
          {/* hover overlay */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="absolute inset-x-0 bottom-0 translate-y-2 p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <p className="text-[15px] font-semibold leading-snug text-white">{item.title}</p>
            <div className="mt-1.5 flex items-center gap-2 text-xs font-medium text-white/80">
              {item.modelName && <span>{item.modelName}</span>}
              {item.modelName && item.categoryName && <span aria-hidden="true">·</span>}
              {item.categoryName && <span>{item.categoryName}</span>}
            </div>
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-1.5 text-xs font-semibold text-black">
              View prompt
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 17 17 7M8 7h9v9" />
              </svg>
            </span>
          </div>
          {item.featured && (
            <span className="absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur">
              Featured
            </span>
          )}
        </div>
      </Link>
      {/* always-visible caption for touch devices */}
      <div className="flex items-center justify-between gap-2 px-1 pb-1 pt-2.5">
        <div className="min-w-0">
          <h3 className="truncate text-[13px] font-semibold text-neutral-900">
            <Link href={`/prompts/${item.promptSlug}`}>{item.title}</Link>
          </h3>
          <p className="mt-0.5 truncate text-xs text-neutral-500">
            {[item.modelName, item.categoryName].filter(Boolean).join(" · ")}
          </p>
        </div>
        {item.modelGender && (
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
              item.modelGender === "male" ? "bg-sky-100 text-sky-800" : "bg-rose-100 text-rose-800"
            }`}
          >
            {item.modelGender}
          </span>
        )}
      </div>
    </article>
  );
}

export default function Gallery({
  items,
  eagerCount = 4,
  emptyTitle = "No visuals found",
  emptyHint = "Try a different search or filter.",
}: {
  items: GalleryItem[];
  eagerCount?: number;
  emptyTitle?: string;
  emptyHint?: string;
}) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-3xl border border-dashed border-black/15 bg-white px-6 py-20 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-black/[0.05]">
          <svg className="h-6 w-6 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16ZM7 10l2.5 2.5L15 7" />
          </svg>
        </div>
        <h2 className="mt-5 font-display text-2xl font-medium">{emptyTitle}</h2>
        <p className="mt-2 max-w-sm text-sm text-neutral-500">{emptyHint}</p>
        <Link href="/explore" className="mt-6 rounded-full bg-black px-6 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800">
          Browse everything
        </Link>
      </div>
    );
  }
  return (
    <div className="masonry">
      {items.map((item, i) => (
        <ImageCard key={item.imageId} item={item} priority={i < eagerCount} />
      ))}
    </div>
  );
}

export function preloadSrcSet(item: GalleryItem): string | undefined {
  return responsiveSrcSet(item.imageUrl);
}
