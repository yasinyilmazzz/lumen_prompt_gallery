import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  hint,
  action,
}: {
  eyebrow?: string;
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9a6b2f]">{eyebrow}</p>
        )}
        <h2 className="mt-1.5 font-display text-[clamp(1.6rem,3vw,2.3rem)] font-medium leading-tight tracking-tight">
          {title}
        </h2>
        {hint && <p className="mt-1.5 max-w-xl text-sm text-neutral-500">{hint}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function ViewAllLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 rounded-full border border-black/12 bg-white px-4 py-2 text-sm font-medium transition hover:border-black"
    >
      {children}
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6 6 6-6 6" />
      </svg>
    </Link>
  );
}

export function TagBadge({ slug, name }: { slug: string; name: string }) {
  return (
    <Link
      href={`/tags/${slug}`}
      className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-neutral-600 transition hover:border-black hover:text-black"
    >
      #{name}
    </Link>
  );
}

export function SkeletonGrid({ count = 8 }: { count?: number }) {
  const heights = ["h-72", "h-96", "h-64", "h-80", "h-[22rem]", "h-60"];
  return (
    <div className="masonry" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`skeleton w-full rounded-2xl ${heights[i % heights.length]}`} />
      ))}
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
  count,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  count?: number;
}) {
  return (
    <div className="fade-up border-b border-black/[0.07] bg-white">
      <div className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6 sm:py-14">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9a6b2f]">{eyebrow}</p>
        <h1 className="mt-2 max-w-3xl font-display text-[clamp(2rem,4.5vw,3.4rem)] font-medium leading-[1.05] tracking-tight">
          {title}
        </h1>
        {description && <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-neutral-500">{description}</p>}
        {typeof count === "number" && (
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">
            {count} visual{count === 1 ? "" : "s"}
          </p>
        )}
      </div>
    </div>
  );
}

export function ModelAvatar({ src, name, size = 96 }: { src: string | null; name: string; size?: number }) {
  if (!src) {
    return (
      <span
        className="inline-flex items-center justify-center rounded-full bg-black font-display text-white"
        style={{ width: size, height: size, fontSize: size * 0.36 }}
        aria-hidden="true"
      >
        {name.charAt(0).toUpperCase()}
      </span>
    );
  }
  return (
    <Image
      src={src}
      alt={`${name} — AI model portrait`}
      width={size}
      height={size}
      className="rounded-full object-cover"
      style={{ width: size, height: size }}
    />
  );
}

export function FilterPill({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-medium transition ${
        active ? "bg-black text-white" : "border border-black/10 bg-white text-neutral-700 hover:border-black"
      }`}
    >
      {children}
    </Link>
  );
}
