"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile, requireMembership, requireSocietyAdmin } from "@/lib/auth";
import { classifiedAdSchema } from "@society-mitra/shared";
import { revalidatePath } from "next/cache";

export async function getClassifiedAds(societySlug: string, adType?: string) {
  const { error, society } = await requireMembership(societySlug);
  if (error || !society) return [];

  const supabase = await createClient();
  let query = supabase
    .from("classified_ads")
    .select("*, profiles(full_name, phone)")
    .eq("society_id", society.id)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (adType) {
    query = query.eq("ad_type", adType);
  }

  const { data } = await query;
  return data ?? [];
}

export async function createClassifiedAd(societySlug: string, formData: FormData) {
  const { error, society, profile } = await requireMembership(societySlug);
  if (error || !society || !profile) return { error: error || "Not found" };

  const parsed = classifiedAdSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    adType: formData.get("adType"),
    price: formData.get("price") || undefined,
    contactPhone: formData.get("contactPhone") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const supabase = await createClient();
  const { error: insertError } = await supabase.from("classified_ads").insert({
    society_id: society.id,
    author_id: profile.id,
    title: parsed.data.title,
    description: parsed.data.description,
    ad_type: parsed.data.adType,
    price: parsed.data.price ? Number(parsed.data.price) : null,
    contact_phone: parsed.data.contactPhone ?? profile.phone,
  });

  if (insertError) return { error: insertError.message };

  revalidatePath(`/${societySlug}/classifieds`);
  return { success: true };
}

export async function closeClassifiedAd(societySlug: string, adId: string) {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Unauthorized" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("classified_ads")
    .update({ status: "closed" })
    .eq("id", adId)
    .eq("author_id", profile.id);

  if (error) return { error: error.message };

  revalidatePath(`/${societySlug}/classifieds`);
  return { success: true };
}

export async function getAllClassifiedAds(societySlug: string) {
  const { error: authError, society } = await requireSocietyAdmin(societySlug);
  if (authError || !society) return [];

  const admin = createAdminClient();
  const { data } = await admin
    .from("classified_ads")
    .select("*, profiles(full_name, phone)")
    .eq("society_id", society.id)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function updateClassifiedAdStatus(
  societySlug: string,
  adId: string,
  status: "active" | "closed" | "sold"
) {
  const { error: authError, society } = await requireSocietyAdmin(societySlug);
  if (authError || !society) return { error: authError || "Not found" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("classified_ads")
    .update({ status })
    .eq("id", adId)
    .eq("society_id", society.id);

  if (error) return { error: error.message };

  revalidatePath(`/${societySlug}/admin/classifieds`);
  revalidatePath(`/${societySlug}/classifieds`);
  return { success: true };
}

export async function updateClassifiedAd(
  societySlug: string,
  adId: string,
  formData: FormData
) {
  const { error: authError, society } = await requireSocietyAdmin(societySlug);
  if (authError || !society) return { error: authError || "Not found" };

  const parsed = classifiedAdSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    adType: formData.get("adType"),
    price: formData.get("price") || undefined,
    contactPhone: formData.get("contactPhone") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("classified_ads")
    .update({
      title: parsed.data.title,
      description: parsed.data.description,
      ad_type: parsed.data.adType,
      price: parsed.data.price ? Number(parsed.data.price) : null,
      contact_phone: parsed.data.contactPhone ?? null,
    })
    .eq("id", adId)
    .eq("society_id", society.id);

  if (error) return { error: error.message };

  revalidatePath(`/${societySlug}/admin/classifieds`);
  revalidatePath(`/${societySlug}/classifieds`);
  return { success: true };
}

export async function deleteClassifiedAd(societySlug: string, adId: string) {
  return updateClassifiedAdStatus(societySlug, adId, "closed");
}
