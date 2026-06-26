import { notFound } from "next/navigation";
import { requireSocietyAdmin } from "@/lib/auth";
import { getAllMembers, getPendingMembers } from "@/lib/actions/members";
import { MemberManager } from "@/components/admin/member-manager";

export default async function AdminMembersPage({
  params,
}: {
  params: Promise<{ societySlug: string }>;
}) {
  const { societySlug } = await params;
  const result = await requireSocietyAdmin(societySlug);
  if (result.error === "Society not found") notFound();
  if (result.error || !result.society) return null;

  const [members, pendingMembers] = await Promise.all([
    getAllMembers(societySlug),
    getPendingMembers(societySlug),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">User management</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Add members, approve join requests, edit roles, assign tags, and deactivate accounts for{" "}
          {result.society.name}.
        </p>
      </div>
      <MemberManager
        societySlug={societySlug}
        societyName={result.society.name}
        members={members as Parameters<typeof MemberManager>[0]["members"]}
        pendingMembers={pendingMembers as Parameters<typeof MemberManager>[0]["pendingMembers"]}
      />
    </div>
  );
}
