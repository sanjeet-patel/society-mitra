import Link from "next/link";
import { redirect } from "next/navigation";
import { requirePlatformAdmin } from "@/lib/auth";
import { listSocieties } from "@/lib/actions/platform";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateSocietyForm } from "@/components/admin/create-society-form";
import { Building2, ArrowLeft } from "lucide-react";

export default async function AdminSocietiesPage() {
  const { error } = await requirePlatformAdmin();
  if (error) redirect("/login?redirect=/admin/societies");

  const { societies } = await listSocieties();

  return (
    <div className="min-h-screen bg-palette-navy/[0.03]">
      <header className="border-b border-palette-navy/10 bg-background">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 text-palette-navy">
              <ArrowLeft className="h-4 w-4" />
              Home
            </Button>
          </Link>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-palette-navy">
            <Building2 className="h-4 w-4 text-palette-gold" />
          </div>
          <h1 className="font-bold text-lg text-palette-navy">Platform Admin</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 grid lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">Create Society</h2>
          <CreateSocietyForm />
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">
            Societies ({societies.length})
          </h2>
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
                  <Link href={`/${society.slug}`}>
                    <Button size="sm" variant="outline">
                      /{society.slug}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
            {societies.length === 0 && (
              <p className="text-muted-foreground">No societies yet.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
