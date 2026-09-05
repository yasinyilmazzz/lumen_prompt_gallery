"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  deleteCategory,
  deleteModel,
  deleteTag,
  setPromptFeatured,
  setPromptStatus,
  deletePrompt,
  upsertCategory,
  upsertModel,
  upsertTag,
} from "@/lib/admin-actions";
import type { Category, Model, Tag } from "@/db/schema";

// ---------------------------------------------------------------------------
// Generic destructive confirm
// ---------------------------------------------------------------------------
export function ConfirmButton({
  id,
  title,
  message,
  buttonLabel = "Delete",
  action,
}: {
  id: string;
  title: string;
  message: string;
  buttonLabel?: string;
  action: (id: string) => Promise<{ ok: true; data: unknown } | { ok: false; error: string }>;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirm() {
    setPending(true);
    setError(null);
    const res = await action(id);
    setPending(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg px-3 py-1.5 text-[13px] font-medium text-red-600 transition hover:bg-red-50"
      >
        {buttonLabel}
      </button>
      {open && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-label={title}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="font-display text-xl font-medium">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-500">{message}</p>
            {error && (
              <p role="alert" className="mt-3 rounded-xl bg-red-50 px-3 py-2.5 text-[13px] font-medium text-red-700">
                {error}
              </p>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={pending}
                className="rounded-full border border-black/15 px-5 py-2.5 text-sm font-medium transition hover:border-black"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirm}
                disabled={pending}
                className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {pending ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Prompt row quick actions
// ---------------------------------------------------------------------------
export function PromptRowActions({
  id,
  status,
  featured,
}: {
  id: string;
  status: "draft" | "published";
  featured: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function run(fn: () => Promise<{ ok: boolean } | { ok: true; data: unknown } | { ok: false; error: string }>) {
    setPending(true);
    await fn();
    setPending(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        disabled={pending}
        title={featured ? "Remove from featured" : "Mark as featured"}
        onClick={() => run(() => setPromptFeatured(id, !featured))}
        className={`rounded-lg px-2.5 py-1.5 text-base leading-none transition hover:bg-black/[0.05] ${featured ? "" : "opacity-30 hover:opacity-100"}`}
        aria-label={featured ? "Remove from featured" : "Mark as featured"}
      >
        ★
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => run(() => setPromptStatus(id, status === "published" ? "draft" : "published"))}
        className={`rounded-lg px-3 py-1.5 text-[13px] font-medium transition hover:bg-black/[0.05] ${
          status === "published" ? "text-emerald-700" : "text-amber-700"
        }`}
      >
        {status === "published" ? "Unpublish" : "Publish"}
      </button>
      <ConfirmButton
        id={id}
        title="Delete prompt?"
        message="This permanently deletes the prompt and all its image records. Cloudinary assets are destroyed best-effort. This cannot be undone."
        action={deletePrompt}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared bits
// ---------------------------------------------------------------------------
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[13px] font-semibold text-neutral-700">{label}</span>
      <span className="mt-1.5 block">{children}</span>
    </label>
  );
}

const inputCls =
  "w-full rounded-xl border border-black/15 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-black";

// ---------------------------------------------------------------------------
// Model manager
// ---------------------------------------------------------------------------
export function ModelManager({ initial }: { initial: Model[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [editing, setEditing] = useState<Model | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    setPending(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const res = await upsertModel({
      id: editing === "new" ? undefined : editing.id,
      name: String(fd.get("name") || ""),
      slug: String(fd.get("slug") || ""),
      gender: (fd.get("gender") as "male" | "female") || "female",
      description: String(fd.get("description") || ""),
      imageUrl: String(fd.get("imageUrl") || ""),
      isActive: fd.get("isActive") === "on",
    });
    setPending(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setEditing(null);
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500">{rows.length} model{rows.length === 1 ? "" : "s"}</p>
        <button
          type="button"
          onClick={() => {
            setError(null);
            setEditing("new");
            setRows(initial);
          }}
          className="rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800"
        >
          + New model
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {rows.map((m) => (
          <div key={m.id} className="flex items-center gap-4 rounded-2xl border border-black/[0.07] bg-white p-4">
            {m.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={m.imageUrl} alt="" className="h-14 w-14 shrink-0 rounded-full object-cover" />
            ) : (
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-black font-display text-xl text-white">
                {m.name.charAt(0)}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {m.name} <span className="font-normal text-neutral-400">· {m.gender}</span>
                {!m.isActive && <span className="ml-2 rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium">inactive</span>}
              </p>
              <p className="truncate text-[13px] text-neutral-400">/models/{m.slug}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setEditing(m);
              }}
              className="rounded-lg px-3 py-1.5 text-[13px] font-medium text-neutral-600 hover:bg-black/[0.05]"
            >
              Edit
            </button>
            <ConfirmButton
              id={m.id}
              title={`Delete ${m.name}?`}
              message="Models in use by prompts cannot be deleted. Reassign those prompts first."
              action={deleteModel}
            />
          </div>
        ))}
      </div>

      {rows.length === 0 && !editing && (
        <div className="mt-4 rounded-2xl border border-dashed border-black/15 bg-white px-6 py-12 text-center">
          <p className="font-medium">No models yet.</p>
          <p className="mt-1 text-sm text-neutral-500">Add Alex, Emma or a brand-new muse.</p>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto bg-black/40 p-4" role="dialog" aria-modal="true" aria-label="Model editor">
          <form onSubmit={save} className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="font-display text-xl font-medium">{editing === "new" ? "New model" : `Edit ${editing.name}`}</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Name">
                <input name="name" required defaultValue={editing === "new" ? "" : editing.name} className={inputCls} placeholder="Alex" />
              </Field>
              <Field label="Slug (auto)">
                <input name="slug" defaultValue={editing === "new" ? "" : editing.slug} className={inputCls} placeholder="alex" />
              </Field>
            </div>
            <div className="grid grid-cols-2 items-end gap-4">
              <Field label="Gender">
                <select name="gender" defaultValue={editing === "new" ? "female" : editing.gender} className={inputCls}>
                  <option value="male">male</option>
                  <option value="female">female</option>
                </select>
              </Field>
              <label className="flex items-center gap-2 pb-2.5 text-sm font-medium">
                <input type="checkbox" name="isActive" defaultChecked={editing === "new" ? true : editing.isActive} className="h-4 w-4" />
                Active
              </label>
            </div>
            <Field label="Portrait image URL">
              <input name="imageUrl" defaultValue={editing === "new" ? "" : editing.imageUrl ?? ""} className={inputCls} placeholder="https://…" />
            </Field>
            <Field label="Description">
              <textarea name="description" rows={3} defaultValue={editing === "new" ? "" : editing.description ?? ""} className={inputCls} placeholder="Who is this muse?" />
            </Field>
            {error && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2.5 text-[13px] font-medium text-red-700">{error}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setEditing(null)} className="rounded-full border border-black/15 px-5 py-2.5 text-sm font-medium hover:border-black">
                Cancel
              </button>
              <button type="submit" disabled={pending} className="rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50">
                {pending ? "Saving…" : "Save model"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Category manager
// ---------------------------------------------------------------------------
export function CategoryManager({ initial }: { initial: Category[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Category | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    setPending(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const res = await upsertCategory({
      id: editing === "new" ? undefined : editing.id,
      name: String(fd.get("name") || ""),
      slug: String(fd.get("slug") || ""),
      description: String(fd.get("description") || ""),
      coverImageUrl: String(fd.get("coverImageUrl") || ""),
      isActive: fd.get("isActive") === "on",
    });
    setPending(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setEditing(null);
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500">{initial.length} categor{initial.length === 1 ? "y" : "ies"}</p>
        <button
          type="button"
          onClick={() => {
            setError(null);
            setEditing("new");
          }}
          className="rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800"
        >
          + New category
        </button>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-black/[0.07] bg-white">
        <ul className="divide-y divide-black/[0.05]">
          {initial.map((c) => (
            <li key={c.id} className="flex items-center gap-3 px-5 py-4">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {c.name}
                  {!c.isActive && <span className="ml-2 rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium">inactive</span>}
                </p>
                <p className="truncate text-[13px] text-neutral-400">/categories/{c.slug}</p>
              </div>
              <button type="button" onClick={() => { setError(null); setEditing(c); }} className="rounded-lg px-3 py-1.5 text-[13px] font-medium text-neutral-600 hover:bg-black/[0.05]">
                Edit
              </button>
              <ConfirmButton
                id={c.id}
                title={`Delete ${c.name}?`}
                message="Categories in use by prompts cannot be deleted. Reassign those prompts first — no cascade deletes."
                action={deleteCategory}
              />
            </li>
          ))}
        </ul>
        {initial.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="font-medium">No categories yet.</p>
            <p className="mt-1 text-sm text-neutral-500">Create Fashion, Editorial, Portrait…</p>
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto bg-black/40 p-4" role="dialog" aria-modal="true" aria-label="Category editor">
          <form onSubmit={save} className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="font-display text-xl font-medium">{editing === "new" ? "New category" : `Edit ${editing.name}`}</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Name">
                <input name="name" required defaultValue={editing === "new" ? "" : editing.name} className={inputCls} placeholder="Fashion" />
              </Field>
              <Field label="Slug (auto)">
                <input name="slug" defaultValue={editing === "new" ? "" : editing.slug} className={inputCls} placeholder="fashion" />
              </Field>
            </div>
            <Field label="Cover image URL (optional)">
              <input name="coverImageUrl" defaultValue={editing === "new" ? "" : editing.coverImageUrl ?? ""} className={inputCls} placeholder="https://…" />
            </Field>
            <Field label="Description">
              <textarea name="description" rows={3} defaultValue={editing === "new" ? "" : editing.description ?? ""} className={inputCls} placeholder="What lives on this shelf?" />
            </Field>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" name="isActive" defaultChecked={editing === "new" ? true : editing.isActive} className="h-4 w-4" />
              Active
            </label>
            {error && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2.5 text-[13px] font-medium text-red-700">{error}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setEditing(null)} className="rounded-full border border-black/15 px-5 py-2.5 text-sm font-medium hover:border-black">
                Cancel
              </button>
              <button type="submit" disabled={pending} className="rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50">
                {pending ? "Saving…" : "Save category"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tag manager
// ---------------------------------------------------------------------------
export function TagManager({ initial }: { initial: Tag[] }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    setPending(true);
    setError(null);
    const res = await upsertTag({ name: value });
    setPending(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setValue("");
    router.refresh();
  }

  return (
    <div>
      <form onSubmit={add} className="flex gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="New tag — type & press Enter (e.g. cinematic)"
          aria-label="New tag name"
          className="max-w-md flex-1 rounded-xl border border-black/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-black"
        />
        <button type="submit" disabled={pending || !value.trim()} className="rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-40">
          {pending ? "Adding…" : "Add tag"}
        </button>
      </form>
      {error && <p role="alert" className="mt-3 max-w-md rounded-xl bg-red-50 px-3 py-2.5 text-[13px] font-medium text-red-700">{error}</p>}

      <div className="mt-5 flex flex-wrap gap-2">
        {initial.map((t) => (
          <span key={t.id} className="group inline-flex items-center gap-1 rounded-full border border-black/10 bg-white py-1.5 pl-4 pr-1.5 text-sm font-medium">
            #{t.name}
            <ConfirmButton id={t.id} title={`Delete #${t.name}?`} message="The tag will be detached from every image. This cannot be undone." buttonLabel="✕" action={deleteTag} />
          </span>
        ))}
        {initial.length === 0 && <p className="text-sm text-neutral-500">No tags yet — add your first above.</p>}
      </div>
    </div>
  );
}
