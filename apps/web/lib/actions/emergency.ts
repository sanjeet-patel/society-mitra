"use server";

import { createClient } from "@/lib/supabase/server";
import { requireSocietyAdmin, requireMembership } from "@/lib/auth";
import { emergencyContactSchema } from "@society-mitra/shared";
import { revalidatePath } from "next/cache";

export async function createEmergencyContact(societySlug: string, formData: FormData) {
  const { error: authError, society } = await requireSocietyAdmin(societySlug);
  if (authError || !society) return { error: authError || "Not found" };

  const parsed = emergencyContactSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    contactType: formData.get("contactType"),
    roleLabel: formData.get("roleLabel") || undefined,
    whatsapp: formData.get("whatsapp") || undefined,
    sortOrder: formData.get("sortOrder") ? Number(formData.get("sortOrder")) : 0,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("emergency_contacts").insert({
    society_id: society.id,
    name: parsed.data.name,
    phone: parsed.data.phone,
    contact_type: parsed.data.contactType,
    role_label: parsed.data.roleLabel ?? null,
    whatsapp: parsed.data.whatsapp ?? null,
    sort_order: parsed.data.sortOrder,
  });

  if (error) return { error: error.message };

  revalidatePath(`/${societySlug}/emergency`);
  revalidatePath(`/${societySlug}/dashboard`);
  return { success: true };
}

export async function deleteEmergencyContact(societySlug: string, id: string) {
  const { error: authError, society } = await requireSocietyAdmin(societySlug);
  if (authError || !society) return { error: authError || "Not found" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("emergency_contacts")
    .delete()
    .eq("id", id)
    .eq("society_id", society.id);

  if (error) return { error: error.message };

  revalidatePath(`/${societySlug}/emergency`);
  return { success: true };
}

export async function updateEmergencyContact(
  societySlug: string,
  id: string,
  formData: FormData
) {
  const { error: authError, society } = await requireSocietyAdmin(societySlug);
  if (authError || !society) return { error: authError || "Not found" };

  const parsed = emergencyContactSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    contactType: formData.get("contactType"),
    roleLabel: formData.get("roleLabel") || undefined,
    whatsapp: formData.get("whatsapp") || undefined,
    sortOrder: formData.get("sortOrder") ? Number(formData.get("sortOrder")) : 0,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("emergency_contacts")
    .update({
      name: parsed.data.name,
      phone: parsed.data.phone,
      contact_type: parsed.data.contactType,
      role_label: parsed.data.roleLabel ?? null,
      whatsapp: parsed.data.whatsapp ?? null,
      sort_order: parsed.data.sortOrder,
    })
    .eq("id", id)
    .eq("society_id", society.id);

  if (error) return { error: error.message };

  revalidatePath(`/${societySlug}/admin/helpline`);
  revalidatePath(`/${societySlug}/emergency`);
  return { success: true };
}

export async function getEmergencyContacts(societySlug: string) {
  const society = (await requireMembership(societySlug)).society;
  if (!society) {
    const supabase = await createClient();
    const { data: pubSociety } = await supabase
      .from("societies")
      .select("id")
      .eq("slug", societySlug)
      .single();
    if (!pubSociety) return [];

    const { data } = await supabase
      .from("emergency_contacts")
      .select("*")
      .eq("society_id", pubSociety.id)
      .order("sort_order");

    return data ?? [];
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("emergency_contacts")
    .select("*")
    .eq("society_id", society.id)
    .order("sort_order");

  return data ?? [];
}
