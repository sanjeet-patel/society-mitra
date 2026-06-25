import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { requireMembership, requireSocietyAdmin, isAdminRole } from "@/lib/auth";
import { getAnnouncements, deleteAnnouncement } from "@/lib/actions/announcements";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { ANNOUNCEMENT_CATEGORIES } from "@society-mitra/shared";

export default async function AnnouncementsPage({
  params,
}: {
  params: Promise<{ societySlug: string }>;
}) {
  const { societySlug } = await params;
  const result = await requireMembership(societySlug);

  if (result.error === "Society not found") notFound();
  if (result.error === "Unauthorized") redirect(`/login?redirect=/${societySlug}/announcements`);
  if (result.error === "Not a member") redirect(`/login?redirect=/${societySlug}/dashboard`);

  const isAdmin = result.membership && isAdminRole(result.membership.role);
  const announcements = await getAnnouncements(societySlug);

  const categoryLabel = (cat: string) =>
    ANNOUNCEMENT_CATEGORIES.find((c) => c.value === cat)?.label ?? cat;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Announcements</h1>
          <p className="text-muted-foreground">Society notices and updates</p>
        </div>
        {isAdmin && (
          <Link href={`/${societySlug}/announcements/new`}>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New
            </Button>
          </Link>
        )}
      </div>

      <div className="space-y-4">
        {announcements.map((a) => (
          <Card key={a.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline">{categoryLabel(a.category)}</Badge>
                    {a.is_pinned && <Badge>Pinned</Badge>}
                  </div>
                  <CardTitle className="text-lg">{a.title}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    By {(a.profiles as { full_name: string } | null)?.full_name} ·{" "}
                    {new Date(a.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                {isAdmin && (
                  <form
                    action={async () => {
                      "use server";
                      await deleteAnnouncement(societySlug, a.id);
                    }}
                  >
                    <Button variant="ghost" size="sm" type="submit">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </form>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm">{a.body}</p>
            </CardContent>
          </Card>
        ))}

        {announcements.length === 0 && (
          <p className="text-center text-muted-foreground py-12">
            No announcements yet.
          </p>
        )}
      </div>
    </div>
  );
}
