import { redirect, notFound } from "next/navigation";
import { requireMembership, isAdminRole } from "@/lib/auth";
import { getServiceProviders } from "@/lib/actions/services";
import { ServicesPageClient } from "@/components/services/services-page-client";

export default async function ServicesPage({
  params,
  searchParams,
}: {
  params: Promise<{ societySlug: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { societySlug } = await params;
  const { category } = await searchParams;
  const result = await requireMembership(societySlug);

  if (result.error === "Society not found") notFound();
  if (result.error === "Unauthorized") redirect(`/login?redirect=/${societySlug}/services`);
  if (result.error === "Not a member") redirect(`/${societySlug}/join`);

  const isAdmin = result.membership && isAdminRole(result.membership.role);
  const providers = await getServiceProviders(societySlug, category);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Local Services</h1>
      <p className="text-muted-foreground mb-6">
        Trusted plumbers, electricians, and local service providers
      </p>

      <ServicesPageClient
        societySlug={societySlug}
        providers={providers as Parameters<typeof ServicesPageClient>[0]["providers"]}
        isAdmin={!!isAdmin}
        selectedCategory={category}
      />
    </div>
  );
}
