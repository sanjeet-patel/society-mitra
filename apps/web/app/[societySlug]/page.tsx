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
      <header className="border-b border-palette-navy/10 bg-background/85 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-palette-navy">
              <Building2 className="h-5 w-5 text-palette-gold" />
            </div>
            <span className="font-bold text-lg tracking-tight text-palette-navy">{society.name}</span>
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
              Member access
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!profile && (
              <>
                <p className="text-sm text-muted-foreground">
                  Create an account, then request to join this society. Society admins approve new
                  members.
                </p>
                <Link href={`/signup?redirect=/${societySlug}/join`}>
                  <Button className="w-full">Register</Button>
                </Link>
                <Link href={`/login?redirect=/${societySlug}/join`}>
                  <Button variant="outline" className="w-full">
                    Sign in
                  </Button>
                </Link>
              </>
            )}

            {profile && !membership && (
              <>
                <p className="text-sm text-muted-foreground">
                  Request access to {society.name}. An admin will review your join request.
                </p>
                <Link href={`/${societySlug}/join`}>
                  <Button className="w-full">Request to join</Button>
                </Link>
              </>
            )}

            {profile && membership?.status === "pending" && (
              <>
                <p className="text-sm text-muted-foreground">
                  Your join request is pending approval by a society admin.
                </p>
                <Link href={`/${societySlug}/join`}>
                  <Button variant="outline" className="w-full">
                    View request status
                  </Button>
                </Link>
              </>
            )}

            {profile && membership?.status === "approved" && (
              <Link href={`/${societySlug}/dashboard`}>
                <Button className="w-full">Go to Dashboard</Button>
              </Link>
            )}

            {profile && membership?.status === "rejected" && (
              <>
                <p className="text-sm text-muted-foreground">
                  Your previous request was not approved. You may submit a new join request.
                </p>
                <Link href={`/${societySlug}/join`}>
                  <Button className="w-full">Request again</Button>
                </Link>
              </>
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
