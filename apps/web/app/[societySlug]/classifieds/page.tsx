import { redirect, notFound } from "next/navigation";
import { requireMembership, getCurrentProfile } from "@/lib/auth";
import { getClassifiedAds } from "@/lib/actions/classifieds";
import { ClassifiedsPageClient } from "@/components/classifieds/classifieds-page-client";

export default async function ClassifiedsPage({
  params,
  searchParams,
}: {
  params: Promise<{ societySlug: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const { societySlug } = await params;
  const { type } = await searchParams;
  const result = await requireMembership(societySlug);

  if (result.error === "Society not found") notFound();
  if (result.error === "Unauthorized") redirect(`/login?redirect=/${societySlug}/classifieds`);
  if (result.error === "Not a member") redirect(`/login?redirect=/${societySlug}/dashboard`);

  const profile = await getCurrentProfile();
  const ads = await getClassifiedAds(societySlug, type);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Classifieds</h1>
      <p className="text-muted-foreground mb-6">
        Buy, sell, rent, and advertise within your society — visible to all members
      </p>

      <ClassifiedsPageClient
        societySlug={societySlug}
        ads={ads as Parameters<typeof ClassifiedsPageClient>[0]["ads"]}
        selectedType={type}
        currentProfileId={profile?.id}
      />
    </div>
  );
}
