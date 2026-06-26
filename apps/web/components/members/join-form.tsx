"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";
import { joinSociety } from "@/lib/actions/members";
import { toast } from "sonner";

export function JoinSocietyForm({
  societySlug,
  defaultFullName = "",
  defaultPhone = "",
}: {
  societySlug: string;
  defaultFullName?: string;
  defaultPhone?: string | null;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");

    const result = await joinSociety(societySlug, formData);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Join request submitted — awaiting admin approval");
    router.push(`/${societySlug}/join`);
    router.refresh();
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Join Society</CardTitle>
        <CardDescription>
          One account per house/unit. Family members share this login — add them later under
          Profile.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" name="fullName" required defaultValue={defaultFullName} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Mobile Number</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="9876543210"
              defaultValue={defaultPhone ?? ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="unitNumber">House / Unit Number</Label>
            <Input id="unitNumber" name="unitNumber" placeholder="A-101" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">I am a</Label>
            <select
              id="role"
              name="role"
              defaultValue="owner"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="owner">Owner</option>
              <option value="tenant">Tenant</option>
              <option value="vendor">Vendor / Business</option>
            </select>
          </div>

          <SubmitButton type="submit" className="w-full" pending={loading} pendingLabel="Submitting…">
            Submit join request
          </SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
