"use server";

import { createClient } from "@/lib/supabase/server";
import {
  getCurrentProfile,
  getSocietyBySlug,
  getApprovedMemberCount,
  requireSocietyAdmin,
} from "@/lib/auth";
import {
  joinSocietySchema,
  profileSchema,
  familyMemberSchema,
  vehicleSchema,
  tenantSchema,
} from "@society-mitra/shared";
import { revalidatePath } from "next/cache";

export async function joinSociety(societySlug: string, formData: FormData) {
  const parsed = joinSocietySchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone") || undefined,
    unitNumber: formData.get("unitNumber"),
    role: formData.get("role") || "owner",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const supabase = await createClient();
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Please log in first" };

  const society = await getSocietyBySlug(societySlug);
  if (!society) return { error: "Society not found" };

  await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      phone: parsed.data.phone ?? profile.phone,
    })
    .eq("id", profile.id);

  let { data: unit } = await supabase
    .from("units")
    .select("id")
    .eq("society_id", society.id)
    .eq("unit_number", parsed.data.unitNumber)
    .single();

  if (!unit) {
    const { data: newUnit, error: unitError } = await supabase
      .from("units")
      .insert({
        society_id: society.id,
        unit_number: parsed.data.unitNumber,
      })
      .select("id")
      .single();

    if (unitError) return { error: unitError.message };
    unit = newUnit;
  }

  const memberCount = await getApprovedMemberCount(society.id);
  if (society.family_limit && memberCount >= society.family_limit) {
    return { error: "This society has reached its member limit" };
  }

  const { error } = await supabase.from("society_members").upsert(
    {
      society_id: society.id,
      profile_id: profile.id,
      unit_id: unit.id,
      role: parsed.data.role,
      status: "pending",
    },
    { onConflict: "society_id,profile_id" }
  );

  if (error) return { error: error.message };

  revalidatePath(`/${societySlug}`);
  return { success: true };
}

export async function approveMember(
  societySlug: string,
  memberId: string,
  status: "approved" | "rejected"
) {
  const { error: authError, society } = await requireSocietyAdmin(societySlug);
  if (authError || !society) return { error: authError || "Not found" };

  const supabase = await createClient();

  if (status === "approved") {
    const memberCount = await getApprovedMemberCount(society.id);
    if (society.family_limit && memberCount >= society.family_limit) {
      return { error: "Member limit reached for this plan" };
    }

    const { data: existingAdmins } = await supabase
      .from("society_members")
      .select("id")
      .eq("society_id", society.id)
      .eq("role", "society_admin")
      .eq("status", "approved")
      .limit(1);

    if (!existingAdmins?.length) {
      await supabase
        .from("society_members")
        .update({ status, role: "society_admin" })
        .eq("id", memberId)
        .eq("society_id", society.id);

      revalidatePath(`/${societySlug}/admin/members`);
      return { success: true };
    }
  }

  const { error } = await supabase
    .from("society_members")
    .update({ status })
    .eq("id", memberId)
    .eq("society_id", society.id);

  if (error) return { error: error.message };

  revalidatePath(`/${societySlug}/admin/members`);
  return { success: true };
}

export async function updateProfile(societySlug: string, formData: FormData) {
  const parsed = profileSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone") || undefined,
    email: formData.get("email") || undefined,
    bloodGroup: formData.get("bloodGroup") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const profile = await getCurrentProfile();
  if (!profile) return { error: "Unauthorized" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      phone: parsed.data.phone ?? null,
      email: parsed.data.email || null,
      blood_group: parsed.data.bloodGroup ?? null,
    })
    .eq("id", profile.id);

  if (error) return { error: error.message };

  revalidatePath(`/${societySlug}/profile`);
  revalidatePath(`/${societySlug}/directory`);
  return { success: true };
}

export async function addFamilyMember(societySlug: string, formData: FormData) {
  const parsed = familyMemberSchema.safeParse({
    name: formData.get("name"),
    relation: formData.get("relation") || undefined,
    age: formData.get("age") ? Number(formData.get("age")) : undefined,
  });

  if (!parsed.success) return { error: "Invalid input" };

  const profile = await getCurrentProfile();
  if (!profile) return { error: "Unauthorized" };

  const supabase = await createClient();
  const { error } = await supabase.from("family_members").insert({
    profile_id: profile.id,
    name: parsed.data.name,
    relation: parsed.data.relation ?? null,
    age: parsed.data.age ?? null,
  });

  if (error) return { error: error.message };

  revalidatePath(`/${societySlug}/profile`);
  return { success: true };
}

export async function addVehicle(societySlug: string, formData: FormData) {
  const parsed = vehicleSchema.safeParse({
    plateNumber: formData.get("plateNumber"),
    vehicleType: formData.get("vehicleType") || undefined,
  });

  if (!parsed.success) return { error: "Invalid input" };

  const profile = await getCurrentProfile();
  if (!profile) return { error: "Unauthorized" };

  const supabase = await createClient();
  const { error } = await supabase.from("vehicles").insert({
    profile_id: profile.id,
    plate_number: parsed.data.plateNumber,
    vehicle_type: parsed.data.vehicleType ?? null,
  });

  if (error) return { error: error.message };

  revalidatePath(`/${societySlug}/profile`);
  return { success: true };
}

export async function addTenant(
  societySlug: string,
  unitId: string,
  formData: FormData
) {
  const { error: authError, society } = await requireSocietyAdmin(societySlug);
  if (authError || !society) return { error: authError || "Not found" };

  const parsed = tenantSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone") || undefined,
    occupation: formData.get("occupation") || undefined,
    policeVerified: formData.get("policeVerified") === "on",
    rentalStart: formData.get("rentalStart") || undefined,
    rentalEnd: formData.get("rentalEnd") || undefined,
  });

  if (!parsed.success) return { error: "Invalid input" };

  const supabase = await createClient();
  const { error } = await supabase.from("tenants").insert({
    unit_id: unitId,
    society_id: society.id,
    full_name: parsed.data.fullName,
    phone: parsed.data.phone ?? null,
    occupation: parsed.data.occupation ?? null,
    police_verified: parsed.data.policeVerified,
    rental_start: parsed.data.rentalStart ?? null,
    rental_end: parsed.data.rentalEnd ?? null,
  });

  if (error) return { error: error.message };

  revalidatePath(`/${societySlug}/directory`);
  return { success: true };
}

export async function getPendingMembers(societySlug: string) {
  const { error: authError, society } = await requireSocietyAdmin(societySlug);
  if (authError || !society) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("society_members")
    .select("*, profiles(*), units(unit_number)")
    .eq("society_id", society.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  return data ?? [];
}
