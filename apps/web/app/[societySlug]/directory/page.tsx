import { redirect, notFound } from "next/navigation";
import { requireMembership } from "@/lib/auth";
import { getDirectoryMembers, getTenantsForSociety } from "@/lib/actions/directory";
import { DirectorySearch } from "@/components/directory/directory-search";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function DirectoryPage({
  params,
}: {
  params: Promise<{ societySlug: string }>;
}) {
  const { societySlug } = await params;
  const result = await requireMembership(societySlug);

  if (result.error === "Society not found") notFound();
  if (result.error === "Unauthorized") redirect(`/login?redirect=/${societySlug}/directory`);
  if (result.error === "Not a member") redirect(`/${societySlug}/join`);

  const members = await getDirectoryMembers(societySlug);
  const tenants = await getTenantsForSociety(societySlug);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Member Directory</h1>
      <p className="text-muted-foreground mb-6">
        Search residents by name, house number, mobile, or vehicle
      </p>

      <DirectorySearch societySlug={societySlug} initialMembers={members} />

      {tenants.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-4">Tenants</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {tenants.map((tenant) => (
              <Card key={tenant.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{tenant.full_name}</CardTitle>
                    {tenant.police_verified && (
                      <Badge variant="outline" className="text-emerald-600">
                        Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Unit {(tenant.units as { unit_number: string } | null)?.unit_number}
                  </p>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  {tenant.phone && <p>Phone: {tenant.phone}</p>}
                  {tenant.occupation && <p>Occupation: {tenant.occupation}</p>}
                  {tenant.rental_start && (
                    <p>Rental from: {tenant.rental_start}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
