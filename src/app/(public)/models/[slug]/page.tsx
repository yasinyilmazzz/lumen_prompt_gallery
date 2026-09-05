import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Gallery from "@/components/Gallery";
import { ModelAvatar } from "@/components/ui";
import { countGalleryItems, getGalleryItems, getModelBySlug, getModels } from "@/lib/queries";
import { siteUrl } from "@/lib/utils";

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const models = await getModels();
    return models.map((m) => ({ slug: m.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const model = await getModelBySlug(slug).catch(() => null);
  if (!model) return { title: "Model not found" };
  const title = `${model.name} — AI model gallery & prompts`;
  const description =
    model.description || `Explore every AI visual featuring ${model.name} and copy the exact prompts.`;
  return {
    title,
    description,
    alternates: { canonical: `${siteUrl()}/models/${model.slug}` },
    openGraph: {
      title,
      description,
      type: "profile",
      ...(model.imageUrl ? { images: [{ url: model.imageUrl, alt: `${model.name} portrait` }] } : {}),
    },
  };
}

export default async function ModelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const model = await getModelBySlug(slug).catch(() => null);
  if (!model || !model.isActive) notFound();

  const [items, total] = await Promise.all([
    getGalleryItems({ model: model.slug }, 48),
    countGalleryItems({ model: model.slug }),
  ]);

  return (
    <div>
      <div className="border-b border-black/[0.07] bg-white">
        <div className="mx-auto flex max-w-[1600px] flex-col items-start gap-6 px-4 py-10 sm:flex-row sm:items-center sm:px-6 sm:py-14">
          <ModelAvatar src={model.imageUrl} name={model.name} size={128} />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9a6b2f]">
              {model.gender} model
            </p>
            <h1 className="mt-2 font-display text-[clamp(2rem,4.5vw,3.2rem)] font-medium tracking-tight">
              {model.name}
            </h1>
            {model.description && (
              <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-neutral-500">{model.description}</p>
            )}
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">
              {total} visual{total === 1 ? "" : "s"}
            </p>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6">
        <Gallery items={items} eagerCount={4} emptyTitle={`No visuals for ${model.name} yet`} emptyHint="New shoots are on the way." />
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: siteUrl() },
              { "@type": "ListItem", position: 2, name: "Models", item: `${siteUrl()}/models` },
              { "@type": "ListItem", position: 3, name: model.name, item: `${siteUrl()}/models/${model.slug}` },
            ],
          }),
        }}
      />
    </div>
  );
}
