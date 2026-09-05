import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui";

export const metadata: Metadata = {
  title: "About the library",
  description: "How the LUMEN visual prompt library works — consistent models, curated prompts, one-click copy.",
};

const STEPS = [
  { n: "01", title: "Consistent models", body: "Every shoot is built on a recurring muse — Alex and Emma — so styles stay comparable and characters stay recognizable." },
  { n: "02", title: "Real, copyable prompts", body: "No teasers. Each visual carries the full text-to-image prompt (and negative prompt when used) exactly as crafted." },
  { n: "03", title: "Curated shelves", body: "Categories and tags act as curated shelves — fashion, editorial, beauty, night-city — so you can collect moods, not just images." },
];

export default function AboutPage() {
  return (
    <div>
      <PageHero
        eyebrow="The idea"
        title="A library, not a feed"
        description="LUMEN is a curated collection of AI-generated visuals where the prompt is the protagonist. Discover a frame, study its recipe, copy it in one click."
      />
      <div className="mx-auto max-w-[1100px] px-4 py-12 sm:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="rounded-3xl border border-black/[0.07] bg-white p-7">
              <p className="font-display text-3xl text-[#9a6b2f]">{s.n}</p>
              <h2 className="mt-3 font-display text-xl font-medium">{s.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-neutral-500">{s.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 rounded-3xl bg-[#101012] p-8 text-white sm:p-10">
          <h2 className="font-display text-2xl font-medium">How to use a prompt</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-[15px] leading-relaxed text-white/75">
            <li>Open any visual and read the full prompt.</li>
            <li>Hit “Copy Prompt” — it lands on your clipboard instantly.</li>
            <li>Paste it into your favorite image generator and iterate.</li>
            <li>Swap the model descriptors to restyle it with your own muse.</li>
          </ol>
          <Link href="/explore" className="mt-7 inline-block rounded-full bg-white px-7 py-3 text-sm font-semibold text-black transition hover:bg-neutral-200">
            Start exploring
          </Link>
        </div>
      </div>
    </div>
  );
}
