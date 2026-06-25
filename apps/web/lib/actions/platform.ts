"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requirePlatformAdmin } from "@/lib/auth";
import {
  createSocietySchema,
  updateSocietySchema,
  provisionMemberSchema,
  getPlanFamilyLimit,
  RESERVED_SLUGS,
} from "@society-mitra/shared";
import { revalidatePath } from "next/cache";
import { provisionMember } from "@/lib/actions/provisioning";
import { logAuditEvent } from "@/lib/actions/audit";

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

  if (RESERVED_SLUGS.includes(parsed.data.slug as (typeof RESERVED_SLUGS)[number])) {
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

  await logAuditEvent("society.create", "society", data.id, data.id, { slug: data.slug });
  revalidatePath("/admin");
  revalidatePath("/admin/societies");
  return { success: true, society: data };
}

export async function updateSociety(societyId: string, formData: FormData) {
  const { error: authError } = await requirePlatformAdmin();
  if (authError) return { error: "Unauthorized" };

  const parsed = updateSocietySchema.safeParse({
    name: formData.get("name"),
    city: formData.get("city") || "",
    plan: formData.get("plan"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("societies")
    .update({
      name: parsed.data.name,
      city: parsed.data.city || null,
      plan: parsed.data.plan,
      family_limit: getPlanFamilyLimit(parsed.data.plan),
    })
    .eq("id", societyId)
    .select()
    .single();

  if (error) return { error: error.message };

  await logAuditEvent("society.update", "society", societyId, societyId);
  revalidatePath("/admin");
  revalidatePath("/admin/societies");
  revalidatePath(`/admin/societies/${data.slug}`);
  return { success: true, society: data };
}

export async function assignSocietyAdmin(societyId: string, formData: FormData) {
  const { error: authError } = await requirePlatformAdmin();
  if (authError) return { error: "Unauthorized" };

  const parsed = provisionMemberSchema.safeParse({
    mobile: formData.get("mobile"),
    password: formData.get("password"),
    fullName: formData.get("fullName"),
    unitNumber: formData.get("unitNumber") || "",
    role: "society_admin",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const result = await provisionMember({
    mobile: parsed.data.mobile,
    password: parsed.data.password,
    fullName: parsed.data.fullName,
    societyId,
    role: "society_admin",
    unitNumber: parsed.data.unitNumber || undefined,
    mustChangePassword: true,
  });

  if ("error" in result && result.error) return { error: result.error };
  if (!("success" in result)) return { error: "Provisioning failed" };

  await logAuditEvent("society.assign_admin", "profile", result.profileId, societyId);
  revalidatePath("/admin");
  revalidatePath(`/admin/societies`);
  return { success: true, profileId: result.profileId };
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

export async function getSocietyBySlugAdmin(slug: string) {
  const { error: authError } = await requirePlatformAdmin();
  if (authError) return { error: "Unauthorized", society: null };

  const admin = createAdminClient();
  const { data, error } = await admin.from("societies").select("*").eq("slug", slug).single();
  if (error) return { error: error.message, society: null };
  return { society: data };
}

export async function getSocietyAdmins(societyId: string) {
  const { error: authError } = await requirePlatformAdmin();
  if (authError) return [];

  const admin = createAdminClient();
  const { data } = await admin
    .from("society_members")
    .select("*, profiles(full_name, phone), units(unit_number)")
    .eq("society_id", societyId)
    .eq("role", "society_admin")
    .eq("status", "approved");

  return data ?? [];
}

export async function getPlatformDashboardStats() {
  const { error: authError } = await requirePlatformAdmin();
  if (authError) return { error: "Unauthorized" as const, stats: null };

  const admin = createAdminClient();

  const [
    { count: societyCount },
    { count: memberCount },
    { count: classifiedCount },
    { count: vendorCount },
  ] = await Promise.all([
    admin.from("societies").select("*", { count: "exact", head: true }),
    admin.from("society_members").select("*", { count: "exact", head: true }).eq("status", "approved"),
    admin.from("classified_ads").select("*", { count: "exact", head: true }).eq("status", "active"),
    admin.from("service_providers").select("*", { count: "exact", head: true }),
  ]);

  const { data: societies } = await admin
    .from("societies")
    .select("id, name, slug, plan, city, family_limit, created_at")
    .order("created_at", { ascending: false });

  const { data: recentMembers } = await admin
    .from("society_members")
    .select("id, role, status, created_at, societies(name, slug), profiles(full_name, phone), units(unit_number)")
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: recentClassifieds } = await admin
    .from("classified_ads")
    .select("id, title, ad_type, status, created_at, societies(name, slug), profiles(full_name)")
    .order("created_at", { ascending: false })
    .limit(20);

  return {
    stats: {
      societyCount: societyCount ?? 0,
      memberCount: memberCount ?? 0,
      classifiedCount: classifiedCount ?? 0,
      vendorCount: vendorCount ?? 0,
      societies: societies ?? [],
      recentMembers: recentMembers ?? [],
      recentClassifieds: recentClassifieds ?? [],
    },
  };
}

export async function getAllPlatformMembers(search?: string) {
  const { error: authError } = await requirePlatformAdmin();
  if (authError) return [];

  const admin = createAdminClient();
  let query = admin
    .from("society_members")
    .select("*, societies(name, slug), profiles(full_name, phone), units(unit_number)")
    .order("created_at", { ascending: false });

  const { data } = await query;
  if (!search?.trim()) return data ?? [];

  const q = search.toLowerCase();
  return (data ?? []).filter((m) => {
    const profile = m.profiles as { full_name?: string; phone?: string } | null;
    const society = m.societies as { name?: string; slug?: string } | null;
    return (
      profile?.full_name?.toLowerCase().includes(q) ||
      profile?.phone?.includes(q) ||
      society?.name?.toLowerCase().includes(q) ||
      society?.slug?.includes(q)
    );
  });
}

export async function getAllPlatformClassifieds() {
  const { error: authError } = await requirePlatformAdmin();
  if (authError) return [];

  const admin = createAdminClient();
  const { data } = await admin
    .from("classified_ads")
    .select("*, societies(name, slug), profiles(full_name, phone)")
    .order("created_at", { ascending: false });

  return data ?? [];
}
