import { redirect, notFound } from "next/navigation";
import { requireSocietyAdmin } from "@/lib/auth";
import { getAllClassifiedAds } from "@/lib/actions/classifieds";
import { ClassifiedManager } from "@/components/admin/classified-manager";
import { SocietyAdminHeader } from "@/components/admin/society-admin-header";

export default async function AdminClassifiedsPage({
  params,
}: {
  params: Promise<{ societySlug: string }>;
}) {
  const { societySlug } = await params;
  const result = await requireSocietyAdmin(societySlug);

  if (result.error === "Society not found") notFound();
  if (result.error === "Unauthorized") redirect(`/login?redirect=/${societySlug}/admin/classifieds`);
  if (result.error === "Forbidden") redirect(`/${societySlug}/dashboard`);

  const ads = await getAllClassifiedAds(societySlug);

  return (
    <div className="container mx-auto px-4 py-8">
      <SocietyAdminHeader
        societySlug={societySlug}
        societyName={result.society!.name}
        title="Classifieds"
      />
      <ClassifiedManager
        societySlug={societySlug}
        ads={ads as Parameters<typeof ClassifiedManager>[0]["ads"]}
      />
    </div>
  );
}
