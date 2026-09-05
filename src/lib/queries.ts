import { and, asc, desc, eq, ilike, inArray, or, sql, count } from "drizzle-orm";
import { db } from "@/db";
import { categories, imageTags, images, models, prompts, tags } from "@/db/schema";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type GalleryItem = {
  imageId: string;
  imageUrl: string;
  thumbnailUrl: string | null;
  altText: string | null;
  width: number | null;
  height: number | null;
  sortOrder: number;
  promptId: string;
  promptSlug: string;
  title: string;
  prompt: string;
  featured: boolean;
  publishedAt: Date | null;
  modelId: string | null;
  modelName: string | null;
  modelSlug: string | null;
  modelGender: "male" | "female" | null;
  categoryId: string | null;
  categoryName: string | null;
  categorySlug: string | null;
};

export type ExploreFilters = {
  gender?: "male" | "female";
  category?: string;
  model?: string;
  tag?: string;
  q?: string;
  featured?: boolean;
};

// ---------------------------------------------------------------------------
// Gallery query — single reusable reader for every public gallery surface
// ---------------------------------------------------------------------------
export async function getGalleryItems(filters: ExploreFilters = {}, limit = 48, offset = 0): Promise<GalleryItem[]> {
  const conditions = [eq(prompts.status, "published")];

  if (filters.gender) conditions.push(eq(models.gender, filters.gender));
  if (filters.category) conditions.push(eq(categories.slug, filters.category));
  if (filters.model) conditions.push(eq(models.slug, filters.model));
  if (filters.featured) conditions.push(eq(prompts.featured, true));

  if (filters.tag) {
    const tagged = db
      .select({ imageId: imageTags.imageId })
      .from(imageTags)
      .innerJoin(tags, eq(tags.id, imageTags.tagId))
      .where(eq(tags.slug, filters.tag));
    conditions.push(inArray(images.id, tagged));
  }

  if (filters.q) {
    const needle = `%${filters.q.trim()}%`;
    conditions.push(
      or(
        ilike(prompts.title, needle),
        ilike(prompts.prompt, needle),
        ilike(models.name, needle),
        ilike(categories.name, needle)
      )!
    );
  }

  const rows = await db
    .select({
      imageId: images.id,
      imageUrl: images.imageUrl,
      thumbnailUrl: images.thumbnailUrl,
      altText: images.altText,
      width: images.width,
      height: images.height,
      sortOrder: images.sortOrder,
      promptId: prompts.id,
      promptSlug: prompts.slug,
      title: prompts.title,
      prompt: prompts.prompt,
      featured: prompts.featured,
      publishedAt: prompts.publishedAt,
      modelId: models.id,
      modelName: models.name,
      modelSlug: models.slug,
      modelGender: models.gender,
      categoryId: categories.id,
      categoryName: categories.name,
      categorySlug: categories.slug,
    })
    .from(images)
    .innerJoin(prompts, eq(prompts.id, images.promptId))
    .leftJoin(models, eq(models.id, prompts.modelId))
    .leftJoin(categories, eq(categories.id, prompts.categoryId))
    .where(and(...conditions))
    .orderBy(desc(prompts.featured), desc(prompts.publishedAt), desc(images.sortOrder))
    .limit(limit)
    .offset(offset);

  return rows;
}

export async function countGalleryItems(filters: ExploreFilters = {}): Promise<number> {
  const conditions = [eq(prompts.status, "published")];
  if (filters.gender) conditions.push(eq(models.gender, filters.gender));
  if (filters.category) conditions.push(eq(categories.slug, filters.category));
  if (filters.model) conditions.push(eq(models.slug, filters.model));
  if (filters.featured) conditions.push(eq(prompts.featured, true));
  if (filters.tag) {
    const tagged = db
      .select({ imageId: imageTags.imageId })
      .from(imageTags)
      .innerJoin(tags, eq(tags.id, imageTags.tagId))
      .where(eq(tags.slug, filters.tag));
    conditions.push(inArray(images.id, tagged));
  }
  if (filters.q) {
    const needle = `%${filters.q.trim()}%`;
    conditions.push(
      or(
        ilike(prompts.title, needle),
        ilike(prompts.prompt, needle),
        ilike(models.name, needle),
        ilike(categories.name, needle)
      )!
    );
  }
  const [row] = await db
    .select({ value: count() })
    .from(images)
    .innerJoin(prompts, eq(prompts.id, images.promptId))
    .leftJoin(models, eq(models.id, prompts.modelId))
    .leftJoin(categories, eq(categories.id, prompts.categoryId))
    .where(and(...conditions));
  return row?.value ?? 0;
}

// ---------------------------------------------------------------------------
// Prompts
// ---------------------------------------------------------------------------
export async function getPromptBySlug(slug: string, includeDrafts = false) {
  const conditions = [eq(prompts.slug, slug)];
  if (!includeDrafts) conditions.push(eq(prompts.status, "published"));
  const [prompt] = await db
    .select()
    .from(prompts)
    .where(and(...conditions))
    .limit(1);
  if (!prompt) return null;

  const [model] = prompt.modelId
    ? await db.select().from(models).where(eq(models.id, prompt.modelId)).limit(1)
    : [null];
  const [category] = prompt.categoryId
    ? await db.select().from(categories).where(eq(categories.id, prompt.categoryId)).limit(1)
    : [null];
  const promptImages = await db
    .select()
    .from(images)
    .where(eq(images.promptId, prompt.id))
    .orderBy(asc(images.sortOrder), asc(images.createdAt));

  const promptTags =
    promptImages.length > 0
      ? await db
          .select({ id: tags.id, name: tags.name, slug: tags.slug })
          .from(tags)
          .innerJoin(imageTags, eq(imageTags.tagId, tags.id))
          .where(
            inArray(
              imageTags.imageId,
              promptImages.map((i) => i.id)
            )
          )
      : [];

  const deduped = [...new Map(promptTags.map((t) => [t.slug, t])).values()];

  return { prompt, model, category, images: promptImages, tags: deduped };
}

export async function getRelatedPrompts(promptId: string, categoryId: string | null, limit = 8): Promise<GalleryItem[]> {
  const conditions = [eq(prompts.status, "published"), sql`${prompts.id} != ${promptId}`];
  if (categoryId) conditions.push(eq(prompts.categoryId, categoryId));
  const rows = await db
    .select({
      imageId: images.id,
      imageUrl: images.imageUrl,
      thumbnailUrl: images.thumbnailUrl,
      altText: images.altText,
      width: images.width,
      height: images.height,
      sortOrder: images.sortOrder,
      promptId: prompts.id,
      promptSlug: prompts.slug,
      title: prompts.title,
      prompt: prompts.prompt,
      featured: prompts.featured,
      publishedAt: prompts.publishedAt,
      modelId: models.id,
      modelName: models.name,
      modelSlug: models.slug,
      modelGender: models.gender,
      categoryId: categories.id,
      categoryName: categories.name,
      categorySlug: categories.slug,
    })
    .from(images)
    .innerJoin(prompts, eq(prompts.id, images.promptId))
    .leftJoin(models, eq(models.id, prompts.modelId))
    .leftJoin(categories, eq(categories.id, prompts.categoryId))
    .where(and(...conditions))
    .orderBy(desc(prompts.publishedAt))
    .limit(limit);
  // One card per prompt
  const seen = new Set<string>();
  return rows.filter((r) => (seen.has(r.promptId) ? false : (seen.add(r.promptId), true)));
}

// ---------------------------------------------------------------------------
// Models / Categories / Tags
// ---------------------------------------------------------------------------
export async function getModels(activeOnly = true) {
  const q = activeOnly ? db.select().from(models).where(eq(models.isActive, true)).orderBy(asc(models.name))
    : db.select().from(models).orderBy(asc(models.name));
  return q;
}

export async function getModelBySlug(slug: string) {
  const [model] = await db.select().from(models).where(eq(models.slug, slug)).limit(1);
  return model ?? null;
}

export async function getCategories(activeOnly = true) {
  const q = activeOnly
    ? db.select().from(categories).where(eq(categories.isActive, true)).orderBy(asc(categories.name))
    : db.select().from(categories).orderBy(asc(categories.name));
  return q;
}

export async function getCategoryBySlug(slug: string) {
  const [cat] = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return cat ?? null;
}

export async function getTags(limit = 60) {
  return db.select().from(tags).orderBy(asc(tags.name)).limit(limit);
}

export async function getTagBySlug(slug: string) {
  const [tag] = await db.select().from(tags).where(eq(tags.slug, slug)).limit(1);
  return tag ?? null;
}

export async function getCategoryCounts(): Promise<Record<string, number>> {
  const rows = await db
    .select({ slug: categories.slug, value: count() })
    .from(images)
    .innerJoin(prompts, eq(prompts.id, images.promptId))
    .innerJoin(categories, eq(categories.id, prompts.categoryId))
    .where(eq(prompts.status, "published"))
    .groupBy(categories.slug);
  return Object.fromEntries(rows.map((r) => [r.slug, r.value]));
}

export async function getModelCounts(): Promise<Record<string, number>> {
  const rows = await db
    .select({ slug: models.slug, value: count() })
    .from(images)
    .innerJoin(prompts, eq(prompts.id, images.promptId))
    .innerJoin(models, eq(models.id, prompts.modelId))
    .where(eq(prompts.status, "published"))
    .groupBy(models.slug);
  return Object.fromEntries(rows.map((r) => [r.slug, r.value]));
}

// ---------------------------------------------------------------------------
// Admin — stats & management readers
// ---------------------------------------------------------------------------
export async function getAdminStats() {
  const [total, published, drafts, imgs, mods, cats, copies] = await Promise.all([
    db.select({ value: count() }).from(prompts),
    db.select({ value: count() }).from(prompts).where(eq(prompts.status, "published")),
    db.select({ value: count() }).from(prompts).where(eq(prompts.status, "draft")),
    db.select({ value: count() }).from(images),
    db.select({ value: count() }).from(models),
    db.select({ value: count() }).from(categories),
    db.select({ value: sql<number>`coalesce(sum(${prompts.copyCount}), 0)` }).from(prompts),
  ]);
  return {
    totalPrompts: total[0]?.value ?? 0,
    publishedPrompts: published[0]?.value ?? 0,
    draftPrompts: drafts[0]?.value ?? 0,
    totalImages: imgs[0]?.value ?? 0,
    totalModels: mods[0]?.value ?? 0,
    totalCategories: cats[0]?.value ?? 0,
    totalCopies: Number(copies[0]?.value ?? 0),
  };
}

export async function getAdminPrompts(status?: "draft" | "published") {
  const base = db
    .select({
      id: prompts.id,
      title: prompts.title,
      slug: prompts.slug,
      status: prompts.status,
      featured: prompts.featured,
      copyCount: prompts.copyCount,
      viewCount: prompts.viewCount,
      updatedAt: prompts.updatedAt,
      publishedAt: prompts.publishedAt,
      modelName: models.name,
      categoryName: categories.name,
      imageCount: sql<number>`(select count(*) from images where images.prompt_id = ${prompts.id})`,
      coverUrl: sql<string | null>`(select images.image_url from images where images.prompt_id = ${prompts.id} order by images.sort_order asc limit 1)`,
    })
    .from(prompts)
    .leftJoin(models, eq(models.id, prompts.modelId))
    .leftJoin(categories, eq(categories.id, prompts.categoryId));
  if (status) return base.where(eq(prompts.status, status)).orderBy(desc(prompts.updatedAt));
  return base.orderBy(desc(prompts.updatedAt));
}
