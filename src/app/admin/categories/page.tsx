import { getCategories } from "@/lib/queries";
import { requireAdminPage } from "../layout";
import { CategoryManager } from "@/components/admin/admin-ui";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  await requireAdminPage();
  const categories = await getCategories(false);
  return (
    <div>
      <h1 className="font-display text-3xl font-medium tracking-tight">Categories</h1>
      <p className="mb-6 mt-1 text-sm text-neutral-500">Shelves of the library — deletion is blocked while in use.</p>
      <CategoryManager initial={categories} />
    </div>
  );
}
