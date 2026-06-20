import { redirect, notFound } from "next/navigation";
import { requireSocietyAdmin } from "@/lib/auth";
import { getPendingMembers } from "@/lib/actions/members";
import { PendingMembersList } from "@/components/admin/pending-members";

export default async function AdminMembersPage({
  params,
}: {
  params: Promise<{ societySlug: string }>;
}) {
  const { societySlug } = await params;
  const result = await requireSocietyAdmin(societySlug);

  if (result.error === "Society not found") notFound();
  if (result.error === "Unauthorized") redirect(`/login?redirect=/${societySlug}/admin/members`);
  if (result.error === "Not a member") redirect(`/${societySlug}/join`);
  if (result.error === "Forbidden") redirect(`/${societySlug}/dashboard`);

  const pendingMembers = await getPendingMembers(societySlug);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Member Approvals</h1>
      <p className="text-muted-foreground mb-6">
        Review and approve membership requests for {result.society!.name}
      </p>

      <PendingMembersList
        societySlug={societySlug}
        members={pendingMembers as Parameters<typeof PendingMembersList>[0]["members"]}
      />
    </div>
  );
}
