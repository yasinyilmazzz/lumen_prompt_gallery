import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import CopyButton from "@/components/CopyButton";
import Gallery from "@/components/Gallery";
import { SectionHeading, TagBadge } from "@/components/ui";
import { CLOUDINARY_SIZES } from "@/lib/cloudinary";
import { getPromptBySlug, getRelatedPrompts } from "@/lib/queries";
import { siteUrl, timeAgo, truncate } from "@/lib/utils";
import { db } from "@/db";
import { prompts } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPromptBySlug(slug).catch(() => null);
  if (!data) return { title: "Prompt not found" };
  const { prompt, model, category } = data;
  const title = prompt.seoTitle || `${prompt.title} AI Image Prompt`;
  const description =
    prompt.seoDescription ||
    truncate(
      `${prompt.title} — a ${category?.name ?? "curated"} AI image prompt${model ? ` featuring ${model.name}` : ""}. View and copy the exact prompt.`,
      160
    );
  const cover = data.images[0];
  return {
    title,
    description,
    alternates: { canonical: `${siteUrl()}/prompts/${prompt.slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      ...(cover ? { images: [{ url: cover.imageUrl, alt: cover.altText || prompt.title }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(cover ? { images: [cover.imageUrl] } : {}),
    },
  };
}

export default async function PromptPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getPromptBySlug(slug).catch(() => null);
  if (!data) notFound();
  const { prompt, model, category, images, tags } = data;

  // Fire-and-forget view counter (analytics-ready)
  db.update(prompts)
    .set({ viewCount: sql`${prompts.viewCount} + 1` })
    .where(eq(prompts.id, prompt.id))
    .catch(() => {});

  const related = await getRelatedPrompts(prompt.id, prompt.categoryId, 8).catch(() => []);
  const [cover, ...rest] = images;

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:py-12">
      {/* breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-[13px] text-neutral-500">
        <Link href="/" className="hover:text-black">Home</Link>
        <span aria-hidden="true">/</span>
        <Link href="/explore" className="hover:text-black">Explore</Link>
        {category && (
          <>
            <span aria-hidden="true">/</span>
            <Link href={`/categories/${category.slug}`} className="hover:text-black">{category.name}</Link>
          </>
        )}
        <span aria-hidden="true">/</span>
        <span className="font-medium text-black" aria-current="page">{prompt.title}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.15fr_1fr] xl:gap-14">
        {/* ------- images ------- */}
        <div className="min-w-0">
          {cover ? (
            <figure className="overflow-hidden rounded-3xl bg-[#e9e9ee]">
              <Image
                src={cover.imageUrl}
                alt={cover.altText || prompt.title}
                width={cover.width || 960}
                height={cover.height || 1200}
                sizes={CLOUDINARY_SIZES.detail}
                priority
                className="h-auto w-full object-cover"
              />
            </figure>
          ) : (
            <div className="grid h-96 place-items-center rounded-3xl bg-neutral-100 text-sm text-neutral-500">
              No images yet
            </div>
          )}
          {rest.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              {rest.map((img) => (
                <figure key={img.id} className="overflow-hidden rounded-2xl bg-[#e9e9ee]">
                  <Image
                    src={img.imageUrl}
                    alt={img.altText || prompt.title}
                    width={img.width || 640}
                    height={img.height || 800}
                    sizes="(max-width: 1024px) 50vw, 30vw"
                    loading="lazy"
                    className="h-auto w-full object-cover"
                  />
                </figure>
              ))}
            </div>
          )}
        </div>

        {/* ------- prompt panel ------- */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {category && (
              <Link
                href={`/categories/${category.slug}`}
                className="rounded-full bg-black px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-neutral-800"
              >
                {category.name}
              </Link>
            )}
            {model && (
              <Link
                href={`/models/${model.slug}`}
                className="rounded-full border border-black/12 bg-white px-3.5 py-1.5 text-xs font-semibold transition hover:border-black"
              >
                {model.name} · {model.gender}
              </Link>
            )}
            {prompt.featured && (
              <span className="rounded-full bg-[#f3e7d3] px-3.5 py-1.5 text-xs font-semibold text-[#9a6b2f]">
                ★ Featured
              </span>
            )}
          </div>

          <h1 className="mt-4 font-display text-[clamp(1.9rem,3.5vw,2.8rem)] font-medium leading-tight tracking-tight">
            {prompt.title}
          </h1>
          <p className="mt-2 text-[13px] text-neutral-400">
            Published {timeAgo(prompt.publishedAt ?? prompt.createdAt)}
            {prompt.copyCount > 0 && <> · Copied {prompt.copyCount}×</>}
          </p>

          {/* prompt block */}
          <div className="mt-6 overflow-hidden rounded-2xl border border-black/10 bg-[#141416]">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
                Text-to-image prompt
              </p>
              <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-white/70">
                {prompt.prompt.length} chars
              </span>
            </div>
            <p className="prompt-body whitespace-pre-wrap px-5 py-5 text-neutral-100">{prompt.prompt}</p>
            <div className="flex flex-col gap-2 border-t border-white/10 p-4 sm:flex-row">
              <div className="flex-1">
                <CopyButton text={prompt.prompt} promptId={prompt.id} label="Copy Prompt" size="lg" variant="light" />
              </div>
            </div>
          </div>

          {/* negative prompt */}
          {prompt.negativePrompt && (
            <div className="mt-4 overflow-hidden rounded-2xl border border-black/10 bg-white">
              <p className="border-b border-black/[0.07] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                Negative prompt
              </p>
              <p className="prompt-body whitespace-pre-wrap px-5 py-4 text-neutral-700">{prompt.negativePrompt}</p>
              <div className="px-4 pb-4">
                <CopyButton text={prompt.negativePrompt} label="Copy negative" size="md" variant="outline" />
              </div>
            </div>
          )}

          {/* meta grid */}
          <dl className="mt-6 grid grid-cols-2 gap-3">
            {model && (
              <div className="rounded-2xl border border-black/[0.07] bg-white p-4">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">Model</dt>
                <dd className="mt-1.5">
                  <Link href={`/models/${model.slug}`} className="text-sm font-semibold hover:underline">
                    {model.name}
                  </Link>
                </dd>
              </div>
            )}
            {category && (
              <div className="rounded-2xl border border-black/[0.07] bg-white p-4">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">Category</dt>
                <dd className="mt-1.5">
                  <Link href={`/categories/${category.slug}`} className="text-sm font-semibold hover:underline">
                    {category.name}
                  </Link>
                </dd>
              </div>
            )}
          </dl>

          {/* tags */}
          {tags.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {tags.map((t) => (
                <TagBadge key={t.slug} slug={t.slug} name={t.name} />
              ))}
            </div>
          )}

          {/* share */}
          <div className="mt-6 flex items-center gap-2">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${prompt.title} — AI prompt`)}&url=${encodeURIComponent(`${siteUrl()}/prompts/${prompt.slug}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-black/12 bg-white px-4 py-2 text-[13px] font-medium transition hover:border-black"
            >
              Share on X
            </a>
            <a
              href={`https://pinterest.com/pin/create/button/?description=${encodeURIComponent(prompt.title)}&url=${encodeURIComponent(`${siteUrl()}/prompts/${prompt.slug}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-black/12 bg-white px-4 py-2 text-[13px] font-medium transition hover:border-black"
            >
              Pin it
            </a>
          </div>
        </div>
      </div>

      {/* ------- related ------- */}
      {related.length > 0 && (
        <section className="mt-16" aria-labelledby="related">
          <SectionHeading
            eyebrow="Keep discovering"
            title="Related visuals"
            hint={category ? `More from ${category.name} and beyond.` : "More frames you may love."}
          />
          <Gallery items={related} eagerCount={0} />
        </section>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ImageObject",
            name: prompt.title,
            description: truncate(prompt.prompt, 200),
            ...(cover ? { contentUrl: cover.imageUrl, thumbnailUrl: cover.thumbnailUrl || cover.imageUrl } : {}),
            author: { "@type": "Organization", name: "LUMEN" },
          }),
        }}
      />
    </div>
  );
}
