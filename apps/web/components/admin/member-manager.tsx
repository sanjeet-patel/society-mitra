"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createMemberByAdmin,
  updateMemberByAdmin,
  removeMemberByAdmin,
  resetMemberPasswordByAdmin,
} from "@/lib/actions/members";
import { CredentialSlip } from "@/components/admin/credential-slip";
import { PendingMembersList } from "@/components/admin/pending-members";
import { MemberTagsEditor } from "@/components/admin/member-tags-editor";

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
  const [error, setError] = useState("");
  const [credentials, setCredentials] = useState<{
    mobile: string;
    password: string;
    fullName: string;
  } | null>(null);

  async function handleCreate(formData: FormData) {
    setError("");
    const result = await createMemberByAdmin(societySlug, formData);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.credentials) {
      setCredentials(result.credentials);
    }
    router.refresh();
  }

  async function handleUpdate(memberId: string, formData: FormData) {
    await updateMemberByAdmin(societySlug, memberId, formData);
    router.refresh();
  }

  async function handleRemove(memberId: string) {
    if (!confirm("Deactivate this member? They will lose access.")) return;
    await removeMemberByAdmin(societySlug, memberId);
    router.refresh();
  }

  async function handleResetPassword(memberId: string, formData: FormData) {
    const result = await resetMemberPasswordByAdmin(societySlug, memberId, formData);
    if (result.error) {
      alert(result.error);
      return;
    }
    if (result.password) {
      alert(`New temporary password: ${result.password}`);
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add member</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-sm text-destructive mb-3">{error}</p>}
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
              <Select name="role" defaultValue="owner">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="tenant">Tenant</SelectItem>
                  <SelectItem value="vendor">Vendor</SelectItem>
                  <SelectItem value="block_admin">Block admin</SelectItem>
                  <SelectItem value="society_admin">Society admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <MemberTagsEditor />
            <Button type="submit" className="self-end sm:col-span-2 lg:col-span-3">
              Create &amp; show slip
            </Button>
          </form>
        </CardContent>
      </Card>

      {pendingMembers.length > 0 && (
        <div>
          <h2 className="font-semibold mb-3">Pending approvals</h2>
          <PendingMembersList societySlug={societySlug} members={pendingMembers} />
        </div>
      )}

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
                <form
                  action={(fd) => handleUpdate(member.id, fd)}
                  className="grid sm:grid-cols-2 gap-2 items-end"
                >
                  <div className="space-y-1">
                    <Label className="text-xs">Unit</Label>
                    <Input
                      name="unitNumber"
                      defaultValue={member.units?.unit_number ?? ""}
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Role</Label>
                    <Select name="role" defaultValue={member.role}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="owner">Owner</SelectItem>
                        <SelectItem value="tenant">Tenant</SelectItem>
                        <SelectItem value="vendor">Vendor</SelectItem>
                        <SelectItem value="block_admin">Block admin</SelectItem>
                        <SelectItem value="society_admin">Society admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <MemberTagsEditor defaultTags={member.tags ?? []} />
                  <div className="flex gap-2 sm:col-span-2">
                    <Button type="submit" size="sm" variant="outline">
                      Save
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemove(member.id)}
                    >
                      Deactivate
                    </Button>
                  </div>
                </form>
                <form
                  action={(fd) => handleResetPassword(member.id, fd)}
                  className="flex gap-2 items-end"
                >
                  <div className="space-y-1 flex-1 max-w-xs">
                    <Label className="text-xs">Reset password</Label>
                    <Input
                      name="newPassword"
                      placeholder="New temp password"
                      minLength={6}
                      className="h-8"
                      required
                    />
                  </div>
                  <Button type="submit" size="sm" variant="secondary">
                    Reset
                  </Button>
                </form>
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
