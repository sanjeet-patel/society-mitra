"use server";

import { createClient } from "@/lib/supabase/server";
import {
  getCurrentProfile,
  requireMembership,
  requireSocietyAdmin,
} from "@/lib/auth";
import {
  serviceProviderSchema,
  serviceReviewSchema,
  serviceInquirySchema,
} from "@society-mitra/shared";
import { revalidatePath } from "next/cache";

export async function createServiceProvider(societySlug: string, formData: FormData) {
  const { error, society, profile } = await requireMembership(societySlug);
  if (error || !society || !profile) return { error: error || "Not found" };

  const parsed = serviceProviderSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    category: formData.get("category"),
    description: formData.get("description") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const supabase = await createClient();
  const { error: insertError } = await supabase.from("service_providers").insert({
    society_id: society.id,
    profile_id: profile.id,
    name: parsed.data.name,
    phone: parsed.data.phone,
    category: parsed.data.category,
    description: parsed.data.description ?? null,
  });

  if (insertError) return { error: insertError.message };

  revalidatePath(`/${societySlug}/services`);
  return { success: true };
}

export async function verifyServiceProvider(societySlug: string, providerId: string) {
  const { error: authError, society } = await requireSocietyAdmin(societySlug);
  if (authError || !society) return { error: authError || "Not found" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("service_providers")
    .update({ is_verified: true })
    .eq("id", providerId)
    .eq("society_id", society.id);

  if (error) return { error: error.message };

  revalidatePath(`/${societySlug}/services`);
  return { success: true };
}

export async function addServiceReview(
  societySlug: string,
  providerId: string,
  formData: FormData
) {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Unauthorized" };

  const parsed = serviceReviewSchema.safeParse({
    rating: Number(formData.get("rating")),
    comment: formData.get("comment") || undefined,
  });

  if (!parsed.success) return { error: "Invalid review" };

  const supabase = await createClient();
  const { error } = await supabase.from("service_reviews").upsert(
    {
      provider_id: providerId,
      reviewer_id: profile.id,
      rating: parsed.data.rating,
      comment: parsed.data.comment ?? null,
    },
    { onConflict: "provider_id,reviewer_id" }
  );

  if (error) return { error: error.message };

  revalidatePath(`/${societySlug}/services`);
  return { success: true };
}

export async function createServiceInquiry(
  societySlug: string,
  providerId: string,
  formData: FormData
) {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Unauthorized" };

  const parsed = serviceInquirySchema.safeParse({
    message: formData.get("message"),
  });

  if (!parsed.success) return { error: "Invalid message" };

  const supabase = await createClient();
  const { error } = await supabase.from("service_inquiries").insert({
    provider_id: providerId,
    requester_id: profile.id,
    message: parsed.data.message,
  });

  if (error) return { error: error.message };

  return { success: true };
}

export async function getServiceProviders(societySlug: string, category?: string) {
  const { error, society } = await requireMembership(societySlug);
  if (error || !society) return [];

  const supabase = await createClient();
  let query = supabase
    .from("service_providers")
    .select("*")
    .eq("society_id", society.id)
    .order("is_verified", { ascending: false })
    .order("avg_rating", { ascending: false });

  if (category) {
    query = query.eq("category", category);
  }

  const { data } = await query;
  return data ?? [];
}

export async function getServiceReviews(providerId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("service_reviews")
    .select("*, profiles(full_name)")
    .eq("provider_id", providerId)
    .order("created_at", { ascending: false });

  return data ?? [];
}
