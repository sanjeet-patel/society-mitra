import Link from "next/link";
import { redirect } from "next/navigation";
import { requirePlatformAdmin, getCurrentUser } from "@/lib/auth";
import { getPlatformDashboardStats } from "@/lib/actions/platform";
import { AccessDenied } from "@/components/auth/access-denied";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Tag, Wrench } from "lucide-react";

export default async function PlatformDashboardPage() {
  const user = await getCurrentUser();
  const { error } = await requirePlatformAdmin();

  if (error) {
    if (!user) redirect("/login?redirect=/admin");
    return (
      <AccessDenied
        message="This area is for platform super admins only. Sign in with a platform admin account."
        backHref="/"
      />
    );
  }

  const result = await getPlatformDashboardStats();
  if (result.error || !result.stats) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-destructive">
          Could not load platform dashboard. Check SUPABASE_SERVICE_ROLE_KEY is configured.
        </p>
      </div>
    );
  }

  const { stats } = result;

  return (
    <main className="container mx-auto px-4 py-8 space-y-8">
      <h1 className="text-2xl font-bold text-palette-navy">Platform Dashboard</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Building2 className="h-4 w-4" /> Societies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.societyCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" /> Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.memberCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Tag className="h-4 w-4" /> Classifieds
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.classifiedCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Wrench className="h-4 w-4" /> Vendors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.vendorCount}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-bold mb-4">Societies</h2>
            <div className="space-y-2">
              {stats.societies.map((s) => (
                <Card key={s.id}>
                  <CardContent className="py-3 flex items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">{s.name}</p>
                      <p className="text-sm text-muted-foreground">
                        /{s.slug} · {s.city ?? "—"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{s.plan}</Badge>
                      <Link href={`/admin/societies/${s.slug}`}>
                        <Button size="sm" variant="outline">
                          Manage
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold mb-4">Recent members</h2>
              <div className="space-y-2">
                {stats.recentMembers.map((m) => {
                  const society = m.societies as { name?: string; slug?: string } | null;
                  const profile = m.profiles as { full_name?: string; phone?: string } | null;
                  return (
                    <Card key={m.id}>
                      <CardContent className="py-3 text-sm">
                        <p className="font-medium">{profile?.full_name}</p>
                        <p className="text-muted-foreground">
                          {profile?.phone} · {society?.name} · {m.role}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">Recent classifieds</h2>
              <div className="space-y-2">
                {stats.recentClassifieds.map((ad) => {
                  const society = ad.societies as { name?: string } | null;
                  const profile = ad.profiles as { full_name?: string } | null;
                  return (
                    <Card key={ad.id}>
                      <CardContent className="py-3 text-sm">
                        <p className="font-medium">{ad.title}</p>
                        <p className="text-muted-foreground">
                          {society?.name} · {profile?.full_name} · {ad.status}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
    </main>
  );
}
