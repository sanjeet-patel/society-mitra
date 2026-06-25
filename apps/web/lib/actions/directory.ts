"use server";

import { createClient } from "@/lib/supabase/server";
import { requireMembership } from "@/lib/auth";
import { maskPhone } from "@society-mitra/shared";

type DirectoryProfile = {
  full_name?: string;
  phone?: string | null;
  email?: string | null;
  blood_group?: string | null;
  family_members?: { name: string; relation: string | null; age: number | null }[];
  vehicles?: { plate_number: string; vehicle_type: string | null }[];
};

function unwrapRelation<T>(value: T | T[] | null): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

export async function searchDirectory(societySlug: string, query: string) {
  const { error, society } = await requireMembership(societySlug);
  if (error || !society) return [];

  const supabase = await createClient();

  const { data: members } = await supabase
    .from("society_members")
    .select(`
      id,
      role,
      status,
      tags,
      units(unit_number, floor, blocks(name)),
      profiles(
        id,
        full_name,
        phone,
        email,
        blood_group,
        family_members(name, relation, age),
        vehicles(plate_number, vehicle_type)
      )
    `)
    .eq("society_id", society.id)
    .eq("status", "approved");

  if (!members) return [];

  const q = query.toLowerCase().trim();

  const filtered = members.filter((member) => {
    const profile = unwrapRelation(member.profiles) as DirectoryProfile | null;
    if (!profile) return false;
    if (!q) return true;

    const unit = unwrapRelation(member.units) as { unit_number?: string } | null;

    if (profile.full_name?.toLowerCase().includes(q)) return true;
    if (unit?.unit_number?.toLowerCase().includes(q)) return true;
    if (profile.phone?.includes(q)) return true;
    if (profile.email?.toLowerCase().includes(q)) return true;
    if (profile.vehicles?.some((v) => v.plate_number.toLowerCase().includes(q))) return true;
    if ((member.tags as string[] | null)?.some((tag: string) => tag.toLowerCase().includes(q)))
      return true;

    return false;
  });

  return filtered.map((member) => {
    const profile = unwrapRelation(member.profiles) as DirectoryProfile;
    const unitRaw = unwrapRelation(member.units) as {
      unit_number?: string;
      floor?: string | null;
      blocks?: { name: string } | { name: string }[] | null;
    } | null;
    const blocks = unitRaw?.blocks ? unwrapRelation(unitRaw.blocks) : null;

    return {
      id: member.id,
      role: member.role,
      status: member.status,
      tags: (member.tags as string[] | null) ?? [],
      units: unitRaw
        ? {
            unit_number: unitRaw.unit_number ?? "",
            floor: unitRaw.floor ?? null,
            blocks: blocks ? { name: blocks.name } : null,
          }
        : null,
      profiles: {
        full_name: profile.full_name ?? "",
        phone: society.show_full_phone
          ? profile.phone ?? null
          : profile.phone
            ? maskPhone(profile.phone)
            : null,
        email: profile.email ?? null,
        blood_group: profile.blood_group ?? null,
        family_members: profile.family_members ?? [],
        vehicles: profile.vehicles ?? [],
      },
    };
  });
}

export async function getDirectoryMembers(societySlug: string) {
  return searchDirectory(societySlug, "");
}

export async function getTenantsForSociety(societySlug: string) {
  const { error, society } = await requireMembership(societySlug);
  if (error || !society) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("tenants")
    .select("*, units(unit_number)")
    .eq("society_id", society.id)
    .order("created_at", { ascending: false });

  return data ?? [];
}
