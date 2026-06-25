import { redirect, notFound } from "next/navigation";
import { requireSocietyAdmin } from "@/lib/auth";
import { getAllServiceProviders } from "@/lib/actions/services";
import { getServiceCategoriesForSociety } from "@/lib/actions/categories";
import { VendorManager } from "@/components/admin/vendor-manager";
import { SocietyAdminHeader } from "@/components/admin/society-admin-header";

export default async function AdminVendorsPage({
  params,
}: {
  params: Promise<{ societySlug: string }>;
}) {
  const { societySlug } = await params;
  const result = await requireSocietyAdmin(societySlug);

  if (result.error === "Society not found") notFound();
  if (result.error === "Unauthorized") redirect(`/login?redirect=/${societySlug}/admin/vendors`);
  if (result.error === "Forbidden") redirect(`/${societySlug}/dashboard`);

  const [providers, categories] = await Promise.all([
    getAllServiceProviders(societySlug),
    getServiceCategoriesForSociety(societySlug),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <SocietyAdminHeader
        societySlug={societySlug}
        societyName={result.society!.name}
        title="Vendors & services"
      />
      <VendorManager
        societySlug={societySlug}
        providers={providers as Parameters<typeof VendorManager>[0]["providers"]}
        categories={categories.map((c) => ({ id: c.id, label: c.label }))}
      />
    </div>
  );
}
