"use server";

import { createClient } from "@/lib/supabase/server";
import { APP_URL } from "@/lib/config";
import { redirect } from "next/navigation";
import { loginSchema, otpSchema } from "@society-mitra/shared";

export async function sendOtp(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: "Please enter a valid email address" };
  }

  const supabase = await createClient();
  const redirectTo = formData.get("redirect") as string | null;

  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: `${APP_URL}/auth/callback${
        redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ""
      }`,
    },
  });

  if (error) return { error: error.message };
  return { success: true, email: parsed.data.email };
}

export async function verifyOtp(formData: FormData) {
  const parsed = otpSchema.safeParse({
    email: formData.get("email"),
    token: formData.get("token"),
  });

  if (!parsed.success) {
    return { error: "Invalid OTP" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    email: parsed.data.email,
    token: parsed.data.token,
    type: "email",
  });

  if (error) return { error: error.message };

  const redirectTo = formData.get("redirect") as string | null;
  redirect(redirectTo || "/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function syncPlatformAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return;

  const adminEmails = (process.env.PLATFORM_ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (adminEmails.includes(user.email.toLowerCase())) {
    await supabase
      .from("profiles")
      .update({ is_platform_admin: true })
      .eq("user_id", user.id);
  }
}
