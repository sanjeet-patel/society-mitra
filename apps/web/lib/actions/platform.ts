"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requirePlatformAdmin } from "@/lib/auth";
import { createSocietySchema, getPlanFamilyLimit, RESERVED_SLUGS } from "@society-mitra/shared";
import { revalidatePath } from "next/cache";

export async function createSociety(formData: FormData) {
  const { error: authError } = await requirePlatformAdmin();
  if (authError) return { error: "Unauthorized" };

  const parsed = createSocietySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    city: formData.get("city") || undefined,
    plan: formData.get("plan") || "free",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  if (RESERVED_SLUGS.includes(parsed.data.slug as typeof RESERVED_SLUGS[number])) {
    return { error: "This slug is reserved" };
  }

  const admin = createAdminClient();
  const familyLimit = getPlanFamilyLimit(parsed.data.plan);

  const { data, error } = await admin
    .from("societies")
    .insert({
      name: parsed.data.name,
      slug: parsed.data.slug,
      city: parsed.data.city ?? null,
      plan: parsed.data.plan,
      family_limit: familyLimit,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/admin/societies");
  return { success: true, society: data };
}

export async function listSocieties() {
  const { error: authError } = await requirePlatformAdmin();
  if (authError) return { error: "Unauthorized", societies: [] };

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("societies")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return { error: error.message, societies: [] };
  return { societies: data };
}
