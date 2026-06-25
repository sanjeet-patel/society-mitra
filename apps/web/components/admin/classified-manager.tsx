"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  updateClassifiedAdStatus,
  updateClassifiedAd,
  deleteClassifiedAd,
} from "@/lib/actions/classifieds";

interface Ad {
  id: string;
  title: string;
  description: string;
  ad_type: string;
  status: string;
  price: number | null;
  contact_phone: string | null;
  profiles: { full_name: string } | null;
}

export function ClassifiedManager({
  societySlug,
  ads,
}: {
  societySlug: string;
  ads: Ad[];
}) {
  const router = useRouter();

  async function handleStatus(id: string, status: "active" | "closed" | "sold") {
    await updateClassifiedAdStatus(societySlug, id, status);
    router.refresh();
  }

  async function handleUpdate(id: string, formData: FormData) {
    await updateClassifiedAd(societySlug, id, formData);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {ads.map((ad) => (
        <Card key={ad.id}>
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="font-medium">{ad.title}</p>
                <p className="text-sm text-muted-foreground">
                  {ad.profiles?.full_name} · {ad.ad_type}
                </p>
              </div>
              <Badge variant={ad.status === "active" ? "default" : "secondary"}>{ad.status}</Badge>
            </div>
            <form action={(fd) => handleUpdate(ad.id, fd)} className="grid sm:grid-cols-2 gap-2">
              <Input name="title" defaultValue={ad.title} required className="h-8" />
              <select name="adType" defaultValue={ad.ad_type} className="h-8 border rounded-md px-2 text-sm">
                <option value="sell">Sell</option>
                <option value="buy">Buy</option>
                <option value="service">Service</option>
                <option value="other">Other</option>
              </select>
              <Input
                name="description"
                defaultValue={ad.description}
                required
                className="h-8 sm:col-span-2"
              />
              <Input name="price" type="number" defaultValue={ad.price ?? ""} className="h-8" />
              <Input
                name="contactPhone"
                defaultValue={ad.contact_phone ?? ""}
                className="h-8"
              />
              <div className="flex flex-wrap gap-2 sm:col-span-2">
                <Button type="submit" size="sm" variant="outline">
                  Save
                </Button>
                {ad.status !== "active" && (
                  <Button type="button" size="sm" onClick={() => handleStatus(ad.id, "active")}>
                    Activate
                  </Button>
                )}
                {ad.status !== "closed" && (
                  <Button type="button" size="sm" variant="secondary" onClick={() => handleStatus(ad.id, "closed")}>
                    Close
                  </Button>
                )}
                <Button type="button" size="sm" variant="destructive" onClick={() => deleteClassifiedAd(societySlug, ad.id).then(() => router.refresh())}>
                  Remove
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ))}
      {ads.length === 0 && <p className="text-muted-foreground text-sm">No classified ads.</p>}
    </div>
  );
}
