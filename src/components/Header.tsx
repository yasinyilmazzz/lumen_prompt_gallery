import Image from "next/image";
import Link from "next/link";
import SearchBar from "./SearchBar";

const NAV = [
  { href: "/explore", label: "Explore" },
  { href: "/male", label: "Male" },
  { href: "/female", label: "Female" },
  { href: "/models", label: "Models" },
  { href: "/categories", label: "Categories" },
];

export default function Header({ query }: { query?: string }) {
  return (
    <header className="sticky top-0 z-50 border-b border-black/[0.06] bg-[#fafafb]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center" aria-label="LUMEN home">
          <Image
            src="/lumen-logo-light.png"
            alt="LUMEN"
            width={132}
            height={36}
            priority
            className="h-8 w-auto sm:h-9"
          />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-neutral-600 transition hover:bg-black/[0.05] hover:text-black"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-2 sm:max-w-md">
          <SearchBar initialQuery={query ?? ""} />
        </div>
      </div>

      {/* mobile / tablet nav row */}
      <nav className="flex items-center gap-1 overflow-x-auto px-4 pb-3 lg:hidden" aria-label="Primary mobile">
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className="shrink-0 rounded-full border border-black/[0.07] bg-white px-4 py-1.5 text-[13px] font-medium text-neutral-700 transition hover:border-black"
          >
            {n.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
