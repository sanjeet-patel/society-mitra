"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { joinSociety } from "@/lib/actions/members";

export function JoinSocietyForm({ societySlug }: { societySlug: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");

    const result = await joinSociety(societySlug, formData);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.push(`/${societySlug}`);
    router.refresh();
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Join Society</CardTitle>
        <CardDescription>
          Submit your details. A society admin will approve your membership.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" name="fullName" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Mobile Number</Label>
            <Input id="phone" name="phone" type="tel" placeholder="9876543210" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="unitNumber">House / Unit Number</Label>
            <Input id="unitNumber" name="unitNumber" placeholder="A-101" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">I am a</Label>
            <Select name="role" defaultValue="owner">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="tenant">Tenant</SelectItem>
                <SelectItem value="vendor">Vendor / Business</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Submitting..." : "Submit Join Request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
