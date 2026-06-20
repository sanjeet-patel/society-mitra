import Link from "next/link";
import { notFound } from "next/navigation";
import { getSocietyBySlug, getCurrentProfile, getMembership } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Users } from "lucide-react";

export default async function SocietyLandingPage({
  params,
}: {
  params: Promise<{ societySlug: string }>;
}) {
  const { societySlug } = await params;
  const society = await getSocietyBySlug(societySlug);
  if (!society) notFound();

  const profile = await getCurrentProfile();
  let membership = null;
  if (profile) {
    membership = await getMembership(society.id, profile.id);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-emerald-600" />
            <span className="font-bold text-lg">{society.name}</span>
          </div>
          <Link href="/">
            <Button variant="ghost" size="sm">
              Society Mitra
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">{society.name}</h1>
          {society.city && (
            <p className="text-muted-foreground flex items-center justify-center gap-1">
              <MapPin className="h-4 w-4" />
              {society.city}
            </p>
          )}
          <Badge variant="secondary" className="mt-3">
            {society.plan} plan
          </Badge>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Join this society
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!profile && (
              <>
                <p className="text-sm text-muted-foreground">
                  Sign in to request membership in {society.name}.
                </p>
                <Link href={`/login?redirect=/${societySlug}/join`}>
                  <Button className="w-full">Sign In to Join</Button>
                </Link>
              </>
            )}

            {profile && membership?.status === "approved" && (
              <Link href={`/${societySlug}/dashboard`}>
                <Button className="w-full">Go to Dashboard</Button>
              </Link>
            )}

            {profile && membership?.status === "pending" && (
              <p className="text-sm text-amber-600">
                Your membership request is pending admin approval.
              </p>
            )}

            {profile && membership?.status === "rejected" && (
              <p className="text-sm text-destructive">
                Your membership request was rejected. Contact society admin.
              </p>
            )}

            {profile && !membership && (
              <Link href={`/${societySlug}/join`}>
                <Button className="w-full">Request to Join</Button>
              </Link>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3 text-center text-sm">
          {["Directory", "Announcements", "Emergency", "Services"].map((feature) => (
            <div key={feature} className="border rounded-lg p-4 text-muted-foreground">
              {feature}
              <p className="text-xs mt-1">Members only</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
