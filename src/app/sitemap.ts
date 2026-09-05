import type { MetadataRoute } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { categories, models, prompts } from "@/db/schema";
import { siteUrl } from "@/lib/utils";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const staticPages: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/explore`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/male`, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/female`, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/models`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/categories`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/tags`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.4 },
  ];

  try {
    const [pubPrompts, activeModels, activeCats] = await Promise.all([
      db
        .select({ slug: prompts.slug, updatedAt: prompts.updatedAt })
        .from(prompts)
        .where(eq(prompts.status, "published")),
      db.select({ slug: models.slug }).from(models).where(eq(models.isActive, true)),
      db.select({ slug: categories.slug }).from(categories).where(eq(categories.isActive, true)),
    ]);

    return [
      ...staticPages,
      ...pubPrompts.map((p) => ({
        url: `${base}/prompts/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.85,
      })),
      ...activeModels.map((m) => ({ url: `${base}/models/${m.slug}`, changeFrequency: "weekly" as const, priority: 0.7 })),
      ...activeCats.map((c) => ({ url: `${base}/categories/${c.slug}`, changeFrequency: "weekly" as const, priority: 0.7 })),
    ];
  } catch {
    return staticPages;
  }
}
