"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setValue(initialQuery), [initialQuery]);
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open ]);

  // Debounced live search while typing
  useEffect(() => {
    if (!open) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const q = value.trim();
      router.push(q ? `/explore?q=${encodeURIComponent(q)}` : "/explore");
    }, 600);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [value, open, router]);

  return (
    <>
      {/* desktop inline */}
      <form
        className="relative hidden min-w-0 flex-1 md:block"
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          const q = value.trim();
          router.push(q ? `/explore?q=${encodeURIComponent(q)}` : "/explore");
        }}
      >
        <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z" />
        </svg>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search prompts, models, categories…"
          aria-label="Search prompts"
          className="w-full rounded-full border border-black/[0.08] bg-white py-2.5 pl-10 pr-9 text-sm outline-none transition placeholder:text-neutral-400 focus:border-black/30"
        />
        {value && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setValue("");
              router.push("/explore");
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black"
          >
            ✕
          </button>
        )}
      </form>

      {/* mobile trigger */}
      <button
        type="button"
        aria-label="Open search"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white md:hidden"
      >
        <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z" />
        </svg>
      </button>

      {/* mobile full-screen search */}
      {open && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-[#fafafb] p-4 md:hidden" role="dialog" aria-modal="true" aria-label="Search">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z" />
              </svg>
              <input
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Search prompts, models…"
                aria-label="Search prompts"
                className="w-full rounded-full border border-black/15 bg-white py-3 pl-10 pr-4 text-[16px] outline-none focus:border-black"
              />
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="shrink-0 rounded-full bg-black px-5 py-3 text-sm font-medium text-white"
            >
              Done
            </button>
          </div>
          <p className="mt-6 text-center text-sm text-neutral-500">
            Try “cinematic”, “streetwear”, “Emma”, “editorial”…
          </p>
        </div>
      )}
    </>
  );
}
