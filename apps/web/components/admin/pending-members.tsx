"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { approveMember } from "@/lib/actions/members";
import { Check, Loader2, X } from "lucide-react";

interface PendingMember {
  id: string;
  role: string;
  created_at: string;
  profiles: { full_name: string; phone: string | null; email?: string | null } | null;
  units: { unit_number: string } | null;
}

export function PendingMembersList({
  societySlug,
  members,
}: {
  societySlug: string;
  members: PendingMember[];
}) {
  const router = useRouter();
  const [actionId, setActionId] = useState<string | null>(null);

  async function handleApprove(memberId: string, status: "approved" | "rejected") {
    setActionId(memberId);
    const result = await approveMember(societySlug, memberId, status);
    setActionId(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(status === "approved" ? "Member approved" : "Request rejected");
    router.refresh();
  }

  if (members.length === 0) {
    return <p className="text-muted-foreground">No pending membership requests.</p>;
  }

  return (
    <div className="space-y-3">
      {members.map((member) => {
        const busy = actionId === member.id;
        return (
          <Card key={member.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{member.profiles?.full_name}</CardTitle>
                <Badge variant="secondary">{member.role}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground mb-3 space-y-1">
                {member.units && <p>Unit: {member.units.unit_number}</p>}
                {member.profiles?.phone && <p>Phone: {member.profiles.phone}</p>}
                {member.profiles?.email && <p>Email: {member.profiles.email}</p>}
                <p>
                  Requested: {new Date(member.created_at).toLocaleDateString("en-IN")}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="gap-1"
                  disabled={busy}
                  onClick={() => handleApprove(member.id, "approved")}
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
                  className="gap-1"
                  disabled={busy}
                  onClick={() => handleApprove(member.id, "rejected")}
                >
                  <X className="h-4 w-4" />
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
