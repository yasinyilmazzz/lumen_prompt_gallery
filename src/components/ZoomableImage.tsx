"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Props = {
  src: string;
  alt: string;
  width: number;
  height: number;
  sizes: string;
  priority?: boolean;
  roundedClassName?: string;
};

export default function ZoomableImage({
  src,
  alt,
  width,
  height,
  sizes,
  priority = false,
  roundedClassName = "rounded-2xl",
}: Props) {
  const [isZoomed, setIsZoomed] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isZoomed) return;

    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsZoomed(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    closeButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
      previouslyFocused?.focus();
    };
  }, [isZoomed]);

  return (
    <>
      <figure className={`overflow-hidden ${roundedClassName} bg-[#e9e9ee]`}>
        <button
          type="button"
          className="block w-full cursor-zoom-in"
          onClick={() => setIsZoomed(true)}
          aria-label={`Enlarge image: ${alt}`}
        >
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            sizes={sizes}
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            className="h-auto w-full object-cover"
          />
        </button>
      </figure>
      {isZoomed && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Enlarged image: ${alt}`}
        >
          <button
            type="button"
            className="absolute inset-0 cursor-zoom-out"
            onClick={() => setIsZoomed(false)}
            aria-label="Close enlarged image"
          />
          <button
            type="button"
            className="relative z-10 cursor-zoom-out"
            onClick={() => setIsZoomed(false)}
            aria-label="Close enlarged image"
          >
            <Image
              src={src}
              alt={alt}
              width={width}
              height={height}
              sizes="100vw"
              priority
              className="h-auto max-h-[calc(100vh-2rem)] w-auto max-w-[calc(100vw-2rem)] object-contain"
            />
          </button>
          <button
            type="button"
            ref={closeButtonRef}
            className="absolute right-4 top-4 z-20 rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/25"
            onClick={() => setIsZoomed(false)}
          >
            Close
          </button>
        </div>
      )}
    </>
  );
}
