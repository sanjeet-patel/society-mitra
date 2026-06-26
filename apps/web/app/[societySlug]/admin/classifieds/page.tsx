import { notFound } from "next/navigation";
import { requireSocietyAdmin } from "@/lib/auth";
import { getAllClassifiedAds } from "@/lib/actions/classifieds";
import { ClassifiedManager } from "@/components/admin/classified-manager";

export default async function AdminClassifiedsPage({
  params,
}: {
  params: Promise<{ societySlug: string }>;
}) {
  const { societySlug } = await params;
  const result = await requireSocietyAdmin(societySlug);
  if (result.error === "Society not found") notFound();
  if (result.error || !result.society) return null;

  const ads = await getAllClassifiedAds(societySlug);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Classifieds</h1>
        <p className="text-muted-foreground text-sm mt-1">{result.society.name}</p>
      </div>
      <ClassifiedManager
        societySlug={societySlug}
        ads={ads as Parameters<typeof ClassifiedManager>[0]["ads"]}
      />
    </div>
  );
}
