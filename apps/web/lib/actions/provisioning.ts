"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import {
  normalizeIndianMobile,
  mobileToAuthEmail,
} from "@society-mitra/shared";
import type { MemberRole } from "@society-mitra/shared";

export type ProvisionMemberInput = {
  mobile: string;
  password: string;
  fullName: string;
  societyId: string;
  role: MemberRole;
  unitNumber?: string;
  tags?: string[];
  mustChangePassword?: boolean;
};

export type ProvisionResult =
  | { success: true; profileId: string; userId: string; created: boolean }
  | { error: string };

async function resolveOrCreateUnit(
  admin: ReturnType<typeof createAdminClient>,
  societyId: string,
  unitNumber?: string
) {
  if (!unitNumber?.trim()) return { unitId: null as string | null };

  const trimmed = unitNumber.trim();
  const { data: existing } = await admin
    .from("units")
    .select("id")
    .eq("society_id", societyId)
    .eq("unit_number", trimmed)
    .maybeSingle();

  if (existing) return { unitId: existing.id };

  const { data: created, error } = await admin
    .from("units")
    .insert({ society_id: societyId, unit_number: trimmed })
    .select("id")
    .single();

  if (error) return { error: error.message };
  return { unitId: created.id };
}

async function unitHasMember(
  admin: ReturnType<typeof createAdminClient>,
  societyId: string,
  unitId: string,
  excludeProfileId?: string
) {
  let query = admin
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

export async function provisionMember(input: ProvisionMemberInput): Promise<ProvisionResult> {
  const mobile = normalizeIndianMobile(input.mobile);
  if (!mobile) return { error: "Enter a valid 10-digit mobile number" };

  const admin = createAdminClient();
  const authEmail = mobileToAuthEmail(mobile);
  let userId: string;
  let profileId: string;
  let created = false;

  const { data: createData, error: createError } = await admin.auth.admin.createUser({
    email: authEmail,
    password: input.password,
    email_confirm: true,
    user_metadata: {
      phone: mobile,
      full_name: input.fullName,
      must_change_password: input.mustChangePassword ?? true,
    },
  });

  if (createError) {
    const { data: listData } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const existing = listData.users.find((u) => u.email === authEmail);
    if (!existing) return { error: createError.message };

    userId = existing.id;
    const { data: profile } = await admin
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (!profile) return { error: "User exists but profile not found" };
    profileId = profile.id;

    await admin
      .from("profiles")
      .update({ full_name: input.fullName, phone: mobile })
      .eq("id", profileId);
  } else {
    userId = createData.user.id;
    created = true;

    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (profileError || !profile) return { error: "Profile was not created for new user" };
    profileId = profile.id;

    await admin
      .from("profiles")
      .update({ full_name: input.fullName, phone: mobile })
      .eq("id", profileId);
  }

  const unitResult = await resolveOrCreateUnit(admin, input.societyId, input.unitNumber);
  if ("error" in unitResult && unitResult.error) return { error: unitResult.error };

  if (unitResult.unitId) {
    const taken = await unitHasMember(admin, input.societyId, unitResult.unitId, profileId);
    if (taken) {
      return { error: "This house/unit already has an account" };
    }
  }

  const { error: memberError } = await admin.from("society_members").upsert(
    {
      society_id: input.societyId,
      profile_id: profileId,
      unit_id: unitResult.unitId,
      role: input.role,
      status: "approved",
      tags: input.tags ?? [],
    },
    { onConflict: "society_id,profile_id" }
  );

  if (memberError) return { error: memberError.message };

  return { success: true, profileId, userId, created };
}

export async function resetUserPassword(userId: string, newPassword: string) {
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(userId, {
    password: newPassword,
    user_metadata: { must_change_password: true },
  });
  if (error) return { error: error.message };
  return { success: true as const };
}

export async function getProfileUserId(profileId: string) {
  const admin = createAdminClient();
  const { data } = await admin.from("profiles").select("user_id").eq("id", profileId).single();
  return data?.user_id ?? null;
}
