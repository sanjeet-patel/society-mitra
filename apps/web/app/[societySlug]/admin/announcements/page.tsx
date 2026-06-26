import { notFound } from "next/navigation";
import { requireSocietyAdmin } from "@/lib/auth";
import { getAllAnnouncementsAdmin } from "@/lib/actions/announcements";
import { AnnouncementManager } from "@/components/admin/announcement-manager";

export default async function AdminAnnouncementsPage({
  params,
}: {
  params: Promise<{ societySlug: string }>;
}) {
  const { societySlug } = await params;
  const result = await requireSocietyAdmin(societySlug);
  if (result.error === "Society not found") notFound();
  if (result.error || !result.society) return null;

  const announcements = await getAllAnnouncementsAdmin(societySlug);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Announcements</h1>
        <p className="text-muted-foreground text-sm mt-1">{result.society.name}</p>
      </div>
      <AnnouncementManager
        societySlug={societySlug}
        announcements={announcements as Parameters<typeof AnnouncementManager>[0]["announcements"]}
      />
    </div>
  );
}
