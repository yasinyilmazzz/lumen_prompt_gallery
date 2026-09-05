import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-black/[0.07] bg-white">
      <div className="mx-auto grid max-w-[1600px] gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <p className="font-display text-2xl font-semibold tracking-tight">LUMEN</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-neutral-500">
            A curated AI visual prompt library. Discover cinematic imagery and copy the exact
            prompts behind every frame.
          </p>
        </div>
        <nav aria-label="Discover">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">Discover</p>
          <ul className="mt-4 space-y-2.5 text-sm font-medium text-neutral-700">
            <li><Link className="hover:text-black" href="/explore">Explore all</Link></li>
            <li><Link className="hover:text-black" href="/male">Male models</Link></li>
            <li><Link className="hover:text-black" href="/female">Female models</Link></li>
            <li><Link className="hover:text-black" href="/explore?featured=1">Featured</Link></li>
          </ul>
        </nav>
        <nav aria-label="Library">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">Library</p>
          <ul className="mt-4 space-y-2.5 text-sm font-medium text-neutral-700">
            <li><Link className="hover:text-black" href="/models">Models</Link></li>
            <li><Link className="hover:text-black" href="/categories">Categories</Link></li>
            <li><Link className="hover:text-black" href="/tags">Tags</Link></li>
          </ul>
        </nav>
        <nav aria-label="Studio">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">Studio</p>
          <ul className="mt-4 space-y-2.5 text-sm font-medium text-neutral-700">
            <li><Link className="hover:text-black" href="/about">About</Link></li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-black/[0.06]">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-2 px-4 py-5 text-xs text-neutral-400 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} LUMEN — AI Visual Prompt Library</p>
          <p>Crafted frames · Copyable prompts · Consistent models</p>
        </div>
      </div>
    </footer>
  );
}
