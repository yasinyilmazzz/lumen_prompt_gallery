import { and, asc, desc, eq, ilike, inArray, or, sql, count } from "drizzle-orm";
import { db } from "@/db";
import { categories, imageTags, images, models, prompts, tags } from "@/db/schema";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type GalleryImage = {
  imageId: string;
  imageUrl: string;
  thumbnailUrl: string | null;
  altText: string | null;
  width: number | null;
  height: number | null;
  sortOrder: number;
};

export type GalleryPromptCard = {
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
  images: GalleryImage[];
};

export type ExploreFilters = {
  gender?: "male" | "female";
  category?: string;
  model?: string;
  tag?: string;
  q?: string;
  featured?: boolean;
};

function buildGalleryPromptConditions(filters: ExploreFilters) {
  const conditions = [
    eq(prompts.status, "published"),
    sql`exists (select 1 from images i where i.prompt_id = ${prompts.id})`,
  ];

  if (filters.gender) conditions.push(eq(models.gender, filters.gender));
  if (filters.category) conditions.push(eq(categories.slug, filters.category));
  if (filters.model) conditions.push(eq(models.slug, filters.model));
  if (filters.featured) conditions.push(eq(prompts.featured, true));

  if (filters.tag) {
    conditions.push(
      sql`exists (
        select 1 from images i
        inner join image_tags it on it.image_id = i.id
        inner join tags t on t.id = it.tag_id
        where i.prompt_id = ${prompts.id} and t.slug = ${filters.tag}
      )`
    );
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

  return conditions;
}

async function attachImagesToPromptCards(
  promptRows: Omit<GalleryPromptCard, "images">[]
): Promise<GalleryPromptCard[]> {
  if (promptRows.length === 0) return [];

  const promptIds = promptRows.map((p) => p.promptId);
  const imageRows = await db
    .select({
      imageId: images.id,
      imageUrl: images.imageUrl,
      thumbnailUrl: images.thumbnailUrl,
      altText: images.altText,
      width: images.width,
      height: images.height,
      sortOrder: images.sortOrder,
      promptId: images.promptId,
    })
    .from(images)
    .where(inArray(images.promptId, promptIds))
    .orderBy(asc(images.sortOrder), asc(images.createdAt));

  const imagesByPrompt = new Map<string, GalleryImage[]>();
  for (const row of imageRows) {
    const { promptId, ...image } = row;
    const list = imagesByPrompt.get(promptId) ?? [];
    list.push(image);
    imagesByPrompt.set(promptId, list);
  }

  return promptRows
    .map((prompt) => ({
      ...prompt,
      images: imagesByPrompt.get(prompt.promptId) ?? [],
    }))
    .filter((card) => card.images.length > 0);
}

// ---------------------------------------------------------------------------
// Gallery query — one card per prompt, all images grouped for carousel
// ---------------------------------------------------------------------------
export async function getGalleryItems(
  filters: ExploreFilters = {},
  limit = 48,
  offset = 0
): Promise<GalleryPromptCard[]> {
  const conditions = buildGalleryPromptConditions(filters);

  const promptRows = await db
    .select({
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
    .from(prompts)
    .leftJoin(models, eq(models.id, prompts.modelId))
    .leftJoin(categories, eq(categories.id, prompts.categoryId))
    .where(and(...conditions))
    .orderBy(desc(prompts.featured), desc(prompts.publishedAt))
    .limit(limit)
    .offset(offset);

  return attachImagesToPromptCards(promptRows);
}

export async function countGalleryItems(filters: ExploreFilters = {}): Promise<number> {
  const conditions = buildGalleryPromptConditions(filters);
  const [row] = await db
    .select({ value: count() })
    .from(prompts)
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

export async function getRelatedPrompts(
  promptId: string,
  categoryId: string | null,
  limit = 8
): Promise<GalleryPromptCard[]> {
  const conditions = [
    eq(prompts.status, "published"),
    sql`${prompts.id} != ${promptId}`,
    sql`exists (select 1 from images i where i.prompt_id = ${prompts.id})`,
  ];
  if (categoryId) conditions.push(eq(prompts.categoryId, categoryId));

  const promptRows = await db
    .select({
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
    .from(prompts)
    .leftJoin(models, eq(models.id, prompts.modelId))
    .leftJoin(categories, eq(categories.id, prompts.categoryId))
    .where(and(...conditions))
    .orderBy(desc(prompts.publishedAt))
    .limit(limit);

  return attachImagesToPromptCards(promptRows);
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
  const result = await db.execute<{
    total_prompts: number;
    published_prompts: number;
    draft_prompts: number;
    total_copies: string | number;
    total_images: number;
    total_models: number;
    total_categories: number;
  }>(sql`
    select
      (select count(*)::int from prompts) as total_prompts,
      (select count(*)::int from prompts where status = 'published') as published_prompts,
      (select count(*)::int from prompts where status = 'draft') as draft_prompts,
      (select coalesce(sum(copy_count), 0) from prompts) as total_copies,
      (select count(*)::int from images) as total_images,
      (select count(*)::int from models) as total_models,
      (select count(*)::int from categories) as total_categories
  `);

  const row = result.rows[0];
  return {
    totalPrompts: row?.total_prompts ?? 0,
    publishedPrompts: row?.published_prompts ?? 0,
    draftPrompts: row?.draft_prompts ?? 0,
    totalImages: row?.total_images ?? 0,
    totalModels: row?.total_models ?? 0,
    totalCategories: row?.total_categories ?? 0,
    totalCopies: Number(row?.total_copies ?? 0),
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
