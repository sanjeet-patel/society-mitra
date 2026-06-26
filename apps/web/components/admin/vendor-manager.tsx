"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  verifyServiceProvider,
  updateServiceProvider,
  deleteServiceProvider,
} from "@/lib/actions/services";
import { editFormKey } from "@/lib/form-key";

interface Provider {
  id: string;
  name: string;
  phone: string;
  is_verified: boolean;
  short_description: string | null;
  service_hours: string | null;
  category_id: string | null;
  service_categories: { label: string } | null;
}

export function VendorManager({
  societySlug,
  providers,
  categories,
}: {
  societySlug: string;
  providers: Provider[];
  categories: { id: string; label: string }[];
}) {
  const router = useRouter();

  async function handleVerify(id: string) {
    await verifyServiceProvider(societySlug, id);
    router.refresh();
  }

  async function handleUpdate(id: string, formData: FormData) {
    await updateServiceProvider(societySlug, id, formData);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this vendor?")) return;
    await deleteServiceProvider(societySlug, id);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {providers.map((p) => (
        <Card key={p.id}>
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-sm text-muted-foreground">
                  {p.phone} · {p.service_categories?.label ?? "Uncategorized"}
                </p>
              </div>
              <Badge variant={p.is_verified ? "default" : "secondary"}>
                {p.is_verified ? "Verified" : "Unverified"}
              </Badge>
            </div>
            <form
              key={editFormKey(
                p.id,
                p.name,
                p.phone,
                p.category_id,
                p.short_description,
                p.service_hours,
                p.is_verified
              )}
              action={(fd) => handleUpdate(p.id, fd)}
              className="grid sm:grid-cols-2 gap-2"
            >
              <Input name="name" defaultValue={p.name} required className="h-8" />
              <Input name="phone" defaultValue={p.phone} required className="h-8" />
              <select
                name="categoryId"
                defaultValue={p.category_id ?? ""}
                className="h-8 border rounded-md px-2 text-sm"
                required
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
              <Input
                name="shortDescription"
                defaultValue={p.short_description ?? ""}
                placeholder="Short description"
                className="h-8"
              />
              <Input
                name="serviceHours"
                defaultValue={p.service_hours ?? ""}
                placeholder="Hours"
                className="h-8"
              />
              <Input name="servicesOffered" placeholder="Services (comma-separated)" className="h-8" />
              <div className="flex gap-2 sm:col-span-2">
                <Button type="submit" size="sm" variant="outline">
                  Save
                </Button>
                {!p.is_verified && (
                  <Button type="button" size="sm" onClick={() => handleVerify(p.id)}>
                    Verify
                  </Button>
                )}
                <Button type="button" size="sm" variant="destructive" onClick={() => handleDelete(p.id)}>
                  Delete
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ))}
      {providers.length === 0 && (
        <p className="text-muted-foreground text-sm">No service providers yet.</p>
      )}
    </div>
  );
}
