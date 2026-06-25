import { redirect, notFound } from "next/navigation";
import { requireSocietyAdmin } from "@/lib/auth";
import {
  getServiceCategoriesForSociety,
  listSocietyCategories,
} from "@/lib/actions/categories";
import { CategoryManager } from "@/components/admin/category-manager";
import { SocietyAdminHeader } from "@/components/admin/society-admin-header";

export default async function SocietyCategoriesPage({
  params,
}: {
  params: Promise<{ societySlug: string }>;
}) {
  const { societySlug } = await params;
  const result = await requireSocietyAdmin(societySlug);
  if (result.error === "Society not found") notFound();
  if (result.error) redirect(`/${societySlug}/dashboard`);

  const globalCategories = (await getServiceCategoriesForSociety(societySlug)).filter(
    (c) => !c.society_id
  );
  const { categories: societyCategories } = await listSocietyCategories(societySlug);

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <SocietyAdminHeader
        societySlug={societySlug}
        societyName={result.society!.name}
        title="Service categories"
      />
      <CategoryManager
        scope="society"
        societySlug={societySlug}
        categories={societyCategories}
        globalCategories={globalCategories}
      />
    </div>
  );
}
