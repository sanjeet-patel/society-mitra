import { redirect, notFound } from "next/navigation";
import { requireSocietyAdmin } from "@/lib/auth";
import { AnnouncementForm } from "@/components/announcements/announcement-form";

export default async function NewAnnouncementPage({
  params,
}: {
  params: Promise<{ societySlug: string }>;
}) {
  const { societySlug } = await params;
  const { error } = await requireSocietyAdmin(societySlug);

  if (error === "Society not found") notFound();
  if (error === "Unauthorized") redirect(`/login?redirect=/${societySlug}/announcements/new`);
  if (error === "Not a member") redirect(`/${societySlug}/join`);
  if (error === "Forbidden") redirect(`/${societySlug}/announcements`);

  return (
    <div className="container mx-auto px-4 py-8">
      <AnnouncementForm societySlug={societySlug} />
    </div>
  );
}
