import { redirect } from "next/navigation";
import { requirePlatformAdmin, getCurrentUser } from "@/lib/auth";
import { AccessDenied } from "@/components/auth/access-denied";
import {
  getAllPlatformMembers,
  getAllPendingPlatformMembers,
  listSocieties,
} from "@/lib/actions/platform";
import { PlatformMemberManager } from "@/components/admin/platform-member-manager";

export default async function PlatformMembersPage() {
  const user = await getCurrentUser();
  const { error } = await requirePlatformAdmin();

  if (error) {
    if (!user) redirect("/login?redirect=/admin/members");
    return (
      <AccessDenied
        message="User management is for platform super admins only."
        backHref="/"
      />
    );
  }

  const [members, pendingMembers, societiesResult] = await Promise.all([
    getAllPlatformMembers(),
    getAllPendingPlatformMembers(),
    listSocieties(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">User management</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage members across all societies — approve join requests, add users, edit roles, and
          deactivate accounts.
        </p>
      </div>
      <PlatformMemberManager
        members={members as Parameters<typeof PlatformMemberManager>[0]["members"]}
        pendingMembers={
          pendingMembers as Parameters<typeof PlatformMemberManager>[0]["pendingMembers"]
        }
        societies={societiesResult.societies ?? []}
      />
    </div>
  );
}
