import Image from "next/image";
import Link from "next/link";
import Gallery from "@/components/Gallery";
import { ModelAvatar, SectionHeading, ViewAllLink } from "@/components/ui";
import { getCategories, getCategoryCounts, getGalleryItems, getModelCounts, getModels } from "@/lib/queries";

export const revalidate = 60;

export default async function HomePage() {
  const [featured, latest, models, categories, catCounts, modelCounts] = await Promise.all([
    getGalleryItems({ featured: true }, 8),
    getGalleryItems({}, 12),
    getModels(),
    getCategories(),
    getCategoryCounts(),
    getModelCounts(),
  ]);

  const heroImages = [...featured, ...latest].slice(0, 5);
  const maleModels = models.filter((m) => m.gender === "male");
  const femaleModels = models.filter((m) => m.gender === "female");

  return (
    <div>
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden border-b border-black/[0.07] bg-[#101012] text-white">
        <div className="mx-auto grid max-w-[1600px] gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:py-20">
          <div className="fade-up relative z-10">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
              AI Visual Prompt Library
            </p>
            <h1 className="mt-6 font-display text-[clamp(2.6rem,6vw,4.8rem)] font-medium leading-[1.02] tracking-tight">
              Every frame,
              <br />
              <span className="italic text-[#d9b67c]">every prompt.</span>
            </h1>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-white/65">
              Discover cinematic AI visuals built on consistent models. Open any image, study the
              exact prompt — and copy it in one click.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/explore"
                className="rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-black transition hover:bg-neutral-200"
              >
                Explore the library
              </Link>
              <Link
                href="/models"
                className="rounded-full border border-white/20 px-7 py-3.5 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
              >
                Meet the models
              </Link>
            </div>
            <dl className="mt-10 flex gap-8 text-sm">
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/45">Visuals</dt>
                <dd className="mt-1 font-display text-2xl">{latest.length * 3}+</dd>
              </div>
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/45">Models</dt>
                <dd className="mt-1 font-display text-2xl">{models.length}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/45">Categories</dt>
                <dd className="mt-1 font-display text-2xl">{categories.length}</dd>
              </div>
            </dl>
          </div>

          {/* hero collage */}
          <div className="fade-up stagger-1 relative hidden grid-cols-3 gap-3 lg:grid" aria-hidden="true">
            {heroImages.slice(0, 3).map((img, i) => (
              <div
                key={img.imageId}
                className={`overflow-hidden rounded-2xl ${i === 1 ? "mt-10" : i === 2 ? "-mt-4" : ""}`}
              >
                <Image
                  src={img.imageUrl}
                  alt=""
                  width={400}
                  height={560}
                  priority={i === 0}
                  className="h-72 w-full object-cover xl:h-80"
                />
              </div>
            ))}
            <div className="col-span-3 mt-1 flex items-center gap-3 rounded-2xl border border-white/12 bg-white/[0.05] p-4 backdrop-blur">
              <div className="flex -space-x-3">
                {models.slice(0, 4).map((m) => (
                  <span key={m.id} className="overflow-hidden rounded-full ring-2 ring-[#101012]">
                    <ModelAvatar src={m.imageUrl} name={m.name} size={36} />
                  </span>
                ))}
              </div>
              <p className="text-[13px] leading-snug text-white/70">
                Consistent characters across every shoot —{" "}
                <span className="font-semibold text-white">one model, infinite stories.</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1600px] space-y-20 px-4 py-14 sm:px-6">
        {/* ================= FEATURED ================= */}
        {featured.length > 0 && (
          <section aria-labelledby="featured">
            <SectionHeading
              eyebrow="Curator's selection"
              title="Featured frames"
              hint="Hand-picked shoots with the strongest prompts in the library."
              action={<ViewAllLink href="/explore?featured=1">All featured</ViewAllLink>}
            />
            <Gallery items={featured} eagerCount={4} />
          </section>
        )}

        {/* ================= CATEGORIES ================= */}
        <section aria-labelledby="categories">
          <SectionHeading
            eyebrow="Browse by mood"
            title="Categories"
            hint="From haute couture to night-city travel — every shelf is a new aesthetic."
            action={<ViewAllLink href="/categories">All categories</ViewAllLink>}
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {categories.slice(0, 8).map((cat, i) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className={`group relative overflow-hidden rounded-2xl bg-neutral-900 text-white ${
                  i === 0 ? "col-span-2 row-span-2 min-h-[280px] sm:min-h-[340px]" : "min-h-[150px] sm:min-h-[164px]"
                }`}
              >
                {cat.coverImageUrl && (
                  <Image
                    src={cat.coverImageUrl}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, 25vw"
                    loading="lazy"
                    className="object-cover opacity-80 transition duration-500 group-hover:scale-[1.04] group-hover:opacity-70"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" aria-hidden="true" />
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                  <p className={`font-display font-medium tracking-tight ${i === 0 ? "text-2xl sm:text-3xl" : "text-lg"}`}>
                    {cat.name}
                  </p>
                  <p className="mt-1 text-xs font-medium text-white/70">
                    {catCounts[cat.slug] ?? 0} visuals
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ================= MODELS ================= */}
        <section aria-labelledby="models" className="grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="Male muse"
              title="Alex's world"
              action={<ViewAllLink href="/male">Male gallery</ViewAllLink>}
            />
            <div className="space-y-4">
              {maleModels.map((m) => (
                <Link
                  key={m.id}
                  href={`/models/${m.slug}`}
                  className="group flex items-center gap-5 rounded-3xl border border-black/[0.07] bg-white p-5 transition hover:border-black/25 hover:shadow-[0_16px_40px_rgba(0,0,0,0.07)]"
                >
                  <ModelAvatar src={m.imageUrl} name={m.name} size={88} />
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-xl font-medium">{m.name}</p>
                    <p className="clamp-2 mt-1 text-sm leading-relaxed text-neutral-500">{m.description}</p>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#9a6b2f]">
                      {modelCounts[m.slug] ?? 0} visuals →
                    </p>
                  </div>
                </Link>
              ))}
              {maleModels.length === 0 && <p className="text-sm text-neutral-500">No male models yet.</p>}
            </div>
          </div>
          <div>
            <SectionHeading
              eyebrow="Female muse"
              title="Emma's world"
              action={<ViewAllLink href="/female">Female gallery</ViewAllLink>}
            />
            <div className="space-y-4">
              {femaleModels.map((m) => (
                <Link
                  key={m.id}
                  href={`/models/${m.slug}`}
                  className="group flex items-center gap-5 rounded-3xl border border-black/[0.07] bg-white p-5 transition hover:border-black/25 hover:shadow-[0_16px_40px_rgba(0,0,0,0.07)]"
                >
                  <ModelAvatar src={m.imageUrl} name={m.name} size={88} />
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-xl font-medium">{m.name}</p>
                    <p className="clamp-2 mt-1 text-sm leading-relaxed text-neutral-500">{m.description}</p>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#9a6b2f]">
                      {modelCounts[m.slug] ?? 0} visuals →
                    </p>
                  </div>
                </Link>
              ))}
              {femaleModels.length === 0 && <p className="text-sm text-neutral-500">No female models yet.</p>}
            </div>
          </div>
        </section>

        {/* ================= LATEST ================= */}
        <section aria-labelledby="latest">
          <SectionHeading
            eyebrow="Fresh from the studio"
            title="Latest additions"
            hint="The newest prompts and frames added to the collection."
            action={<ViewAllLink href="/explore">Explore all</ViewAllLink>}
          />
          <Gallery items={latest} eagerCount={0} />
        </section>

        {/* ================= CTA ================= */}
        <section className="overflow-hidden rounded-3xl bg-[#101012] px-6 py-14 text-center text-white sm:px-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#d9b67c]">Start creating</p>
          <h2 className="mx-auto mt-3 max-w-xl font-display text-[clamp(1.8rem,4vw,2.8rem)] font-medium leading-tight">
            Find a frame you love. Copy the prompt. Make it yours.
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/explore" className="rounded-full bg-white px-7 py-3 text-sm font-semibold text-black transition hover:bg-neutral-200">
              Browse all visuals
            </Link>
            <Link href="/categories/editorial" className="rounded-full border border-white/25 px-7 py-3 text-sm font-semibold transition hover:bg-white/10">
              Editorial picks
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
