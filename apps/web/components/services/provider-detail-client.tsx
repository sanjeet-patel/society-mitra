"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { addServiceReview, createServiceInquiry } from "@/lib/actions/services";
import { Star, CheckCircle, Phone, ArrowLeft } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles: { full_name: string } | null;
}

interface ProviderDetailProps {
  societySlug: string;
  provider: {
    id: string;
    name: string;
    phone: string;
    short_description: string | null;
    full_description: string | null;
    description: string | null;
    service_hours: string | null;
    services_offered: string[] | null;
    is_verified: boolean;
    avg_rating: number;
    review_count: number;
    service_categories: { label: string } | { label: string }[] | null;
  };
  reviews: Review[];
}

export function ProviderDetailClient({
  societySlug,
  provider,
  reviews,
}: ProviderDetailProps) {
  const router = useRouter();
  const categoryLabel = Array.isArray(provider.service_categories)
    ? provider.service_categories[0]?.label
    : provider.service_categories?.label;

  async function handleReview(formData: FormData) {
    await addServiceReview(societySlug, provider.id, formData);
    router.refresh();
  }

  async function handleInquiry(formData: FormData) {
    await createServiceInquiry(societySlug, provider.id, formData);
    alert("Inquiry sent!");
  }

  return (
    <div className="space-y-6">
      <Link href={`/${societySlug}/services`}>
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to services
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                {provider.name}
                {provider.is_verified && <CheckCircle className="h-5 w-5 text-primary" />}
              </CardTitle>
              <p className="text-muted-foreground">{categoryLabel}</p>
            </div>
            <div className="flex items-center gap-1 text-lg">
              <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
              {Number(provider.avg_rating).toFixed(1)} · {provider.review_count} reviews
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-relaxed">
            {provider.full_description ||
              provider.description ||
              provider.short_description ||
              "No detailed description yet."}
          </p>

          {provider.service_hours && (
            <p className="text-sm">
              <strong>Hours:</strong> {provider.service_hours}
            </p>
          )}

          {provider.services_offered && provider.services_offered.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Services offered</p>
              <ul className="list-disc pl-5 text-sm space-y-1">
                {provider.services_offered.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          <a href={`tel:${provider.phone}`}>
            <Button className="gap-2">
              <Phone className="h-4 w-4" />
              Call {provider.phone}
            </Button>
          </a>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Reviews from society members</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {reviews.length === 0 && (
            <p className="text-sm text-muted-foreground">No reviews yet. Be the first!</p>
          )}
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-border pb-3 last:border-0">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">{review.profiles?.full_name ?? "Member"}</span>
                <span className="text-amber-500">{"★".repeat(review.rating)}</span>
              </div>
              {review.comment && <p className="text-sm text-muted-foreground mt-1">{review.comment}</p>}
            </div>
          ))}

          <form action={handleReview} className="flex gap-2 flex-wrap items-end pt-2">
            <div className="space-y-1">
              <Label className="text-xs">Rating (1-5)</Label>
              <Input name="rating" type="number" min={1} max={5} defaultValue={5} className="h-8 w-20" />
            </div>
            <Input name="comment" placeholder="Your review..." className="h-8 flex-1 min-w-[200px]" />
            <Button type="submit" size="sm">
              Submit review
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Send inquiry</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleInquiry} className="flex gap-2">
            <Input name="message" placeholder="Ask about availability, pricing..." required />
            <Button type="submit">Send</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
