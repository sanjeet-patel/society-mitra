"use server";

import { createClient } from "@/lib/supabase/server";
import { requirePlatformAdmin, requireSocietyAdmin } from "@/lib/auth";
import { serviceCategorySchema } from "@society-mitra/shared";
import { revalidatePath } from "next/cache";

export async function getServiceCategories(societyId?: string) {
  const supabase = await createClient();
  let query = supabase
    .from("service_categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  if (societyId) {
    query = query.or(`society_id.is.null,society_id.eq.${societyId}`);
  } else {
    query = query.is("society_id", null);
  }

  const { data } = await query;
  return data ?? [];
}

export async function getServiceCategoriesForSociety(societySlug: string) {
  const supabase = await createClient();
  const { data: society } = await supabase
    .from("societies")
    .select("id")
    .eq("slug", societySlug)
    .single();

  if (!society) return [];

  return getServiceCategories(society.id);
}

export async function createGlobalCategory(formData: FormData) {
  const { error } = await requirePlatformAdmin();
  if (error) return { error };

  const parsed = serviceCategorySchema.safeParse({
    slug: formData.get("slug"),
    label: formData.get("label"),
    sortOrder: formData.get("sortOrder") ? Number(formData.get("sortOrder")) : 0,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const supabase = await createClient();
  const { error: insertError } = await supabase.from("service_categories").insert({
    slug: parsed.data.slug,
    label: parsed.data.label,
    sort_order: parsed.data.sortOrder,
    society_id: null,
  });

  if (insertError) return { error: insertError.message };

  revalidatePath("/admin/categories");
  return { success: true };
}

export async function createSocietyCategory(societySlug: string, formData: FormData) {
  const { error: authError, society } = await requireSocietyAdmin(societySlug);
  if (authError || !society) return { error: authError || "Not found" };

  const parsed = serviceCategorySchema.safeParse({
    slug: formData.get("slug"),
    label: formData.get("label"),
    sortOrder: formData.get("sortOrder") ? Number(formData.get("sortOrder")) : 0,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const supabase = await createClient();
  const { error: insertError } = await supabase.from("service_categories").insert({
    slug: parsed.data.slug,
    label: parsed.data.label,
    sort_order: parsed.data.sortOrder,
    society_id: society.id,
  });

  if (insertError) return { error: insertError.message };

  revalidatePath(`/${societySlug}/admin/categories`);
  revalidatePath(`/${societySlug}/services`);
  return { success: true };
}

export async function updateCategory(
  societySlug: string | null,
  categoryId: string,
  formData: FormData
) {
  if (societySlug) {
    const { error: authError, society } = await requireSocietyAdmin(societySlug);
    if (authError || !society) return { error: authError || "Not found" };
  } else {
    const { error } = await requirePlatformAdmin();
    if (error) return { error };
  }

  const parsed = serviceCategorySchema.safeParse({
    slug: formData.get("slug"),
    label: formData.get("label"),
    sortOrder: formData.get("sortOrder") ? Number(formData.get("sortOrder")) : 0,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("service_categories")
    .update({
      slug: parsed.data.slug,
      label: parsed.data.label,
      sort_order: parsed.data.sortOrder,
    })
    .eq("id", categoryId);

  if (error) return { error: error.message };

  if (societySlug) {
    revalidatePath(`/${societySlug}/admin/categories`);
    revalidatePath(`/${societySlug}/services`);
  } else {
    revalidatePath("/admin/categories");
  }
  return { success: true };
}

export async function deleteCategory(societySlug: string | null, categoryId: string) {
  if (societySlug) {
    const { error: authError, society } = await requireSocietyAdmin(societySlug);
    if (authError || !society) return { error: authError || "Not found" };
  } else {
    const { error } = await requirePlatformAdmin();
    if (error) return { error };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("service_categories")
    .update({ is_active: false })
    .eq("id", categoryId);

  if (error) return { error: error.message };

  if (societySlug) {
    revalidatePath(`/${societySlug}/admin/categories`);
    revalidatePath(`/${societySlug}/services`);
  } else {
    revalidatePath("/admin/categories");
  }
  return { success: true };
}

export async function listGlobalCategories() {
  const { error } = await requirePlatformAdmin();
  if (error) return { error, categories: [] };

  const supabase = await createClient();
  const { data } = await supabase
    .from("service_categories")
    .select("*")
    .is("society_id", null)
    .order("sort_order");

  return { categories: data ?? [] };
}

export async function listSocietyCategories(societySlug: string) {
  const { error: authError, society } = await requireSocietyAdmin(societySlug);
  if (authError || !society) return { error: authError, categories: [] };

  const supabase = await createClient();
  const { data } = await supabase
    .from("service_categories")
    .select("*")
    .eq("society_id", society.id)
    .order("sort_order");

  return { categories: data ?? [] };
}
