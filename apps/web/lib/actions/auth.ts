"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  loginSchema,
  changePasswordSchema,
  normalizeIndianMobile,
  mobileToAuthEmail,
  authEmailToMobile,
} from "@society-mitra/shared";
import { logAuditEvent } from "@/lib/actions/audit";
import { resolvePostLoginRedirect, syncPlatformAdminFromSession } from "@/lib/auth/post-login";

function resolveMobile(raw: string): string | null {
  return normalizeIndianMobile(raw);
}

export async function signIn(formData: FormData) {
  const parsed = loginSchema.safeParse({
    mobile: formData.get("mobile"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Enter a valid mobile number and password" };
  }

  const mobile = resolveMobile(parsed.data.mobile);
  if (!mobile) {
    return { error: "Enter a valid 10-digit mobile number" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: mobileToAuthEmail(mobile),
    password: parsed.data.password,
  });

  if (error) return { error: error.message };

  await syncPlatformAdminFromSession();

  const redirectTo = formData.get("redirect") as string | null;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.user_metadata?.must_change_password) {
    const destination = await resolvePostLoginRedirect(redirectTo);
    redirect(`/change-password?redirect=${encodeURIComponent(destination)}`);
  }

  const destination = await resolvePostLoginRedirect(redirectTo);
  redirect(destination);
}

export async function signUp(_formData: FormData) {
  return {
    error:
      "Public registration is disabled. Contact your society admin for an account.",
  };
}

export async function changePassword(formData: FormData) {
  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const mobile =
    (typeof user.user_metadata?.phone === "string" ? user.user_metadata.phone : null) ||
    authEmailToMobile(user.email);

  if (!mobile) return { error: "Could not verify account" };

  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: mobileToAuthEmail(mobile),
    password: parsed.data.currentPassword,
  });

  if (verifyError) return { error: "Current password is incorrect" };

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.newPassword,
    data: { must_change_password: false },
  });

  if (error) return { error: error.message };

  await logAuditEvent("auth.change_password", "profile");
  return { success: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login?signedOut=1");
}

export async function syncPlatformAdmin() {
  await syncPlatformAdminFromSession();
}

export async function mustChangePassword() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return Boolean(user?.user_metadata?.must_change_password);
}
