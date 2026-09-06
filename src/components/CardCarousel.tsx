"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import type { GalleryImage } from "@/lib/queries";
import { CLOUDINARY_SIZES } from "@/lib/cloudinary";

const SWIPE_THRESHOLD = 48;

export default function CardCarousel({
  images,
  promptSlug,
  title,
  priority = false,
}: {
  images: GalleryImage[];
  promptSlug: string;
  title: string;
  priority?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const dragStartX = useRef<number | null>(null);
  const suppressClick = useRef(false);

  const shift = useCallback(
    (delta: number) => {
      setIndex((prev) => (prev + delta + images.length) % images.length);
    },
    [images.length]
  );

  const resetDrag = () => {
    dragStartX.current = null;
  };

  const finishDrag = (clientX: number) => {
    if (dragStartX.current === null) return;
    const delta = clientX - dragStartX.current;
    resetDrag();
    if (Math.abs(delta) < SWIPE_THRESHOLD) return;
    suppressClick.current = true;
    shift(delta < 0 ? 1 : -1);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    dragStartX.current = e.clientX;
    suppressClick.current = false;
  };

  const onPointerUp = (e: React.PointerEvent) => {
    finishDrag(e.clientX);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    dragStartX.current = e.touches[0]?.clientX ?? null;
    suppressClick.current = false;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    if (!touch) return;
    finishDrag(touch.clientX);
  };

  const onImageClick = (e: React.MouseEvent) => {
    if (suppressClick.current) {
      e.preventDefault();
      suppressClick.current = false;
    }
  };

  const current = images[index];
  const alt = current.altText || `${title} — AI generated image`;

  return (
    <div
      className="relative touch-pan-y"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={resetDrag}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <Link
        href={`/prompts/${promptSlug}`}
        aria-label={`View prompt: ${title}`}
        draggable={false}
        onClick={onImageClick}
      >
        <Image
          key={current.imageId}
          src={current.imageUrl}
          alt={alt}
          width={current.width || 800}
          height={current.height || 1000}
          sizes={CLOUDINARY_SIZES.masonry}
          priority={priority && index === 0}
          loading={priority && index === 0 ? undefined : "lazy"}
          className="h-auto w-full object-cover select-none"
          draggable={false}
        />
      </Link>

      <button
        type="button"
        aria-label="Previous image"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          shift(-1);
        }}
        className="absolute left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white opacity-80 backdrop-blur transition hover:bg-black/75 md:opacity-0 md:group-hover:opacity-100 focus-visible:opacity-100"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <button
        type="button"
        aria-label="Next image"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          shift(1);
        }}
        className="absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white opacity-80 backdrop-blur transition hover:bg-black/75 md:opacity-0 md:group-hover:opacity-100 focus-visible:opacity-100"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
        </svg>
      </button>

      <div
        className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/50 px-2.5 py-1.5 backdrop-blur"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-1" role="tablist" aria-label="Image slides">
          {images.map((img, i) => (
            <button
              key={img.imageId}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Image ${i + 1} of ${images.length}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIndex(i);
              }}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-4 bg-white" : "w-1.5 bg-white/45 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
        <span className="text-[10px] font-semibold tabular-nums text-white/90" aria-live="polite">
          {index + 1}/{images.length}
        </span>
      </div>
    </div>
  );
}
