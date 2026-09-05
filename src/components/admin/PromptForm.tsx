"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  addImageToPrompt,
  deleteImage,
  moveImage,
  updateImage,
  upsertPrompt,
} from "@/lib/admin-actions";
import type { Category, Image as ImageRow, Model, Prompt } from "@/db/schema";

type Props = {
  mode: "create" | "edit";
  initial?: Prompt;
  initialImages?: ImageRow[];
  initialTagNames?: string[];
  models: Model[];
  categories: Category[];
  allTagNames: string[];
};

const inputCls =
  "w-full rounded-xl border border-black/15 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-black";
const labelCls = "text-[13px] font-semibold text-neutral-700";

function slugifyLive(v: string): string {
  return v
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120);
}

export default function PromptForm({
  mode,
  initial,
  initialImages = [],
  initialTagNames = [],
  models,
  categories,
  allTagNames,
}: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [prompt, setPrompt] = useState(initial?.prompt ?? "");
  const [negativePrompt, setNegativePrompt] = useState(initial?.negativePrompt ?? "");
  const [modelId, setModelId] = useState(initial?.modelId ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [status, setStatus] = useState<"draft" | "published">(initial?.status ?? "draft");
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [seoTitle, setSeoTitle] = useState(initial?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(initial?.seoDescription ?? "");
  const [tagNames, setTagNames] = useState<string[]>(initialTagNames);
  const [tagDraft, setTagDraft] = useState("");

  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const suggestions = useMemo(
    () => allTagNames.filter((t) => !tagNames.includes(t)).slice(0, 8),
    [allTagNames, tagNames]
  );

  function onTitle(v: string) {
    setTitle(v);
    if (!slugTouched) setSlug(slugifyLive(v));
  }

  function addTag(raw: string) {
    const clean = raw.trim().replace(/^#+/, "");
    if (!clean || tagNames.includes(clean)) return;
    setTagNames([...tagNames, clean]);
    setTagDraft("");
  }

  async function save(publish?: boolean) {
    setSaving(true);
    setError(null);
    const res = await upsertPrompt({
      id: initial?.id,
      title,
      slug,
      prompt,
      negativePrompt,
      modelId: modelId || null,
      categoryId: categoryId || null,
      status: publish !== undefined ? (publish ? "published" : "draft") : status,
      featured,
      seoTitle,
      seoDescription,
      tagNames,
    });
    setSaving(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    if (mode === "create") {
      router.push(`/admin/prompts/${res.data.id}`);
    } else {
      setSavedFlash(true);
      router.refresh();
      setTimeout(() => setSavedFlash(false), 2500);
    }
  }

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[1fr_1.1fr]">
      {/* ============ LEFT: images ============ */}
      <section className="rounded-2xl border border-black/[0.07] bg-white p-5 sm:p-6">
        <h2 className="font-display text-lg font-medium">Images</h2>
        {mode === "create" ? (
          <div className="mt-3 rounded-xl bg-black/[0.04] px-4 py-6 text-center">
            <p className="text-sm font-medium">Save the prompt first</p>
            <p className="mx-auto mt-1 max-w-xs text-[13px] text-neutral-500">
              Images attach to a prompt — fill in the details on the right and hit “Save draft”, then come back to upload.
            </p>
          </div>
        ) : (
          initial && <ImageManager promptId={initial.id} images={initialImages} />
        )}
      </section>

      {/* ============ RIGHT: fields ============ */}
      <section className="rounded-2xl border border-black/[0.07] bg-white p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className={labelCls}>Title *</span>
            <input value={title} onChange={(e) => onTitle(e.target.value)} placeholder="Crimson Studio Authority" className={`${inputCls} mt-1.5`} />
          </label>
          <label className="block sm:col-span-2">
            <span className={labelCls}>Slug</span>
            <input
              value={slug}
              onChange={(e) => {
                setSlug(slugifyLive(e.target.value));
                setSlugTouched(true);
              }}
              placeholder="crimson-studio-authority"
              className={`${inputCls} mt-1.5 font-mono text-[13px]`}
            />
          </label>
          <label className="block">
            <span className={labelCls}>Model</span>
            <select value={modelId} onChange={(e) => setModelId(e.target.value)} className={`${inputCls} mt-1.5`}>
              <option value="">— No model —</option>
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.gender})
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={labelCls}>Category</span>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={`${inputCls} mt-1.5`}>
              <option value="">— No category —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block sm:col-span-2">
            <span className={labelCls}>Prompt *</span>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={7}
              placeholder="Cinematic studio portrait of…, 85mm, photorealistic, 8k…"
              className={`${inputCls} prompt-body mt-1.5`}
            />
            <span className="mt-1 block text-right text-xs text-neutral-400">{prompt.length} chars</span>
          </label>
          <label className="block sm:col-span-2">
            <span className={labelCls}>Negative prompt</span>
            <textarea
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              rows={2}
              placeholder="blurry, cartoon, watermark…"
              className={`${inputCls} prompt-body mt-1.5`}
            />
          </label>

          {/* tags */}
          <div className="sm:col-span-2">
            <span className={labelCls}>Tags</span>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {tagNames.map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5 rounded-full bg-black py-1 pl-3.5 pr-2 text-[13px] font-medium text-white">
                  #{t}
                  <button
                    type="button"
                    aria-label={`Remove tag ${t}`}
                    onClick={() => setTagNames(tagNames.filter((x) => x !== t))}
                    className="rounded-full px-1 text-white/60 hover:text-white"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
            <input
              value={tagDraft}
              onChange={(e) => setTagDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag(tagDraft);
                }
              }}
              placeholder="Type a tag & press Enter…"
              className={`${inputCls} mt-2`}
            />
            {suggestions.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => addTag(s)}
                    className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium text-neutral-500 transition hover:border-black hover:text-black"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            )}
            <p className="mt-1.5 text-xs text-neutral-400">Tags apply to every image of this prompt.</p>
          </div>

          <label className="block sm:col-span-2">
            <span className={labelCls}>SEO title</span>
            <input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="Defaults to “{Title} AI Image Prompt”" className={`${inputCls} mt-1.5`} />
          </label>
          <label className="block sm:col-span-2">
            <span className={labelCls}>SEO description</span>
            <textarea value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} rows={2} maxLength={320} placeholder="~150 chars, natural language" className={`${inputCls} mt-1.5`} />
          </label>

          <div className="flex items-center gap-5 sm:col-span-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={status === "published"} onChange={(e) => setStatus(e.target.checked ? "published" : "draft")} className="h-4 w-4" />
              Published {status === "draft" && <span className="text-neutral-400">(draft)</span>}
            </label>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="h-4 w-4" />
              ★ Featured
            </label>
          </div>
        </div>

        {error && (
          <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </p>
        )}
        {savedFlash && (
          <p role="status" className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            Saved ✓
          </p>
        )}

        <div className="mt-5 flex flex-wrap gap-2 border-t border-black/[0.07] pt-5">
          <button
            type="button"
            disabled={saving || !title.trim() || !prompt.trim()}
            onClick={() => save()}
            className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-40"
          >
            {saving ? "Saving…" : mode === "create" ? "Save & continue →" : "Save changes"}
          </button>
          {mode === "edit" && initial?.status === "draft" && (
            <button
              type="button"
              disabled={saving}
              onClick={() => save(true)}
              className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-40"
            >
              Save & publish
            </button>
          )}
          {mode === "create" && (
            <button
              type="button"
              disabled={saving || !title.trim() || !prompt.trim()}
              onClick={() => save(false)}
              className="rounded-full border border-black/15 px-6 py-3 text-sm font-medium transition hover:border-black disabled:opacity-40"
            >
              Save draft
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Image manager (edit mode)
// ---------------------------------------------------------------------------
function ImageManager({ promptId, images }: { promptId: string; images: ImageRow[] }) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "done" | "error">("idle");

  async function refresh() {
    router.refresh();
  }

  async function addByUrl(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setBusy("url");
    setError(null);
    const res = await addImageToPrompt({ promptId, imageUrl: url, altText: alt });
    setBusy(null);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setUrl("");
    setAlt("");
    refresh();
  }

  async function uploadFile(file: File) {
    setUploadState("uploading");
    setError(null);
    try {
      const form = new FormData();
      form.set("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const data = (await res.json()) as { ok?: boolean; url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error || "Upload failed.");
      const saved = await addImageToPrompt({ promptId, imageUrl: data.url, altText: file.name.replace(/\.[^.]+$/, "") });
      if (!saved.ok) throw new Error(saved.error);
      setUploadState("done");
      refresh();
      setTimeout(() => setUploadState("idle"), 2000);
    } catch (err) {
      setUploadState("error");
      setError(err instanceof Error ? err.message : "Upload failed.");
      setTimeout(() => setUploadState("idle"), 2500);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this image record? The CDN asset is destroyed best-effort.")) return;
    setBusy(id);
    await deleteImage(id);
    setBusy(null);
    refresh();
  }

  async function move(id: string, dir: -1 | 1) {
    setBusy(id);
    await moveImage(id, dir);
    setBusy(null);
    refresh();
  }

  async function saveAlt(id: string, value: string) {
    await updateImage(id, { altText: value });
    refresh();
  }

  const sorted = [...images].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="mt-3 space-y-4">
      {/* file upload */}
      <label
        className={`block cursor-pointer rounded-xl border-2 border-dashed px-4 py-6 text-center transition ${
          uploadState === "uploading" ? "border-black/30 bg-black/[0.03]" : "border-black/15 hover:border-black/40"
        }`}
      >
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) uploadFile(f);
            e.target.value = "";
          }}
        />
        {uploadState === "uploading" ? (
          <p className="text-sm font-medium">Uploading…</p>
        ) : uploadState === "done" ? (
          <p className="text-sm font-medium text-emerald-700">Uploaded ✓</p>
        ) : (
          <>
            <p className="text-sm font-semibold">Drop or click to upload</p>
            <p className="mt-1 text-xs text-neutral-400">JPEG · PNG · WebP · AVIF — max 8 MB</p>
          </>
        )}
      </label>

      {/* URL add */}
      <form onSubmit={addByUrl} className="space-y-2 rounded-xl bg-black/[0.03] p-3">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">Or attach by URL (Cloudinary / CDN)</p>
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://res.cloudinary.com/… or any image URL" className={inputCls} />
        <div className="flex gap-2">
          <input value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Alt text (descriptive)" className={`${inputCls} flex-1`} />
          <button type="submit" disabled={busy === "url" || !url.trim()} className="shrink-0 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40">
            {busy === "url" ? "…" : "Add"}
          </button>
        </div>
      </form>

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-3 py-2.5 text-[13px] font-medium text-red-700">
          {error}
        </p>
      )}

      {/* list */}
      <div className="space-y-3">
        {sorted.map((img, i) => (
          <div key={img.id} className="flex gap-3 rounded-xl border border-black/[0.08] p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.thumbnailUrl || img.imageUrl} alt="" className="h-20 w-16 shrink-0 rounded-lg object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-mono text-[11px] text-neutral-400">{img.imageUrl}</p>
              <input
                defaultValue={img.altText ?? ""}
                placeholder="Alt text…"
                aria-label="Alt text"
                onBlur={(e) => {
                  if (e.target.value !== (img.altText ?? "")) saveAlt(img.id, e.target.value);
                }}
                className="mt-1.5 w-full rounded-lg border border-black/10 px-2.5 py-1.5 text-[13px] outline-none focus:border-black"
              />
              <div className="mt-1.5 flex items-center gap-1">
                <span className="mr-1 text-[11px] font-medium text-neutral-400">#{i + 1}</span>
                <button type="button" disabled={busy === img.id || i === 0} onClick={() => move(img.id, -1)} className="rounded-md px-2 py-1 text-[13px] hover:bg-black/[0.05] disabled:opacity-30" aria-label="Move up">↑</button>
                <button type="button" disabled={busy === img.id || i === sorted.length - 1} onClick={() => move(img.id, 1)} className="rounded-md px-2 py-1 text-[13px] hover:bg-black/[0.05] disabled:opacity-30" aria-label="Move down">↓</button>
                <button type="button" disabled={busy === img.id} onClick={() => remove(img.id)} className="ml-auto rounded-md px-2 py-1 text-[13px] font-medium text-red-600 hover:bg-red-50">
                  {busy === img.id ? "…" : "Delete"}
                </button>
              </div>
            </div>
          </div>
        ))}
        {sorted.length === 0 && (
          <p className="rounded-xl border border-dashed border-black/15 px-4 py-6 text-center text-sm text-neutral-500">
            No images yet — upload one above.
          </p>
        )}
      </div>
    </div>
  );
}
