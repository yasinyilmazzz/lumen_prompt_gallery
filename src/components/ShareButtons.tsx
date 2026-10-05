"use client";

import { useState } from "react";

type Props = {
  title: string;
  url: string;
  imageUrl?: string;
};

const buttonClass =
  "inline-flex items-center gap-2 rounded-full border border-black/12 bg-white px-4 py-2 text-[13px] font-medium transition hover:border-black";

export default function ShareButtons({ title, url, imageUrl }: Props) {
  const [instagramMessage, setInstagramMessage] = useState("");

  async function shareToInstagram() {
    setInstagramMessage("");
    if (navigator.share) {
      try {
        await navigator.share({ title, text: `${title} — AI prompt`, url });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setInstagramMessage("Sharing failed. Please try again.");
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setInstagramMessage("Link copied. Paste it into your Instagram post or story.");
    } catch {
      setInstagramMessage("Copy this page URL to share it on Instagram.");
    }
    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
  }

  return (
    <div>
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${title} — AI prompt`)}&url=${encodeURIComponent(url)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass}
          aria-label="Share on X"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
            <path d="M18.9 2H22l-6.78 7.75L23.2 22h-6.25l-4.9-7.43L5.55 22H2.4l7.25-8.29L1.8 2h6.4l4.43 6.78L18.9 2Zm-1.1 18h1.73L7.28 3.9H5.42L17.8 20Z" />
          </svg>
          Share on X
        </a>
        <a
          href={`https://pinterest.com/pin/create/button/?description=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}${imageUrl ? `&media=${encodeURIComponent(imageUrl)}` : ""}`}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass}
          aria-label="Share on Pinterest"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
            <path d="M12 2a10 10 0 0 0-3.64 19.31c-.02-.78 0-1.72.2-2.57l1.44-6.1s-.36-.72-.36-1.78c0-1.67.97-2.92 2.17-2.92 1.02 0 1.52.77 1.52 1.69 0 1.03-.66 2.57-1 4-.28 1.2.6 2.19 1.78 2.19 2.14 0 3.58-2.75 3.58-6.01 0-2.48-1.67-4.34-4.71-4.34-3.43 0-5.57 2.56-5.57 5.42 0 .99.29 1.69.74 2.23.21.25.24.35.16.63l-.23.92c-.08.29-.31.39-.57.28-1.58-.65-2.31-2.4-2.31-4.36 0-3.24 2.73-7.13 8.15-7.13 4.36 0 7.23 3.16 7.23 6.55 0 4.48-2.49 7.83-6.17 7.83-1.23 0-2.39-.67-2.79-1.43l-.8 3.2c-.24.87-.71 1.74-1.14 2.42A10 10 0 1 0 12 2Z" />
          </svg>
          Pin it
        </a>
        <button
          type="button"
          onClick={shareToInstagram}
          className={buttonClass}
          aria-label="Share on Instagram"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
          </svg>
          Share on Instagram
        </button>
      </div>
      {instagramMessage && <p className="mt-2 text-xs text-neutral-500" role="status">{instagramMessage}</p>}
    </div>
  );
}
