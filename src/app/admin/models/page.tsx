import { getModels } from "@/lib/queries";
import { requireAdminPage } from "../layout";
import { ModelManager } from "@/components/admin/admin-ui";

export const dynamic = "force-dynamic";

export default async function AdminModelsPage() {
  await requireAdminPage();
  const models = await getModels(false);
  return (
    <div>
      <h1 className="font-display text-3xl font-medium tracking-tight">Models</h1>
      <p className="mb-6 mt-1 text-sm text-neutral-500">Consistent muses — add, restyle or retire them.</p>
      <ModelManager initial={models} />
    </div>
  );
}
