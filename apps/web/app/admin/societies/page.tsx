import Link from "next/link";
import { redirect } from "next/navigation";
import { requirePlatformAdmin, getCurrentUser } from "@/lib/auth";
import { listSocieties } from "@/lib/actions/platform";
import { AccessDenied } from "@/components/auth/access-denied";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateSocietyForm } from "@/components/admin/create-society-form";

export default async function AdminSocietiesPage() {
  const user = await getCurrentUser();
  const { error } = await requirePlatformAdmin();
  if (error) {
    if (!user) redirect("/login?redirect=/admin/societies");
    return (
      <AccessDenied message="This area is for platform super admins only." backHref="/" />
    );
  }

  const { societies } = await listSocieties();

  return (
    <main className="container mx-auto px-4 py-8 grid lg:grid-cols-2 gap-8">
      <div>
        <h1 className="text-2xl font-bold mb-4">Create Society</h1>
        <CreateSocietyForm />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Societies ({societies.length})</h2>
        <div className="space-y-3">
          {societies.map((society) => (
            <Card key={society.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{society.name}</CardTitle>
                  <Badge variant="secondary">{society.plan}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  {society.city} · Limit: {society.family_limit ?? "Unlimited"}
                </p>
                <div className="flex gap-2">
                  <Link href={`/admin/societies/${society.slug}`}>
                    <Button size="sm">Manage</Button>
                  </Link>
                  <Link href={`/${society.slug}`}>
                    <Button size="sm" variant="outline">
                      /{society.slug}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
          {societies.length === 0 && (
            <p className="text-muted-foreground">No societies yet.</p>
          )}
        </div>
      </div>
    </main>
  );
}
