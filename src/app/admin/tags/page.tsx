import { getTags } from "@/lib/queries";
import { requireAdminPage } from "../layout";
import { TagManager } from "@/components/admin/admin-ui";

export const dynamic = "force-dynamic";

export default async function AdminTagsPage() {
  await requireAdminPage();
  const tags = await getTags(200);
  return (
    <div>
      <h1 className="font-display text-3xl font-medium tracking-tight">Tags</h1>
      <p className="mb-6 mt-1 text-sm text-neutral-500">Micro-moods — duplicates are blocked automatically.</p>
      <TagManager initial={tags} />
    </div>
  );
}
