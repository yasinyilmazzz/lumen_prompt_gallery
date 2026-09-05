"use client";

import { useState } from "react";

type Props = {
  text: string;
  promptId?: string;
  label?: string;
  size?: "md" | "lg";
  variant?: "dark" | "light" | "outline";
};

export default function CopyButton({ text, promptId, label = "Copy Prompt", size = "md", variant = "dark" }: Props) {
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");

  async function copy() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for non-secure contexts
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setState("copied");
      // Fire-and-forget analytics hook (powers "most copied" later)
      if (promptId) {
        fetch("/api/copy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ promptId }),
        }).catch(() => {});
      }
      setTimeout(() => setState("idle"), 2000);
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 2500);
    }
  }

  const sizes = size === "lg" ? "px-7 py-3.5 text-[15px]" : "px-5 py-2.5 text-sm";
  const variants =
    variant === "dark"
      ? "bg-black text-white hover:bg-neutral-800"
      : variant === "light"
        ? "bg-white text-black hover:bg-neutral-100"
        : "border border-black/15 bg-white text-black hover:border-black";

  return (
    <button
      type="button"
      onClick={copy}
      aria-live="polite"
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold transition active:scale-[0.98] ${sizes} ${variants} ${
        state === "copied" ? "!bg-emerald-600 !text-white !border-emerald-600" : ""
      }`}
    >
      {state === "copied" ? (
        <>
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
          </svg>
          Copied!
        </>
      ) : state === "error" ? (
        "Copy failed — select manually"
      ) : (
        <>
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 8h10v12H8zM6 8V6a2 2 0 0 1 2-2h10" />
          </svg>
          {label}
        </>
      )}
    </button>
  );
}
