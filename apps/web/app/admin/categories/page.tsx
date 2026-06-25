import { redirect } from "next/navigation";
import { requirePlatformAdmin } from "@/lib/auth";
import { listGlobalCategories } from "@/lib/actions/categories";
import { CategoryManager } from "@/components/admin/category-manager";

export default async function PlatformCategoriesPage() {
  const { error } = await requirePlatformAdmin();
  if (error) redirect("/login?redirect=/admin/categories");

  const { categories } = await listGlobalCategories();

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Global service categories</h1>
      <CategoryManager scope="platform" categories={categories} />
    </main>
  );
}
