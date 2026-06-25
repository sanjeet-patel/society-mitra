import { redirect, notFound } from "next/navigation";
import { requireSocietyAdmin } from "@/lib/auth";
import { getAllAnnouncementsAdmin } from "@/lib/actions/announcements";
import { AnnouncementManager } from "@/components/admin/announcement-manager";
import { SocietyAdminHeader } from "@/components/admin/society-admin-header";

export default async function AdminAnnouncementsPage({
  params,
}: {
  params: Promise<{ societySlug: string }>;
}) {
  const { societySlug } = await params;
  const result = await requireSocietyAdmin(societySlug);

  if (result.error === "Society not found") notFound();
  if (result.error === "Unauthorized") redirect(`/login?redirect=/${societySlug}/admin/announcements`);
  if (result.error === "Forbidden") redirect(`/${societySlug}/dashboard`);

  const announcements = await getAllAnnouncementsAdmin(societySlug);

  return (
    <div className="container mx-auto px-4 py-8">
      <SocietyAdminHeader
        societySlug={societySlug}
        societyName={result.society!.name}
        title="Announcements"
      />
      <AnnouncementManager
        societySlug={societySlug}
        announcements={announcements as Parameters<typeof AnnouncementManager>[0]["announcements"]}
      />
    </div>
  );
}
