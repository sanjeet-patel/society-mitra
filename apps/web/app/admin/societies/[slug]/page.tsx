import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { requirePlatformAdmin } from "@/lib/auth";
import { getSocietyBySlugAdmin, getSocietyAdmins } from "@/lib/actions/platform";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EditSocietyForm } from "@/components/admin/edit-society-form";
import { AssignAdminForm } from "@/components/admin/assign-admin-form";

export default async function SocietyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { error: authError } = await requirePlatformAdmin();
  if (authError) redirect(`/login?redirect=/admin/societies/${slug}`);

  const { society, error } = await getSocietyBySlugAdmin(slug);
  if (error || !society) notFound();

  const admins = await getSocietyAdmins(society.id);

  return (
    <>
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 h-14 flex items-center gap-4">
          <h1 className="font-bold text-lg">{society.name}</h1>
          <Badge variant="secondary">{society.plan}</Badge>
          <Link href={`/${society.slug}`} className="ml-auto">
            <Button variant="outline" size="sm">
              Open society
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <EditSocietyForm
            societyId={society.id}
            defaultValues={{
              name: society.name,
              city: society.city,
              plan: society.plan,
            }}
          />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Society administrators</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {admins.length === 0 && (
                <p className="text-sm text-muted-foreground">No society admins assigned yet.</p>
              )}
              {admins.map((admin) => {
                const profile = admin.profiles as { full_name?: string; phone?: string } | null;
                const unit = admin.units as { unit_number?: string } | null;
                return (
                  <div key={admin.id} className="text-sm border-b pb-2">
                    <p className="font-medium">{profile?.full_name}</p>
                    <p className="text-muted-foreground">
                      {profile?.phone}
                      {unit?.unit_number ? ` · ${unit.unit_number}` : ""}
                    </p>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <AssignAdminForm societyId={society.id} societyName={society.name} />
      </main>
    </>
  );
}
