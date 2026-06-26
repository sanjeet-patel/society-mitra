"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
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
import { SubmitButton } from "@/components/ui/submit-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  createMemberByAdmin,
  updateMemberByAdmin,
  removeMemberByAdmin,
  approveMember,
} from "@/lib/actions/members";
import { MemberTagsEditor } from "@/components/admin/member-tags-editor";
import { MemberRoleSelect } from "@/components/admin/member-role-select";
import { MemberEditForm } from "@/components/admin/member-edit-form";
import { Check, ExternalLink, Loader2, Search, X } from "lucide-react";

type MemberRow = {
  id: string;
  role: string;
  status: string;
  tags?: string[] | null;
  created_at: string;
  societies: { name?: string; slug?: string } | null;
  profiles: { full_name: string; phone: string | null } | null;
  units: { unit_number: string } | null;
};

type Society = { id: string; name: string; slug: string };

export function PlatformMemberManager({
  members,
  pendingMembers,
  societies,
}: {
  members: MemberRow[];
  pendingMembers: MemberRow[];
  societies: Society[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [societyFilter, setSocietyFilter] = useState("all");
  const [createSociety, setCreateSociety] = useState(societies[0]?.slug ?? "");
  const [createRole, setCreateRole] = useState("owner");
  const [creating, setCreating] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [rowAction, setRowAction] = useState<string | null>(null);

  const approved = useMemo(() => {
    return members.filter((m) => {
      if (m.status !== "approved") return false;
      const society = m.societies;
      if (societyFilter !== "all" && society?.slug !== societyFilter) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        m.profiles?.full_name?.toLowerCase().includes(q) ||
        m.profiles?.phone?.includes(q) ||
        society?.name?.toLowerCase().includes(q) ||
        m.units?.unit_number?.toLowerCase().includes(q)
      );
    });
  }, [members, query, societyFilter]);

  async function handleCreate(formData: FormData) {
    if (!createSociety) {
      toast.error("Select a society first");
      return;
    }
    setCreating(true);
    const result = await createMemberByAdmin(createSociety, formData);
    setCreating(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Member created successfully");
    router.refresh();
  }

  async function handleApprove(
    societySlug: string,
    memberId: string,
    status: "approved" | "rejected"
  ) {
    setPendingAction(memberId);
    const result = await approveMember(societySlug, memberId, status);
    setPendingAction(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(status === "approved" ? "Member approved" : "Request rejected");
    router.refresh();
  }

  async function handleUpdate(societySlug: string, memberId: string, formData: FormData) {
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

  async function handleRemove(societySlug: string, memberId: string) {
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

  return (
    <Tabs defaultValue={pendingMembers.length > 0 ? "pending" : "members"}>
      <TabsList>
        <TabsTrigger value="pending">
          Pending approvals
          {pendingMembers.length > 0 && (
            <Badge className="ml-2 h-5 min-w-5" variant="secondary">
              {pendingMembers.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="members">All members</TabsTrigger>
        <TabsTrigger value="add">Add member</TabsTrigger>
      </TabsList>

      <TabsContent value="pending" className="mt-4 space-y-3">
        {pendingMembers.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No pending join requests across any society.
          </p>
        ) : (
          pendingMembers.map((member) => {
            const society = member.societies;
            const slug = society?.slug;
            if (!slug) return null;
            const busy = pendingAction === member.id;
            return (
              <Card key={member.id}>
                <CardContent className="pt-4 flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{member.profiles?.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {member.profiles?.phone}
                      {member.units ? ` · Unit ${member.units.unit_number}` : ""}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {society.name} · {member.role}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      disabled={busy}
                      onClick={() => handleApprove(slug, member.id, "approved")}
                    >
                      {busy ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={busy}
                      onClick={() => handleApprove(slug, member.id, "rejected")}
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </Button>
                    <Link href={`/${slug}/admin/members`}>
                      <Button size="sm" variant="outline">
                        <ExternalLink className="h-4 w-4" />
                        Society
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </TabsContent>

      <TabsContent value="members" className="mt-4 space-y-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search name, phone, unit, society…"
              className="pl-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Select
            value={societyFilter}
            onValueChange={(value) => setSocietyFilter(value ?? "all")}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All societies" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All societies</SelectItem>
              {societies.map((s) => (
                <SelectItem key={s.id} value={s.slug}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          {approved.map((member) => {
            const society = member.societies;
            const slug = society?.slug;
            if (!slug) return null;
            const updating = rowAction === `update-${member.id}`;
            const removing = rowAction === `remove-${member.id}`;
            return (
              <Card key={member.id}>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{member.profiles?.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {member.profiles?.phone}
                        {member.units ? ` · Unit ${member.units.unit_number}` : ""}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{society.name}</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
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
                    updating={updating}
                    removing={removing}
                    onSubmit={(fd) => handleUpdate(slug, member.id, fd)}
                    onRemove={() => handleRemove(slug, member.id)}
                  />
                </CardContent>
              </Card>
            );
          })}
          {approved.length === 0 && (
            <p className="text-sm text-muted-foreground py-8 text-center">No members found.</p>
          )}
        </div>
      </TabsContent>

      <TabsContent value="add" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add member to a society</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={handleCreate} className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs">Society</Label>
                <Select value={createSociety} onValueChange={(value) => value && setCreateSociety(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select society" />
                  </SelectTrigger>
                  <SelectContent>
                    {societies.map((s) => (
                      <SelectItem key={s.id} value={s.slug}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                <Input name="password" type="text" required minLength={6} />
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
                pendingLabel="Creating member…"
                className="sm:col-span-2"
              >
                Create member
              </SubmitButton>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
