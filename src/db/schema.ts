import {
  pgTable,
  uuid,
  text,
  varchar,
  boolean,
  timestamp,
  integer,
  real,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Enums — keep controlled vocabularies extensible
// ---------------------------------------------------------------------------
export const genderEnum = pgEnum("gender", ["male", "female"]);
export const promptStatusEnum = pgEnum("prompt_status", ["draft", "published"]);

// ---------------------------------------------------------------------------
// models — consistent AI characters (Alex, Emma, ...)
// ---------------------------------------------------------------------------
export const models = pgTable(
  "models",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 120 }).notNull(),
    slug: varchar("slug", { length: 140 }).notNull(),
    gender: genderEnum("gender").notNull(),
    description: text("description"),
    imageUrl: text("image_url"),
    cloudinaryPublicId: text("cloudinary_public_id"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("models_slug_idx").on(t.slug),
    index("models_gender_idx").on(t.gender),
    index("models_active_idx").on(t.isActive),
  ]
);

// ---------------------------------------------------------------------------
// categories
// ---------------------------------------------------------------------------
export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 120 }).notNull(),
    slug: varchar("slug", { length: 140 }).notNull(),
    description: text("description"),
    coverImageUrl: text("cover_image_url"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("categories_slug_idx").on(t.slug),
    index("categories_active_idx").on(t.isActive),
  ]
);

// ---------------------------------------------------------------------------
// tags
// ---------------------------------------------------------------------------
export const tags = pgTable(
  "tags",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 80 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("tags_slug_idx").on(t.slug)]
);

// ---------------------------------------------------------------------------
// prompts — one prompt can own many images
// ---------------------------------------------------------------------------
export const prompts = pgTable(
  "prompts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 220 }).notNull(),
    slug: varchar("slug", { length: 240 }).notNull(),
    prompt: text("prompt").notNull(),
    negativePrompt: text("negative_prompt"),
    modelId: uuid("model_id").references(() => models.id, { onDelete: "set null" }),
    categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
    status: promptStatusEnum("status").notNull().default("draft"),
    featured: boolean("featured").notNull().default(false),
    copyCount: integer("copy_count").notNull().default(0),
    viewCount: integer("view_count").notNull().default(0),
    seoTitle: varchar("seo_title", { length: 220 }),
    seoDescription: varchar("seo_description", { length: 320 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
  },
  (t) => [
    uniqueIndex("prompts_slug_idx").on(t.slug),
    index("prompts_status_idx").on(t.status),
    index("prompts_model_idx").on(t.modelId),
    index("prompts_category_idx").on(t.categoryId),
    index("prompts_featured_idx").on(t.featured),
    index("prompts_created_idx").on(t.createdAt),
    index("prompts_published_idx").on(t.publishedAt),
  ]
);

// ---------------------------------------------------------------------------
// images — Cloudinary-backed, transformation URLs derived, never duplicated
// ---------------------------------------------------------------------------
export const images = pgTable(
  "images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    promptId: uuid("prompt_id")
      .references(() => prompts.id, { onDelete: "cascade" })
      .notNull(),
    imageUrl: text("image_url").notNull(),
    thumbnailUrl: text("thumbnail_url"),
    cloudinaryPublicId: text("cloudinary_public_id"),
    width: integer("width"),
    height: integer("height"),
    aspectRatio: real("aspect_ratio"),
    format: varchar("format", { length: 20 }),
    altText: text("alt_text"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("images_prompt_idx").on(t.promptId),
    index("images_sort_idx").on(t.promptId, t.sortOrder),
  ]
);

// ---------------------------------------------------------------------------
// image_tags — many-to-many
// ---------------------------------------------------------------------------
export const imageTags = pgTable(
  "image_tags",
  {
    imageId: uuid("image_id")
      .references(() => images.id, { onDelete: "cascade" })
      .notNull(),
    tagId: uuid("tag_id")
      .references(() => tags.id, { onDelete: "cascade" })
      .notNull(),
  },
  (t) => [
    index("image_tags_image_idx").on(t.imageId),
    index("image_tags_tag_idx").on(t.tagId),
  ]
);

// ---------------------------------------------------------------------------
// prompt_versions — architecture-ready versioning (not required for V1 UI)
// ---------------------------------------------------------------------------
export const promptVersions = pgTable(
  "prompt_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    promptId: uuid("prompt_id")
      .references(() => prompts.id, { onDelete: "cascade" })
      .notNull(),
    versionNumber: integer("version_number").notNull(),
    prompt: text("prompt").notNull(),
    negativePrompt: text("negative_prompt"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("prompt_versions_prompt_idx").on(t.promptId),
    uniqueIndex("prompt_versions_unique_idx").on(t.promptId, t.versionNumber),
  ]
);

// ---------------------------------------------------------------------------
// Type exports
// ---------------------------------------------------------------------------
export type Model = typeof models.$inferSelect;
export type NewModel = typeof models.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
export type Prompt = typeof prompts.$inferSelect;
export type NewPrompt = typeof prompts.$inferInsert;
export type Image = typeof images.$inferSelect;
export type NewImage = typeof images.$inferInsert;
export type PromptVersion = typeof promptVersions.$inferSelect;
