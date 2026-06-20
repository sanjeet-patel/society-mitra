"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { createServiceProvider, addServiceReview, createServiceInquiry } from "@/lib/actions/services";
import { SERVICE_CATEGORIES } from "@society-mitra/shared";
import { Star, CheckCircle, Phone } from "lucide-react";

interface Provider {
  id: string;
  name: string;
  phone: string;
  category: string;
  description: string | null;
  is_verified: boolean;
  avg_rating: number;
  review_count: number;
}

export function ServicesPageClient({
  societySlug,
  providers: initialProviders,
  isAdmin,
  selectedCategory,
}: {
  societySlug: string;
  providers: Provider[];
  isAdmin: boolean;
  selectedCategory?: string;
}) {
  const router = useRouter();
  const [providers] = useState(initialProviders);
  const [showAdd, setShowAdd] = useState(false);
  const [error, setError] = useState("");

  const categoryLabel = (cat: string) =>
    SERVICE_CATEGORIES.find((c) => c.value === cat)?.label ?? cat;

  async function handleAddProvider(formData: FormData) {
    setError("");
    const result = await createServiceProvider(societySlug, formData);
    if (result.error) {
      setError(result.error);
      return;
    }
    setShowAdd(false);
    router.refresh();
  }

  async function handleReview(providerId: string, formData: FormData) {
    await addServiceReview(societySlug, providerId, formData);
    router.refresh();
  }

  async function handleInquiry(providerId: string, formData: FormData) {
    await createServiceInquiry(societySlug, providerId, formData);
    alert("Inquiry sent!");
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
          <a href={`/${societySlug}/services`}>
            <Button variant={!selectedCategory ? "default" : "outline"} size="sm">
              All
            </Button>
          </a>
          {SERVICE_CATEGORIES.map((cat) => (
            <a key={cat.value} href={`/${societySlug}/services?category=${cat.value}`}>
              <Button
                variant={selectedCategory === cat.value ? "default" : "outline"}
                size="sm"
              >
                {cat.label}
              </Button>
            </a>
          ))}
        </div>
        <Button size="sm" onClick={() => setShowAdd(!showAdd)}>
          Add Provider
        </Button>
      </div>

      {showAdd && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Add Service Provider</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={handleAddProvider} className="space-y-3">
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" name="phone" required />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="category">Category</Label>
                <Select name="category" defaultValue="plumber">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" rows={2} />
              </div>
              <Button type="submit" size="sm">Add</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {providers.map((provider) => (
          <Card key={provider.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    {provider.name}
                    {provider.is_verified && (
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                    )}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {categoryLabel(provider.category)}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  {Number(provider.avg_rating).toFixed(1)} ({provider.review_count})
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {provider.description && (
                <p className="text-sm text-muted-foreground">{provider.description}</p>
              )}
              <a href={`tel:${provider.phone}`}>
                <Button size="sm" variant="outline" className="gap-1">
                  <Phone className="h-3 w-3" />
                  {provider.phone}
                </Button>
              </a>

              <form action={(fd) => handleReview(provider.id, fd)} className="flex gap-2 items-end">
                <div className="space-y-1 flex-1">
                  <Label className="text-xs">Rate (1-5)</Label>
                  <Input name="rating" type="number" min={1} max={5} defaultValue={5} className="h-8" />
                </div>
                <Input name="comment" placeholder="Review..." className="h-8 flex-1" />
                <Button type="submit" size="sm" variant="secondary">Review</Button>
              </form>

              <form action={(fd) => handleInquiry(provider.id, fd)} className="flex gap-2">
                <Input name="message" placeholder="Send inquiry..." className="h-8" required />
                <Button type="submit" size="sm">Send</Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>

      {providers.length === 0 && (
        <p className="text-center text-muted-foreground py-12">No service providers yet.</p>
      )}
    </div>
  );
}
