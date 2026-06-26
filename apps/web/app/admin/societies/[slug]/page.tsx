import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { requirePlatformAdmin } from "@/lib/auth";
import {
  getSocietyBySlugAdmin,
  getSocietyAdmins,
  getSocietyMemberStats,
} from "@/lib/actions/platform";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EditSocietyForm } from "@/components/admin/edit-society-form";
import { AssignAdminForm } from "@/components/admin/assign-admin-form";
import { ExternalLink, Settings, Users } from "lucide-react";

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

  const [admins, memberStats] = await Promise.all([
    getSocietyAdmins(society.id),
    getSocietyMemberStats(society.id),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{society.name}</h1>
            <Badge variant="secondary">{society.plan}</Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            /{society.slug}
            {society.city ? ` · ${society.city}` : ""}
            · Member limit: {society.family_limit ?? "Unlimited"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/${society.slug}/admin`}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Settings className="h-4 w-4" />
              Society admin
            </Button>
          </Link>
          <Link href={`/${society.slug}/admin/members`}>
            <Button size="sm" className="gap-1.5">
              <Users className="h-4 w-4" />
              User management
            </Button>
          </Link>
          <Link href={`/${society.slug}`} target="_blank">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ExternalLink className="h-4 w-4" />
              Open site
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Approved members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{memberStats.approved}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending requests
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between gap-2">
            <p className="text-3xl font-bold">{memberStats.pending}</p>
            {memberStats.pending > 0 && (
              <Link href={`/${society.slug}/admin/members`}>
                <Button size="sm" variant="outline">
                  Review
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Society admins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{admins.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
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
                  <div key={admin.id} className="text-sm border-b pb-2 last:border-0">
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
      </div>
    </div>
  );
}
