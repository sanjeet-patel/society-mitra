"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { createSociety } from "@/lib/actions/platform";
import { slugify, SOCIETY_PLANS } from "@society-mitra/shared";

export function CreateSocietyForm() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [slug, setSlug] = useState("");

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");
    setSuccess("");

    const result = await createSociety(formData);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSuccess(`Society created at /${result.society?.slug}`);
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && <p className="text-sm text-primary">{success}</p>}

          <div className="space-y-2">
            <Label htmlFor="name">Society Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Green Valley Apartments"
              required
              onChange={(e) => setSlug(slugify(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">URL Slug</Label>
            <Input
              id="slug"
              name="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="greenvalley"
              required
              pattern="[a-z0-9-]+"
            />
            <p className="text-xs text-muted-foreground">
              Will be available at /{slug || "your-slug"}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" name="city" placeholder="Pune" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="plan">Plan</Label>
            <select
              id="plan"
              name="plan"
              defaultValue="free"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
            >
              {SOCIETY_PLANS.map((plan) => (
                <option key={plan.value} value={plan.value}>
                  {plan.label} ({plan.familyLimit ?? "Unlimited"} families)
                </option>
              ))}
            </select>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Create Society"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
