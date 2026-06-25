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
import { createServiceProvider } from "@/lib/actions/services";
import { Star, CheckCircle, Phone, ArrowRight } from "lucide-react";

interface Category {
  id: string;
  slug: string;
  label: string;
  society_id: string | null;
}

interface Provider {
  id: string;
  name: string;
  phone: string;
  short_description: string | null;
  description: string | null;
  is_verified: boolean;
  avg_rating: number;
  review_count: number;
  service_categories: Category | Category[] | null;
}

export function ServicesPageClient({
  societySlug,
  providers: initialProviders,
  categories,
  selectedCategoryId,
  isAdmin,
}: {
  societySlug: string;
  providers: Provider[];
  categories: Category[];
  selectedCategoryId?: string;
  isAdmin?: boolean;
}) {
  const router = useRouter();
  const [providers] = useState(initialProviders);
  const [showAdd, setShowAdd] = useState(false);
  const [error, setError] = useState("");

  const categoryLabel = (provider: Provider) => {
    const cat = Array.isArray(provider.service_categories)
      ? provider.service_categories[0]
      : provider.service_categories;
    return cat?.label ?? "Service";
  };

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

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
          <Link href={`/${societySlug}/services`}>
            <Button variant={!selectedCategoryId ? "default" : "outline"} size="sm">
              All
            </Button>
          </Link>
          {categories.map((cat) => (
            <Link key={cat.id} href={`/${societySlug}/services?category=${cat.id}`}>
              <Button
                variant={selectedCategoryId === cat.id ? "default" : "outline"}
                size="sm"
              >
                {cat.label}
              </Button>
            </Link>
          ))}
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Link href={`/${societySlug}/admin/categories`}>
              <Button size="sm" variant="outline">
                Manage Categories
              </Button>
            </Link>
          )}
          <Button size="sm" onClick={() => setShowAdd(!showAdd)}>
            Add Provider
          </Button>
        </div>
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
                <Label htmlFor="categoryId">Category</Label>
                <Select name="categoryId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.label}
                        {cat.society_id ? " (Society)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="shortDescription">Short description (card)</Label>
                <Input id="shortDescription" name="shortDescription" maxLength={160} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="fullDescription">Full profile details</Label>
                <Textarea id="fullDescription" name="fullDescription" rows={3} />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="serviceHours">Service hours</Label>
                  <Input id="serviceHours" name="serviceHours" placeholder="9 AM – 6 PM" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="servicesOffered">Services (comma-separated)</Label>
                  <Input id="servicesOffered" name="servicesOffered" placeholder="Leak fix, pipe install" />
                </div>
              </div>
              <Button type="submit" size="sm">
                Add
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {providers.map((provider) => (
          <Card key={provider.id} className="flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    {provider.name}
                    {provider.is_verified && (
                      <CheckCircle className="h-4 w-4 text-primary" />
                    )}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">{categoryLabel(provider)}</p>
                </div>
                <div className="flex items-center gap-1 text-sm shrink-0">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  {Number(provider.avg_rating).toFixed(1)} ({provider.review_count})
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 gap-3">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {provider.short_description || provider.description || "Local service provider"}
              </p>
              <a href={`tel:${provider.phone}`}>
                <Button size="sm" variant="outline" className="gap-1 w-full">
                  <Phone className="h-3 w-3" />
                  {provider.phone}
                </Button>
              </a>
              <Link href={`/${societySlug}/services/${provider.id}`} className="mt-auto">
                <Button size="sm" variant="secondary" className="w-full gap-1">
                  View full profile
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
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
