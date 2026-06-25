import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { authEmailToMobile } from "@society-mitra/shared";
import type { MemberRole, MemberStatus } from "@society-mitra/shared";
import { syncPlatformAdminFromSession } from "@/lib/auth/post-login";

function getPlatformAdminPhones(): string[] {
  return (process.env.PLATFORM_ADMIN_PHONES || "")
    .split(",")
    .map((p) => p.replace(/\D/g, "").slice(-10))
    .filter(Boolean);
}

function resolveMobileFromUser(user: { email?: string | null; user_metadata?: Record<string, unknown> }) {
  const phone = user.user_metadata?.phone;
  return (typeof phone === "string" ? phone : null) || authEmailToMobile(user.email);
}

async function ensurePlatformAdminFlag<
  T extends { id: string; is_platform_admin: boolean },
>(profile: T): Promise<T> {
  if (profile.is_platform_admin) return profile;

  const user = await getCurrentUser();
  if (!user) return profile;

  const mobile = resolveMobileFromUser(user);
  if (!mobile || !getPlatformAdminPhones().includes(mobile)) return profile;

  const admin = createAdminClient();
  await admin.from("profiles").update({ is_platform_admin: true }).eq("id", profile.id);

  return { ...profile, is_platform_admin: true };
}

export async function syncPlatformAdminProfile<
  T extends { id: string; is_platform_admin: boolean },
>(profile: T): Promise<T> {
  return ensurePlatformAdminFlag(profile);
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentProfile() {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return data;
}

export async function getSocietyBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("societies")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data;
}

export async function getMembership(societyId: string, profileId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("society_members")
    .select("*")
    .eq("society_id", societyId)
    .eq("profile_id", profileId)
    .single();

  return data;
}

export async function requireMembership(societySlug: string) {
  const society = await getSocietyBySlug(societySlug);
  if (!society) return { error: "Society not found" as const, society: null, profile: null, membership: null };

  const profile = await getCurrentProfile();
  if (!profile) return { error: "Unauthorized" as const, society, profile: null, membership: null };

  const membership = await getMembership(society.id, profile.id);
  if (!membership || membership.status !== "approved") {
    return { error: "Not a member" as const, society, profile, membership };
  }

  return { error: null, society, profile, membership };
}

export async function requireSocietyAdmin(societySlug: string) {
  const society = await getSocietyBySlug(societySlug);
  if (!society) return { error: "Society not found" as const, society: null, profile: null, membership: null };

  const profile = await getCurrentProfile();
  if (!profile) return { error: "Unauthorized" as const, society, profile: null, membership: null };

  if (profile.is_platform_admin) {
    const membership = await getMembership(society.id, profile.id);
    return { error: null, society, profile, membership };
  }

  const membership = await getMembership(society.id, profile.id);
  if (!membership || membership.status !== "approved") {
    return { error: "Not a member" as const, society, profile, membership };
  }

  const adminRoles: MemberRole[] = ["society_admin", "block_admin"];
  if (!adminRoles.includes(membership.role as MemberRole)) {
    return { error: "Forbidden" as const, society, profile, membership };
  }

  return { error: null, society, profile, membership };
}

export async function requirePlatformAdmin() {
  await syncPlatformAdminFromSession();

  const profile = await getCurrentProfile();
  if (!profile) return { error: "Forbidden" as const, profile: null };

  const ensured = await ensurePlatformAdminFlag(profile);
  if (!ensured.is_platform_admin) {
    return { error: "Forbidden" as const, profile: null };
  }

  return { error: null, profile: ensured };
}

export function isAdminRole(role: MemberRole): boolean {
  return role === "society_admin" || role === "block_admin";
}

export async function getApprovedMemberCount(societyId: string) {
  const supabase = await createClient();
  const { count } = await supabase
    .from("society_members")
    .select("*", { count: "exact", head: true })
    .eq("society_id", societyId)
    .eq("status", "approved" as MemberStatus);

  return count ?? 0;
}
