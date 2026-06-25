import { redirect, notFound } from "next/navigation";
import { requireSocietyAdmin } from "@/lib/auth";
import { getAllMembers, getPendingMembers } from "@/lib/actions/members";
import { MemberManager } from "@/components/admin/member-manager";
import { SocietyAdminHeader } from "@/components/admin/society-admin-header";

export default async function AdminMembersPage({
  params,
}: {
  params: Promise<{ societySlug: string }>;
}) {
  const { societySlug } = await params;
  const result = await requireSocietyAdmin(societySlug);

  if (result.error === "Society not found") notFound();
  if (result.error === "Unauthorized") redirect(`/login?redirect=/${societySlug}/admin/members`);
  if (result.error === "Not a member") redirect(`/${societySlug}/dashboard`);
  if (result.error === "Forbidden") redirect(`/${societySlug}/dashboard`);

  const [members, pendingMembers] = await Promise.all([
    getAllMembers(societySlug),
    getPendingMembers(societySlug),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <SocietyAdminHeader
        societySlug={societySlug}
        societyName={result.society!.name}
        title="Members"
      />
      <MemberManager
        societySlug={societySlug}
        societyName={result.society!.name}
        members={members as Parameters<typeof MemberManager>[0]["members"]}
        pendingMembers={pendingMembers as Parameters<typeof MemberManager>[0]["pendingMembers"]}
      />
    </div>
  );
}
