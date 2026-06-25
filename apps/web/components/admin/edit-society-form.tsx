"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateSociety } from "@/lib/actions/platform";

const PLANS = ["free", "starter", "professional", "enterprise"] as const;

export function EditSocietyForm({
  societyId,
  defaultValues,
}: {
  societyId: string;
  defaultValues: { name: string; city: string | null; plan: string };
}) {
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    const result = await updateSociety(societyId, formData);
    if (result.error) {
      alert(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Edit society</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Name</Label>
            <Input name="name" defaultValue={defaultValues.name} required />
          </div>
          <div className="space-y-1">
            <Label>City</Label>
            <Input name="city" defaultValue={defaultValues.city ?? ""} />
          </div>
          <div className="space-y-1">
            <Label>Plan</Label>
            <select
              name="plan"
              defaultValue={defaultValues.plan}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {PLANS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" className="self-end">
            Save changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
