"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";
import { MemberTagsEditor } from "@/components/admin/member-tags-editor";
import { MemberRoleSelect } from "@/components/admin/member-role-select";
import { Loader2 } from "lucide-react";

type MemberEditData = {
  id: string;
  role: string;
  tags?: string[] | null;
  units: { unit_number: string } | null;
};

function memberSnapshot(member: MemberEditData) {
  return `${member.units?.unit_number ?? ""}|${member.role}|${(member.tags ?? []).join(",")}`;
}

export function MemberEditForm({
  member,
  updating,
  removing,
  resetting = false,
  onSubmit,
  onRemove,
  onResetPassword,
}: {
  member: MemberEditData;
  updating: boolean;
  removing: boolean;
  resetting?: boolean;
  onSubmit: (formData: FormData) => void | Promise<void>;
  onRemove: () => void | Promise<void>;
  onResetPassword?: (formData: FormData) => void | Promise<void>;
}) {
  const snapshot = memberSnapshot(member);
  const [unitNumber, setUnitNumber] = useState(member.units?.unit_number ?? "");
  const [role, setRole] = useState(member.role);

  useEffect(() => {
    setUnitNumber(member.units?.unit_number ?? "");
    setRole(member.role);
  }, [member.id, snapshot, member.units?.unit_number, member.role]);

  return (
    <>
      <form
        action={onSubmit}
        className="grid sm:grid-cols-2 gap-2 items-end"
      >
        <div className="space-y-1">
          <Label className="text-xs">Unit</Label>
          <Input
            name="unitNumber"
            value={unitNumber}
            onChange={(event) => setUnitNumber(event.target.value)}
            className="h-8"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Role</Label>
          <MemberRoleSelect name="role" value={role} onChange={setRole} />
        </div>
        <MemberTagsEditor
          key={`${member.id}-${snapshot}`}
          defaultTags={member.tags ?? []}
        />
        <div className="flex gap-2 sm:col-span-2">
          <SubmitButton size="sm" variant="outline" pending={updating} pendingLabel="Saving…">
            Save
          </SubmitButton>
          <Button
            type="button"
            size="sm"
            variant="destructive"
            disabled={removing}
            onClick={onRemove}
          >
            {removing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Deactivate"}
          </Button>
        </div>
      </form>

      {onResetPassword && (
        <form action={onResetPassword} className="flex gap-2 items-end">
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
          <SubmitButton size="sm" variant="secondary" pending={resetting} pendingLabel="Resetting…">
            Reset
          </SubmitButton>
        </form>
      )}
    </>
  );
}
