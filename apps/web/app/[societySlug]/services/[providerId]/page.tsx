import { redirect, notFound } from "next/navigation";
import { requireMembership } from "@/lib/auth";
import { getServiceProvider, getServiceReviews } from "@/lib/actions/services";
import { ProviderDetailClient } from "@/components/services/provider-detail-client";

export default async function ServiceProviderPage({
  params,
}: {
  params: Promise<{ societySlug: string; providerId: string }>;
}) {
  const { societySlug, providerId } = await params;
  const result = await requireMembership(societySlug);

  if (result.error === "Society not found") notFound();
  if (result.error === "Unauthorized") {
    redirect(`/login?redirect=/${societySlug}/services/${providerId}`);
  }
  if (result.error === "Not a member") redirect(`/login?redirect=/${societySlug}/dashboard`);

  const provider = await getServiceProvider(societySlug, providerId);
  if (!provider) notFound();

  const reviews = await getServiceReviews(providerId);

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <ProviderDetailClient
        societySlug={societySlug}
        provider={provider}
        reviews={reviews as Parameters<typeof ProviderDetailClient>[0]["reviews"]}
      />
    </div>
  );
}
