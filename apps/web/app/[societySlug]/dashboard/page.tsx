import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { requireMembership, isAdminRole } from "@/lib/auth";
import { getAnnouncements } from "@/lib/actions/announcements";
import { getEmergencyContacts } from "@/lib/actions/emergency";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PushPrompt } from "@/components/push/push-prompt";
import { Megaphone, Phone, Plus, User } from "lucide-react";
import { ANNOUNCEMENT_CATEGORIES } from "@society-mitra/shared";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ societySlug: string }>;
}) {
  const { societySlug } = await params;
  const result = await requireMembership(societySlug);

  if (result.error === "Society not found") notFound();
  if (result.error === "Unauthorized") redirect(`/login?redirect=/${societySlug}/dashboard`);
  if (result.error === "Not a member") redirect(`/${societySlug}/join`);

  const { society, membership } = result;
  const isAdmin = membership && isAdminRole(membership.role);

  const announcements = await getAnnouncements(societySlug);
  const emergencyContacts = await getEmergencyContacts(societySlug);
  const recentAnnouncements = announcements.slice(0, 3);
  const quickContacts = emergencyContacts.slice(0, 4);

  const categoryLabel = (cat: string) =>
    ANNOUNCEMENT_CATEGORIES.find((c) => c.value === cat)?.label ?? cat;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to {society!.name}</p>
        </div>
        <PushPrompt />
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              Recent Announcements
            </CardTitle>
            <Link href={`/${societySlug}/announcements`}>
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentAnnouncements.length === 0 && (
              <p className="text-sm text-muted-foreground">No announcements yet.</p>
            )}
            {recentAnnouncements.map((a) => (
              <div key={a.id} className="border-b pb-3 last:border-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">
                    {categoryLabel(a.category)}
                  </Badge>
                  {a.is_pinned && <Badge className="text-xs">Pinned</Badge>}
                </div>
                <p className="font-medium text-sm">{a.title}</p>
              </div>
            ))}
            {isAdmin && (
              <Link href={`/${societySlug}/announcements/new`}>
                <Button size="sm" className="gap-2 mt-2">
                  <Plus className="h-4 w-4" />
                  Post Announcement
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Quick Contacts
            </CardTitle>
            <Link href={`/${societySlug}/emergency`}>
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickContacts.length === 0 && (
              <p className="text-sm text-muted-foreground">No contacts added yet.</p>
            )}
            {quickContacts.map((c) => (
              <a
                key={c.id}
                href={`tel:${c.phone}`}
                className="flex items-center justify-between p-2 rounded-md hover:bg-muted"
              >
                <div>
                  <p className="font-medium text-sm">{c.name}</p>
                  {c.role_label && (
                    <p className="text-xs text-muted-foreground">{c.role_label}</p>
                  )}
                </div>
                <Phone className="h-4 w-4 text-primary" />
              </a>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3 flex-wrap">
        <Link href={`/${societySlug}/profile`}>
          <Button variant="outline" className="gap-2">
            <User className="h-4 w-4" />
            Update Profile
          </Button>
        </Link>
        <Link href={`/${societySlug}/directory`}>
          <Button variant="outline">Member Directory</Button>
        </Link>
        <Link href={`/${societySlug}/services`}>
          <Button variant="outline">Find Services</Button>
        </Link>
      </div>
    </div>
  );
}
