import { createClient } from "@/lib/supabase/server";
import type { MemberRole, MemberStatus } from "@society-mitra/shared";

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
  const profile = await getCurrentProfile();
  if (!profile?.is_platform_admin) {
    return { error: "Forbidden" as const, profile: null };
  }
  return { error: null, profile };
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
