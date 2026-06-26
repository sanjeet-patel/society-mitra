"use server";

import { createClient } from "@/lib/supabase/server";
import {
  getCurrentProfile,
  getSocietyBySlug,
  getApprovedMemberCount,
  requireSocietyAdmin,
} from "@/lib/auth";
import {
  profileSchema,
  familyMemberSchema,
  vehicleSchema,
  tenantSchema,
  provisionMemberSchema,
  updateMemberSchema,
  resetPasswordSchema,
  joinSocietySchema,
} from "@society-mitra/shared";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { provisionMember, resetUserPassword, getProfileUserId } from "@/lib/actions/provisioning";
import { logAuditEvent } from "@/lib/actions/audit";

async function unitAlreadyHasAccount(
  supabase: Awaited<ReturnType<typeof createClient>>,
  societyId: string,
  unitId: string,
  excludeProfileId?: string
) {
  let query = supabase
    .from("society_members")
    .select("id")
    .eq("society_id", societyId)
    .eq("unit_id", unitId)
    .in("status", ["pending", "approved"]);

  if (excludeProfileId) {
    query = query.neq("profile_id", excludeProfileId);
  }

  const { data } = await query.limit(1);
  return (data?.length ?? 0) > 0;
}

export async function joinSociety(societySlug: string, formData: FormData) {
  const society = await getSocietyBySlug(societySlug);
  if (!society) return { error: "Society not found" };

  const profile = await getCurrentProfile();
  if (!profile) return { error: "Sign in to request membership" };

  const phoneRaw = formData.get("phone");
  const phone =
    (typeof phoneRaw === "string" && phoneRaw.trim() ? phoneRaw : null) ||
    profile.phone ||
    undefined;

  const parsed = joinSocietySchema.safeParse({
    fullName: formData.get("fullName") || profile.full_name,
    phone,
    unitNumber: formData.get("unitNumber"),
    role: formData.get("role") || "owner",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("society_members")
    .select("id, status")
    .eq("society_id", society.id)
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (existing?.status === "approved") {
    return { error: "You are already a member of this society" };
  }
  if (existing?.status === "pending") {
    return { error: "Your join request is already pending approval" };
  }

  const admin = createAdminClient();

  let unitId: string | null = null;
  const trimmedUnit = parsed.data.unitNumber.trim();
  if (trimmedUnit) {
    const { data: unit } = await admin
      .from("units")
      .select("id")
      .eq("society_id", society.id)
      .eq("unit_number", trimmedUnit)
      .maybeSingle();

    if (unit) {
      const { data: unitTaken } = await admin
        .from("society_members")
        .select("id")
        .eq("society_id", society.id)
        .eq("unit_id", unit.id)
        .neq("profile_id", profile.id)
        .in("status", ["pending", "approved"])
        .maybeSingle();

      if (unitTaken) {
        return { error: "This house/unit already has a pending or approved account" };
      }
      unitId = unit.id;
    } else {
      const { data: newUnit, error: unitError } = await admin
        .from("units")
        .insert({ society_id: society.id, unit_number: trimmedUnit })
        .select("id")
        .single();
      if (unitError) return { error: unitError.message };
      unitId = newUnit.id;
    }
  }

  if (parsed.data.fullName !== profile.full_name || parsed.data.phone !== profile.phone) {
    const supabase = await createClient();
    await supabase
      .from("profiles")
      .update({
        full_name: parsed.data.fullName,
        phone: parsed.data.phone || profile.phone,
      })
      .eq("id", profile.id);
  }

  const memberPayload = {
    society_id: society.id,
    profile_id: profile.id,
    unit_id: unitId,
    role: parsed.data.role,
    status: "pending" as const,
  };

  if (existing?.status === "rejected") {
    const { error } = await admin
      .from("society_members")
      .update(memberPayload)
      .eq("id", existing.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await admin.from("society_members").insert(memberPayload);
    if (error) return { error: error.message };
  }

  revalidatePath(`/${societySlug}/admin/members`);
  revalidatePath("/admin/members");
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

    const { data: pendingMember } = await supabase
      .from("society_members")
      .select("unit_id, profile_id")
      .eq("id", memberId)
      .eq("society_id", society.id)
      .single();

    if (
      pendingMember?.unit_id &&
      (await unitAlreadyHasAccount(
        supabase,
        society.id,
        pendingMember.unit_id,
        pendingMember.profile_id
      ))
    ) {
      return {
        error:
          "This house/unit already has an approved account. Reject duplicate requests or ask the resident to add family under Profile.",
      };
    }
  }

  const { error } = await supabase
    .from("society_members")
    .update({ status })
    .eq("id", memberId)
    .eq("society_id", society.id);

  if (error) return { error: error.message };

  await logAuditEvent("member.approve", "society_member", memberId, society.id, { status });
  revalidatePath(`/${societySlug}/admin/members`);
  revalidatePath("/admin/members");
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

  const admin = createAdminClient();
  const { data } = await admin
    .from("society_members")
    .select("*, profiles(*), units(unit_number)")
    .eq("society_id", society.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getAllMembers(societySlug: string) {
  const { error: authError, society } = await requireSocietyAdmin(societySlug);
  if (authError || !society) return [];

  const admin = createAdminClient();
  const { data } = await admin
    .from("society_members")
    .select("*, profiles(*), units(unit_number)")
    .eq("society_id", society.id)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function createMemberByAdmin(societySlug: string, formData: FormData) {
  const { error: authError, society } = await requireSocietyAdmin(societySlug);
  if (authError || !society) return { error: authError || "Not found" };

  const parsed = provisionMemberSchema.safeParse({
    mobile: formData.get("mobile"),
    password: formData.get("password"),
    fullName: formData.get("fullName"),
    unitNumber: formData.get("unitNumber") || "",
    role: formData.get("role") || "owner",
    tags: formData.get("tags") || "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const memberCount = await getApprovedMemberCount(society.id);
  if (society.family_limit && memberCount >= society.family_limit) {
    return { error: "Member limit reached for this plan" };
  }

  const result = await provisionMember({
    mobile: parsed.data.mobile,
    password: parsed.data.password,
    fullName: parsed.data.fullName,
    societyId: society.id,
    role: parsed.data.role,
    unitNumber: parsed.data.unitNumber || undefined,
    tags: parsed.data.tags,
    mustChangePassword: true,
  });

  if ("error" in result && result.error) return { error: result.error };
  if (!("success" in result)) return { error: "Provisioning failed" };

  await logAuditEvent("member.create", "society_member", result.profileId, society.id);
  revalidatePath(`/${societySlug}/admin/members`);
  revalidatePath(`/${societySlug}/directory`);
  return {
    success: true,
    credentials: {
      mobile: parsed.data.mobile.replace(/\D/g, "").slice(-10),
      password: parsed.data.password,
      fullName: parsed.data.fullName,
    },
  };
}

export async function updateMemberByAdmin(
  societySlug: string,
  memberId: string,
  formData: FormData
) {
  const { error: authError, society } = await requireSocietyAdmin(societySlug);
  if (authError || !society) return { error: authError || "Not found" };

  const parsed = updateMemberSchema.safeParse({
    role: formData.get("role"),
    unitNumber: formData.get("unitNumber") || "",
    status: formData.get("status") || undefined,
    tags: formData.get("tags") || "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const supabase = await createClient();
  const { data: member } = await supabase
    .from("society_members")
    .select("profile_id, unit_id")
    .eq("id", memberId)
    .eq("society_id", society.id)
    .single();

  if (!member) return { error: "Member not found" };

  let unitId = member.unit_id;
  if (parsed.data.unitNumber !== undefined) {
    const trimmed = parsed.data.unitNumber.trim();
    if (trimmed) {
      let { data: unit } = await supabase
        .from("units")
        .select("id")
        .eq("society_id", society.id)
        .eq("unit_number", trimmed)
        .maybeSingle();

      if (!unit) {
        const { data: newUnit, error: unitError } = await supabase
          .from("units")
          .insert({ society_id: society.id, unit_number: trimmed })
          .select("id")
          .single();
        if (unitError) return { error: unitError.message };
        unit = newUnit;
      }

      if (
        await unitAlreadyHasAccount(supabase, society.id, unit.id, member.profile_id)
      ) {
        return { error: "This house/unit already has an account" };
      }
      unitId = unit.id;
    } else {
      unitId = null;
    }
  }

  const { error } = await supabase
    .from("society_members")
    .update({
      role: parsed.data.role,
      status: parsed.data.status ?? "approved",
      unit_id: unitId,
      tags: parsed.data.tags ?? [],
    })
    .eq("id", memberId)
    .eq("society_id", society.id);

  if (error) return { error: error.message };

  await logAuditEvent("member.update", "society_member", memberId, society.id);
  revalidatePath(`/${societySlug}/admin/members`);
  revalidatePath(`/${societySlug}/directory`);
  return { success: true };
}

export async function removeMemberByAdmin(societySlug: string, memberId: string) {
  const { error: authError, society } = await requireSocietyAdmin(societySlug);
  if (authError || !society) return { error: authError || "Not found" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("society_members")
    .update({ status: "rejected" })
    .eq("id", memberId)
    .eq("society_id", society.id);

  if (error) return { error: error.message };

  await logAuditEvent("member.deactivate", "society_member", memberId, society.id);
  revalidatePath(`/${societySlug}/admin/members`);
  return { success: true };
}

export async function resetMemberPasswordByAdmin(
  societySlug: string,
  memberId: string,
  formData: FormData
) {
  const { error: authError, society } = await requireSocietyAdmin(societySlug);
  if (authError || !society) return { error: authError || "Not found" };

  const parsed = resetPasswordSchema.safeParse({
    newPassword: formData.get("newPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const supabase = await createClient();
  const { data: member } = await supabase
    .from("society_members")
    .select("profile_id")
    .eq("id", memberId)
    .eq("society_id", society.id)
    .single();

  if (!member) return { error: "Member not found" };

  const userId = await getProfileUserId(member.profile_id);
  if (!userId) return { error: "User not found" };

  const result = await resetUserPassword(userId, parsed.data.newPassword);
  if ("error" in result && result.error) return { error: result.error };

  await logAuditEvent("member.reset_password", "society_member", memberId, society.id);
  revalidatePath(`/${societySlug}/admin/members`);
  return { success: true, password: parsed.data.newPassword };
}
