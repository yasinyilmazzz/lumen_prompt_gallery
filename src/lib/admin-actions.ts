"use server";

import { and, count, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { categories, imageTags, images, models, promptVersions, prompts, tags } from "@/db/schema";
import {
  adminPassword,
  createSessionToken,
  getAdminSession,
  sessionCookieName,
  sessionMaxAge,
} from "@/lib/auth";
import { deriveThumbnailUrl } from "@/lib/cloudinary";
import { slugify } from "@/lib/utils";

type Result<T = { id: string }> = { ok: true; data: T } | { ok: false; error: string };

async function requireAdmin(): Promise<void> {
  if (!(await getAdminSession())) throw new Error("Unauthorized");
}

function revalidateAll() {
  revalidatePath("/", "layout");
}

// ---------------------------------------------------------------- auth
export async function loginAdmin(password: string): Promise<Result<{ ok: boolean }>> {
  if (password !== adminPassword()) return { ok: false, error: "Incorrect password." };
  const store = await cookies();
  store.set(sessionCookieName(), createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: sessionMaxAge(),
  });
  return { ok: true, data: { ok: true } };
}

export async function logoutAdmin(): Promise<void> {
  const store = await cookies();
  store.delete(sessionCookieName());
  redirect("/admin/login");
}

// ---------------------------------------------------------------- models
export async function upsertModel(input: {
  id?: string;
  name: string;
  slug?: string;
  gender: "male" | "female";
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
}): Promise<Result> {
  await requireAdmin();
  const name = input.name.trim();
  if (!name) return { ok: false, error: "Name is required." };
  const slug = slugify(input.slug?.trim() || name);
  if (!slug) return { ok: false, error: "Slug is required." };

  const clash = await db
    .select({ id: models.id })
    .from(models)
    .where(input.id ? and(eq(models.slug, slug), ne(models.id, input.id)) : eq(models.slug, slug))
    .limit(1);
  if (clash.length > 0) return { ok: false, error: `Slug “${slug}” is already taken.` };

  if (input.id) {
    await db
      .update(models)
      .set({
        name,
        slug,
        gender: input.gender,
        description: input.description?.trim() || null,
        imageUrl: input.imageUrl?.trim() || null,
        isActive: input.isActive ?? true,
        updatedAt: new Date(),
      })
      .where(eq(models.id, input.id));
    revalidateAll();
    return { ok: true, data: { id: input.id } };
  }
  const [row] = await db
    .insert(models)
    .values({
      name,
      slug,
      gender: input.gender,
      description: input.description?.trim() || null,
      imageUrl: input.imageUrl?.trim() || null,
      isActive: input.isActive ?? true,
    })
    .returning({ id: models.id });
  revalidateAll();
  return { ok: true, data: { id: row.id } };
}

export async function deleteModel(id: string): Promise<Result<{ ok: boolean }>> {
  await requireAdmin();
  const [usage] = await db.select({ value: count() }).from(prompts).where(eq(prompts.modelId, id));
  if ((usage?.value ?? 0) > 0)
    return { ok: false, error: `This model is used by ${usage.value} prompt(s). Reassign them first.` };
  await db.delete(models).where(eq(models.id, id));
  revalidateAll();
  return { ok: true, data: { ok: true } };
}

// ---------------------------------------------------------------- categories
export async function upsertCategory(input: {
  id?: string;
  name: string;
  slug?: string;
  description?: string;
  coverImageUrl?: string;
  isActive?: boolean;
}): Promise<Result> {
  await requireAdmin();
  const name = input.name.trim();
  if (!name) return { ok: false, error: "Name is required." };
  const slug = slugify(input.slug?.trim() || name);
  if (!slug) return { ok: false, error: "Slug is required." };

  const clash = await db
    .select({ id: categories.id })
    .from(categories)
    .where(input.id ? and(eq(categories.slug, slug), ne(categories.id, input.id)) : eq(categories.slug, slug))
    .limit(1);
  if (clash.length > 0) return { ok: false, error: `Slug “${slug}” is already taken.` };

  if (input.id) {
    await db
      .update(categories)
      .set({
        name,
        slug,
        description: input.description?.trim() || null,
        coverImageUrl: input.coverImageUrl?.trim() || null,
        isActive: input.isActive ?? true,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, input.id));
    revalidateAll();
    return { ok: true, data: { id: input.id } };
  }
  const [row] = await db
    .insert(categories)
    .values({
      name,
      slug,
      description: input.description?.trim() || null,
      coverImageUrl: input.coverImageUrl?.trim() || null,
      isActive: input.isActive ?? true,
    })
    .returning({ id: categories.id });
  revalidateAll();
  return { ok: true, data: { id: row.id } };
}

export async function deleteCategory(id: string): Promise<Result<{ ok: boolean }>> {
  await requireAdmin();
  const [usage] = await db.select({ value: count() }).from(prompts).where(eq(prompts.categoryId, id));
  if ((usage?.value ?? 0) > 0)
    return { ok: false, error: `This category is used by ${usage.value} prompt(s). Reassign them first.` };
  await db.delete(categories).where(eq(categories.id, id));
  revalidateAll();
  return { ok: true, data: { ok: true } };
}

// ---------------------------------------------------------------- tags
export async function upsertTag(input: { id?: string; name: string }): Promise<Result> {
  await requireAdmin();
  const name = input.name.trim().replace(/^#+/, "");
  if (!name) return { ok: false, error: "Name is required." };
  const slug = slugify(name);
  const clash = await db
    .select({ id: tags.id })
    .from(tags)
    .where(input.id ? and(eq(tags.slug, slug), ne(tags.id, input.id)) : eq(tags.slug, slug))
    .limit(1);
  if (clash.length > 0) return { ok: false, error: `Tag “${name}” already exists.` };
  if (input.id) {
    await db.update(tags).set({ name, slug }).where(eq(tags.id, input.id));
    revalidateAll();
    return { ok: true, data: { id: input.id } };
  }
  const [row] = await db.insert(tags).values({ name, slug }).returning({ id: tags.id });
  revalidateAll();
  return { ok: true, data: { id: row.id } };
}

export async function ensureTags(names: string[]): Promise<string[]> {
  const clean = [...new Set(names.map((n) => n.trim().replace(/^#+/, "")).filter(Boolean))];
  const ids: string[] = [];
  for (const name of clean) {
    const slug = slugify(name);
    const [existing] = await db.select({ id: tags.id }).from(tags).where(eq(tags.slug, slug)).limit(1);
    if (existing) {
      ids.push(existing.id);
    } else {
      const [row] = await db.insert(tags).values({ name, slug }).returning({ id: tags.id });
      ids.push(row.id);
    }
  }
  return ids;
}

export async function deleteTag(id: string): Promise<Result<{ ok: boolean }>> {
  await requireAdmin();
  await db.delete(imageTags).where(eq(imageTags.tagId, id));
  await db.delete(tags).where(eq(tags.id, id));
  revalidateAll();
  return { ok: true, data: { ok: true } };
}

// ---------------------------------------------------------------- prompts
export type PromptInput = {
  id?: string;
  title: string;
  slug?: string;
  prompt: string;
  negativePrompt?: string;
  modelId?: string | null;
  categoryId?: string | null;
  status: "draft" | "published";
  featured?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  tagNames?: string[];
};

export async function upsertPrompt(input: PromptInput): Promise<Result> {
  await requireAdmin();
  const title = input.title.trim();
  const promptText = input.prompt.trim();
  if (!title) return { ok: false, error: "Title is required." };
  if (!promptText) return { ok: false, error: "Prompt text is required." };
  const slug = slugify(input.slug?.trim() || title);
  if (!slug) return { ok: false, error: "Slug is required." };

  const clash = await db
    .select({ id: prompts.id })
    .from(prompts)
    .where(input.id ? and(eq(prompts.slug, slug), ne(prompts.id, input.id)) : eq(prompts.slug, slug))
    .limit(1);
  if (clash.length > 0) return { ok: false, error: `Slug “${slug}” is already taken.` };

  const base = {
    title,
    slug,
    prompt: promptText,
    negativePrompt: input.negativePrompt?.trim() || null,
    modelId: input.modelId || null,
    categoryId: input.categoryId || null,
    status: input.status,
    featured: input.featured ?? false,
    seoTitle: input.seoTitle?.trim() || null,
    seoDescription: input.seoDescription?.trim() || null,
    updatedAt: new Date(),
  };

  let promptId: string;
  if (input.id) {
    const [prev] = await db.select().from(prompts).where(eq(prompts.id, input.id)).limit(1);
    if (!prev) return { ok: false, error: "Prompt not found." };
    const publishing = prev.status === "draft" && input.status === "published";
    await db
      .update(prompts)
      .set({ ...base, publishedAt: publishing ? new Date() : prev.publishedAt })
      .where(eq(prompts.id, input.id));
    promptId = input.id;

    // Versioning: snapshot when the prompt text changes
    if (prev.prompt !== promptText || (prev.negativePrompt ?? null) !== (base.negativePrompt ?? null)) {
      const existing = await db
        .select({ versionNumber: promptVersions.versionNumber })
        .from(promptVersions)
        .where(eq(promptVersions.promptId, input.id));
      const next = existing.reduce((m, v) => Math.max(m, v.versionNumber), 0) + 1;
      await db.insert(promptVersions).values({
        promptId: input.id,
        versionNumber: next,
        prompt: promptText,
        negativePrompt: base.negativePrompt,
      });
    }
  } else {
    const [row] = await db
      .insert(prompts)
      .values({ ...base, publishedAt: input.status === "published" ? new Date() : null })
      .returning({ id: prompts.id });
    promptId = row.id;
    await db.insert(promptVersions).values({
      promptId,
      versionNumber: 1,
      prompt: promptText,
      negativePrompt: base.negativePrompt,
    });
  }

  // Sync prompt-level tags across all images of this prompt
  if (input.tagNames !== undefined) {
    const tagIds = await ensureTags(input.tagNames);
    const promptImages = await db.select({ id: images.id }).from(images).where(eq(images.promptId, promptId));
    for (const img of promptImages) {
      await db.delete(imageTags).where(eq(imageTags.imageId, img.id));
      for (const tagId of tagIds) {
        await db.insert(imageTags).values({ imageId: img.id, tagId });
      }
    }
  }

  revalidateAll();
  return { ok: true, data: { id: promptId } };
}

export async function deletePrompt(id: string): Promise<Result<{ ok: boolean }>> {
  await requireAdmin();
  // Note: image rows cascade. Cloudinary files are destroyed best-effort below
  // to avoid orphaned assets; local/external URLs simply dereference.
  const promptImages = await db.select().from(images).where(eq(images.promptId, id));
  await db.delete(prompts).where(eq(prompts.id, id));
  for (const img of promptImages) {
    await destroyCloudinaryAsset(img.cloudinaryPublicId).catch(() => {});
  }
  revalidateAll();
  return { ok: true, data: { ok: true } };
}

export async function setPromptStatus(id: string, status: "draft" | "published"): Promise<Result<{ ok: boolean }>> {
  await requireAdmin();
  const [prev] = await db.select().from(prompts).where(eq(prompts.id, id)).limit(1);
  if (!prev) return { ok: false, error: "Prompt not found." };
  await db
    .update(prompts)
    .set({
      status,
      publishedAt: status === "published" ? prev.publishedAt ?? new Date() : prev.publishedAt,
      updatedAt: new Date(),
    })
    .where(eq(prompts.id, id));
  revalidateAll();
  return { ok: true, data: { ok: true } };
}

export async function setPromptFeatured(id: string, featured: boolean): Promise<Result<{ ok: boolean }>> {
  await requireAdmin();
  await db.update(prompts).set({ featured, updatedAt: new Date() }).where(eq(prompts.id, id));
  revalidateAll();
  return { ok: true, data: { ok: true } };
}

// ---------------------------------------------------------------- images
export async function addImageToPrompt(input: {
  promptId: string;
  imageUrl: string;
  altText?: string;
  width?: number | null;
  height?: number | null;
  cloudinaryPublicId?: string | null;
}): Promise<Result> {
  await requireAdmin();
  const url = input.imageUrl.trim();
  if (!url) return { ok: false, error: "Image URL is required." };
  const existing = await db.select({ sortOrder: images.sortOrder }).from(images).where(eq(images.promptId, input.promptId));
  const nextOrder = existing.reduce((m, r) => Math.max(m, r.sortOrder), -1) + 1;
  const [row] = await db
    .insert(images)
    .values({
      promptId: input.promptId,
      imageUrl: url,
      thumbnailUrl: deriveThumbnailUrl(url),
      cloudinaryPublicId: input.cloudinaryPublicId ?? null,
      width: input.width ?? null,
      height: input.height ?? null,
      aspectRatio: input.width && input.height ? input.width / input.height : null,
      altText: input.altText?.trim() || null,
      sortOrder: nextOrder,
    })
    .returning({ id: images.id });
  revalidateAll();
  return { ok: true, data: { id: row.id } };
}

export async function updateImage(
  id: string,
  input: { altText?: string; sortOrder?: number }
): Promise<Result<{ ok: boolean }>> {
  await requireAdmin();
  await db
    .update(images)
    .set({
      ...(input.altText !== undefined ? { altText: input.altText.trim() || null } : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
    })
    .where(eq(images.id, id));
  revalidateAll();
  return { ok: true, data: { ok: true } };
}

export async function moveImage(id: string, direction: -1 | 1): Promise<Result<{ ok: boolean }>> {
  await requireAdmin();
  const [current] = await db.select().from(images).where(eq(images.id, id)).limit(1);
  if (!current) return { ok: false, error: "Image not found." };
  const siblings = await db
    .select()
    .from(images)
    .where(eq(images.promptId, current.promptId));
  const sorted = siblings.sort((a, b) => a.sortOrder - b.sortOrder);
  const idx = sorted.findIndex((s) => s.id === id);
  const swapWith = sorted[idx + direction];
  if (!swapWith) return { ok: true, data: { ok: true } };
  await db.update(images).set({ sortOrder: swapWith.sortOrder }).where(eq(images.id, current.id));
  await db.update(images).set({ sortOrder: current.sortOrder }).where(eq(images.id, swapWith.id));
  revalidateAll();
  return { ok: true, data: { ok: true } };
}

export async function deleteImage(id: string): Promise<Result<{ ok: boolean }>> {
  await requireAdmin();
  const [img] = await db.select().from(images).where(eq(images.id, id)).limit(1);
  if (!img) return { ok: false, error: "Image not found." };
  await db.delete(images).where(eq(images.id, id));
  await destroyCloudinaryAsset(img.cloudinaryPublicId).catch(() => {});
  revalidateAll();
  return { ok: true, data: { ok: true } };
}

/** Best-effort Cloudinary destroy so deleted rows don't orphan CDN assets. */
async function destroyCloudinaryAsset(publicId: string | null): Promise<void> {
  if (!publicId) return;
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return;
  const timestamp = Math.floor(Date.now() / 1000);
  const { createHmac } = await import("node:crypto");
  const signature = createHmac("sha1", apiSecret).update(`public_id=${publicId}&timestamp=${timestamp}`).digest("hex");
  const form = new FormData();
  form.set("public_id", publicId);
  form.set("timestamp", String(timestamp));
  form.set("api_key", apiKey);
  form.set("signature", signature);
  await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, { method: "POST", body: form });
}
