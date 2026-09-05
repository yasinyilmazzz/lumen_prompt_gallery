import { eq } from "drizzle-orm";
import { db } from "@/db";
import { categories, imageTags, images, models, prompts, promptVersions, tags } from "@/db/schema";
import { SEED_CATEGORIES, SEED_MODELS, SEED_PROMPTS, SEED_TAGS } from "@/lib/seed-data";
import { slugify } from "@/lib/utils";
import { deriveThumbnailUrl } from "@/lib/cloudinary";

async function seed() {
  console.log("→ Seeding LUMEN library…");

  // Idempotent: wipe in FK-safe order
  await db.delete(imageTags);
  await db.delete(images);
  await db.delete(promptVersions);
  await db.delete(prompts);
  await db.delete(tags);
  await db.delete(categories);
  await db.delete(models);

  const modelIds = new Map<string, string>();
  for (const m of SEED_MODELS) {
    const [row] = await db
      .insert(models)
      .values({
        name: m.name,
        slug: m.slug,
        gender: m.gender,
        description: m.description,
        imageUrl: m.imageUrl,
        isActive: true,
      })
      .returning({ id: models.id });
    modelIds.set(m.slug, row.id);
  }

  const categoryIds = new Map<string, string>();
  for (const c of SEED_CATEGORIES) {
    const [row] = await db
      .insert(categories)
      .values({ name: c.name, slug: c.slug, description: c.description, isActive: true })
      .returning({ id: categories.id });
    categoryIds.set(c.slug, row.id);
  }

  const tagIds = new Map<string, string>();
  for (const name of SEED_TAGS) {
    const slug = slugify(name);
    const [row] = await db
      .insert(tags)
      .values({ name, slug })
      .returning({ id: tags.id });
    tagIds.set(slug, row.id);
  }

  let imageTotal = 0;
  for (const p of SEED_PROMPTS) {
    const [promptRow] = await db
      .insert(prompts)
      .values({
        title: p.title,
        slug: p.slug,
        prompt: p.prompt,
        negativePrompt: p.negativePrompt ?? null,
        modelId: modelIds.get(p.model) ?? null,
        categoryId: categoryIds.get(p.category) ?? null,
        status: p.status,
        featured: p.featured,
        seoTitle: p.seoTitle ?? null,
        seoDescription: p.seoDescription ?? null,
        publishedAt: p.status === "published" ? new Date() : null,
      })
      .returning({ id: prompts.id });

    // Seed version 1 for every prompt (versioning architecture ready)
    await db.insert(promptVersions).values({
      promptId: promptRow.id,
      versionNumber: 1,
      prompt: p.prompt,
      negativePrompt: p.negativePrompt ?? null,
    });

    let order = 0;
    for (const img of p.images) {
      const [imgRow] = await db
        .insert(images)
        .values({
          promptId: promptRow.id,
          imageUrl: img.url,
          thumbnailUrl: deriveThumbnailUrl(img.url),
          width: img.width,
          height: img.height,
          aspectRatio: img.width / img.height,
          format: "jpeg",
          altText: img.alt,
          sortOrder: order++,
        })
        .returning({ id: images.id });
      imageTotal++;
      for (const tagSlug of img.tags) {
        const tagId = tagIds.get(slugify(tagSlug));
        if (tagId) await db.insert(imageTags).values({ imageId: imgRow.id, tagId });
      }
    }
  }

  // Cover images for categories (first published image per category)
  for (const c of SEED_CATEGORIES) {
    const catId = categoryIds.get(c.slug);
    if (!catId) continue;
    const rows = await db
      .select({ url: images.imageUrl })
      .from(images)
      .innerJoin(prompts, eq(prompts.id, images.promptId))
      .where(eq(prompts.categoryId, catId))
      .limit(1);
    if (rows[0]) {
      await db.update(categories).set({ coverImageUrl: rows[0].url }).where(eq(categories.id, catId));
    }
  }

  console.log(`✓ Seeded ${SEED_MODELS.length} models, ${SEED_CATEGORIES.length} categories, ${SEED_TAGS.length} tags, ${SEED_PROMPTS.length} prompts, ${imageTotal} images.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
