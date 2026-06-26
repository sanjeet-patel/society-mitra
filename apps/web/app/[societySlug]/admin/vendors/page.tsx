import { notFound } from "next/navigation";
import { requireSocietyAdmin } from "@/lib/auth";
import { getAllServiceProviders } from "@/lib/actions/services";
import { getServiceCategoriesForSociety } from "@/lib/actions/categories";
import { VendorManager } from "@/components/admin/vendor-manager";

export default async function AdminVendorsPage({
  params,
}: {
  params: Promise<{ societySlug: string }>;
}) {
  const { societySlug } = await params;
  const result = await requireSocietyAdmin(societySlug);
  if (result.error === "Society not found") notFound();
  if (result.error || !result.society) return null;

  const [providers, categories] = await Promise.all([
    getAllServiceProviders(societySlug),
    getServiceCategoriesForSociety(societySlug),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Vendors &amp; services</h1>
        <p className="text-muted-foreground text-sm mt-1">{result.society.name}</p>
      </div>
      <VendorManager
        societySlug={societySlug}
        providers={providers as Parameters<typeof VendorManager>[0]["providers"]}
        categories={categories.map((c) => ({ id: c.id, label: c.label }))}
      />
    </div>
  );
}
