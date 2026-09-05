import type { Metadata } from "next";
import Link from "next/link";
import { ModelAvatar, PageHero } from "@/components/ui";
import { getModelCounts, getModels } from "@/lib/queries";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "AI Models — consistent characters",
  description:
    "Meet the consistent AI models behind every shoot. Follow a muse across editorials, portraits and campaigns.",
};

export default async function ModelsPage() {
  const [models, counts] = await Promise.all([getModels(), getModelCounts()]);
  return (
    <div>
      <PageHero
        eyebrow="Consistent characters"
        title="The muses"
        description="Every visual in this library is built on a consistent model — the same face, endless stories. Pick a muse and explore their world."
      />
      <div className="mx-auto grid max-w-[1600px] gap-5 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
        {models.map((m) => (
          <Link
            key={m.id}
            href={`/models/${m.slug}`}
            className="group rounded-3xl border border-black/[0.07] bg-white p-8 text-center transition hover:border-black/25 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)]"
          >
            <div className="flex justify-center">
              <ModelAvatar src={m.imageUrl} name={m.name} size={120} />
            </div>
            <h2 className="mt-5 font-display text-2xl font-medium">{m.name}</h2>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">{m.gender}</p>
            <p className="clamp-3 mx-auto mt-3 max-w-sm text-sm leading-relaxed text-neutral-500">{m.description}</p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-[#9a6b2f]">
              {counts[m.slug] ?? 0} visuals →
            </p>
          </Link>
        ))}
        {models.length === 0 && <p className="text-sm text-neutral-500">No models yet.</p>}
      </div>
    </div>
  );
}
