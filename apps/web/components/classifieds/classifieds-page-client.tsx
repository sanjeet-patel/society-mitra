"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClassifiedAd, closeClassifiedAd } from "@/lib/actions/classifieds";
import { CLASSIFIED_AD_TYPES } from "@society-mitra/shared";

interface ClassifiedAdItem {
  id: string;
  title: string;
  description: string;
  ad_type: string;
  price: number | null;
  contact_phone: string | null;
  created_at: string;
  author_id: string;
  profiles: { full_name: string; phone: string | null } | null;
}

export function ClassifiedsPageClient({
  societySlug,
  ads,
  selectedType,
  currentProfileId,
}: {
  societySlug: string;
  ads: ClassifiedAdItem[];
  selectedType?: string;
  currentProfileId?: string;
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  const typeLabel = (type: string) =>
    CLASSIFIED_AD_TYPES.find((t) => t.value === type)?.label ?? type;

  async function handleCreate(formData: FormData) {
    setError("");
    const result = await createClassifiedAd(societySlug, formData);
    if (result.error) {
      setError(result.error);
      return;
    }
    setShowForm(false);
    router.refresh();
  }

  async function handleClose(adId: string) {
    await closeClassifiedAd(societySlug, adId);
    router.refresh();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex gap-2 flex-wrap">
          <Link href={`/${societySlug}/classifieds`}>
            <Button variant={!selectedType ? "default" : "outline"} size="sm">
              All
            </Button>
          </Link>
          {CLASSIFIED_AD_TYPES.map((type) => (
            <Link key={type.value} href={`/${societySlug}/classifieds?type=${type.value}`}>
              <Button
                variant={selectedType === type.value ? "default" : "outline"}
                size="sm"
              >
                {type.label}
              </Button>
            </Link>
          ))}
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          Post classified
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">New classified ad</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={handleCreate} className="space-y-3">
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="space-y-1">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="adType">Type</Label>
                <Select name="adType" defaultValue="sale">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CLASSIFIED_AD_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" rows={4} required />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="price">Price (optional)</Label>
                  <Input id="price" name="price" type="number" min={0} step="0.01" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="contactPhone">Contact phone</Label>
                  <Input id="contactPhone" name="contactPhone" placeholder="Uses profile phone if empty" />
                </div>
              </div>
              <Button type="submit" size="sm">
                Publish
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {ads.map((ad) => (
          <Card key={ad.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base">{ad.title}</CardTitle>
                <Badge variant="secondary">{typeLabel(ad.ad_type)}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                By {ad.profiles?.full_name ?? "Member"} ·{" "}
                {new Date(ad.created_at).toLocaleDateString()}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm whitespace-pre-wrap">{ad.description}</p>
              {ad.price != null && (
                <p className="text-sm font-semibold text-palette-navy">₹{ad.price}</p>
              )}
              {(ad.contact_phone || ad.profiles?.phone) && (
                <a href={`tel:${ad.contact_phone || ad.profiles?.phone}`}>
                  <Button size="sm" variant="outline">
                    Call {ad.contact_phone || ad.profiles?.phone}
                  </Button>
                </a>
              )}
              {currentProfileId === ad.author_id && (
                <Button size="sm" variant="ghost" onClick={() => handleClose(ad.id)}>
                  Mark as closed
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {ads.length === 0 && (
        <p className="text-center text-muted-foreground py-12">No classified ads yet.</p>
      )}
    </div>
  );
}
