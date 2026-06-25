"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { assignSocietyAdmin } from "@/lib/actions/platform";
import { CredentialSlip } from "@/components/admin/credential-slip";

export function AssignAdminForm({
  societyId,
  societyName,
}: {
  societyId: string;
  societyName: string;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [credentials, setCredentials] = useState<{
    mobile: string;
    password: string;
    fullName: string;
  } | null>(null);

  async function handleSubmit(formData: FormData) {
    setError("");
    const password = formData.get("password") as string;
    const result = await assignSocietyAdmin(societyId, formData);
    if (result.error) {
      setError(result.error);
      return;
    }
    setCredentials({
      mobile: (formData.get("mobile") as string).replace(/\D/g, "").slice(-10),
      password,
      fullName: formData.get("fullName") as string,
    });
    router.refresh();
  }

  return (
    <div className="space-y-4">
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
          <CardTitle className="text-base">Assign society admin</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-sm text-destructive mb-3">{error}</p>}
          <form action={handleSubmit} className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Full name</Label>
              <Input name="fullName" required />
            </div>
            <div className="space-y-1">
              <Label>Mobile (login ID)</Label>
              <Input name="mobile" type="tel" required placeholder="9876543210" />
            </div>
            <div className="space-y-1">
              <Label>Temporary password</Label>
              <Input name="password" required minLength={6} />
            </div>
            <div className="space-y-1">
              <Label>Unit (optional)</Label>
              <Input name="unitNumber" placeholder="Office" />
            </div>
            <Button type="submit" className="sm:col-span-2 w-fit">
              Create admin &amp; show slip
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
