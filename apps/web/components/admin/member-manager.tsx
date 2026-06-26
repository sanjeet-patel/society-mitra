"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  createMemberByAdmin,
  updateMemberByAdmin,
  removeMemberByAdmin,
  resetMemberPasswordByAdmin,
} from "@/lib/actions/members";
import { CredentialSlip } from "@/components/admin/credential-slip";
import { PendingMembersList } from "@/components/admin/pending-members";
import { MemberTagsEditor } from "@/components/admin/member-tags-editor";
import { MemberRoleSelect } from "@/components/admin/member-role-select";
import { MemberEditForm } from "@/components/admin/member-edit-form";

interface MemberRow {
  id: string;
  role: string;
  status: string;
  tags?: string[] | null;
  created_at: string;
  profiles: { full_name: string; phone: string | null } | null;
  units: { unit_number: string } | null;
}

export function MemberManager({
  societySlug,
  societyName,
  members,
  pendingMembers,
}: {
  societySlug: string;
  societyName: string;
  members: MemberRow[];
  pendingMembers: MemberRow[];
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [rowAction, setRowAction] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<{
    mobile: string;
    password: string;
    fullName: string;
  } | null>(null);
  const [createRole, setCreateRole] = useState("owner");

  async function handleCreate(formData: FormData) {
    setCreating(true);
    const result = await createMemberByAdmin(societySlug, formData);
    setCreating(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    if (result.credentials) {
      setCredentials(result.credentials);
    }
    toast.success("Member created");
    router.refresh();
  }

  async function handleUpdate(memberId: string, formData: FormData) {
    setRowAction(`update-${memberId}`);
    const result = await updateMemberByAdmin(societySlug, memberId, formData);
    setRowAction(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Member updated");
    router.refresh();
  }

  async function handleRemove(memberId: string) {
    if (!confirm("Deactivate this member? They will lose access.")) return;
    setRowAction(`remove-${memberId}`);
    const result = await removeMemberByAdmin(societySlug, memberId);
    setRowAction(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Member deactivated");
    router.refresh();
  }

  async function handleResetPassword(memberId: string, formData: FormData) {
    setRowAction(`reset-${memberId}`);
    const result = await resetMemberPasswordByAdmin(societySlug, memberId, formData);
    setRowAction(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    if (result.password) {
      toast.success(`New password: ${result.password}`);
    }
    router.refresh();
  }

  const approved = members.filter((m) => m.status === "approved");

  return (
    <div className="space-y-8">
      {credentials && (
        <CredentialSlip
          societyName={societyName}
          mobile={credentials.mobile}
          password={credentials.password}
          fullName={credentials.fullName}
          onClose={() => setCredentials(null)}
        />
      )}

      {pendingMembers.length > 0 && (
        <div>
          <h2 className="font-semibold mb-3">Pending approvals ({pendingMembers.length})</h2>
          <PendingMembersList societySlug={societySlug} members={pendingMembers} />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add member</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleCreate} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Full name</Label>
              <Input name="fullName" required />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Mobile (login ID)</Label>
              <Input name="mobile" type="tel" required placeholder="9876543210" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Temporary password</Label>
              <Input name="password" type="text" required minLength={6} placeholder="min 6 chars" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Unit / house no.</Label>
              <Input name="unitNumber" placeholder="A-101" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Role</Label>
              <MemberRoleSelect name="role" value={createRole} onChange={setCreateRole} />
            </div>
            <MemberTagsEditor />
            <SubmitButton
              pending={creating}
              pendingLabel="Creating…"
              className="self-end sm:col-span-2 lg:col-span-3"
            >
              Create &amp; show slip
            </SubmitButton>
          </form>
        </CardContent>
      </Card>

      <div>
        <h2 className="font-semibold mb-3">All members ({approved.length})</h2>
        <div className="space-y-3">
          {approved.map((member) => (
              <Card key={member.id}>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">{member.profiles?.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {member.profiles?.phone}
                        {member.units ? ` · Unit ${member.units.unit_number}` : ""}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">{member.role}</Badge>
                      {(member.tags ?? []).map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <MemberEditForm
                    member={member}
                    updating={rowAction === `update-${member.id}`}
                    removing={rowAction === `remove-${member.id}`}
                    resetting={rowAction === `reset-${member.id}`}
                    onSubmit={(fd) => handleUpdate(member.id, fd)}
                    onRemove={() => handleRemove(member.id)}
                    onResetPassword={(fd) => handleResetPassword(member.id, fd)}
                  />
                </CardContent>
              </Card>
            ))}
          {approved.length === 0 && (
            <p className="text-muted-foreground text-sm">No approved members yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
