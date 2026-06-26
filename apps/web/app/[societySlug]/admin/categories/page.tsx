import { notFound } from "next/navigation";
import { requireSocietyAdmin } from "@/lib/auth";
import {
  getServiceCategoriesForSociety,
  listSocietyCategories,
} from "@/lib/actions/categories";
import { CategoryManager } from "@/components/admin/category-manager";

export default async function SocietyCategoriesPage({
  params,
}: {
  params: Promise<{ societySlug: string }>;
}) {
  const { societySlug } = await params;
  const result = await requireSocietyAdmin(societySlug);
  if (result.error === "Society not found") notFound();
  if (result.error || !result.society) return null;

  const globalCategories = (await getServiceCategoriesForSociety(societySlug)).filter(
    (c) => !c.society_id
  );
  const { categories: societyCategories } = await listSocietyCategories(societySlug);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Service categories</h1>
        <p className="text-muted-foreground text-sm mt-1">{result.society.name}</p>
      </div>
      <CategoryManager
        scope="society"
        societySlug={societySlug}
        categories={societyCategories}
        globalCategories={globalCategories}
      />
    </div>
  );
}
