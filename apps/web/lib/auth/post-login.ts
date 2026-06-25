import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { authEmailToMobile } from "@society-mitra/shared";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth";

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

/** Promote platform admin by phone list using service role (bypasses RLS). */
export async function syncPlatformAdminFromSession() {
  const user = await getCurrentUser();
  if (!user) return;

  const mobile = resolveMobileFromUser(user);
  if (!mobile || !getPlatformAdminPhones().includes(mobile)) return;

  try {
    const admin = createAdminClient();
    await admin.from("profiles").update({ is_platform_admin: true }).eq("user_id", user.id);
  } catch {
    // Missing service role key — rely on seed/DB flag
  }
}

function isSafeRedirect(path: string | null | undefined): path is string {
  return Boolean(path && path.startsWith("/") && !path.startsWith("//"));
}

/** Default landing page after sign-in based on role and memberships. */
export async function resolvePostLoginRedirect(explicitRedirect: string | null): Promise<string> {
  if (isSafeRedirect(explicitRedirect)) return explicitRedirect;

  await syncPlatformAdminFromSession();
  const profile = await getCurrentProfile();
  if (!profile) return "/";

  const mobile = profile.phone?.replace(/\D/g, "").slice(-10);
  if (profile.is_platform_admin || (mobile && getPlatformAdminPhones().includes(mobile))) {
    return "/admin";
  }

  const supabase = await createClient();
  const { data: memberships } = await supabase
    .from("society_members")
    .select("role, societies(slug)")
    .eq("profile_id", profile.id)
    .eq("status", "approved");

  const adminMembership = memberships?.find((m) =>
    ["society_admin", "block_admin"].includes(m.role)
  );
  const adminSociety = adminMembership?.societies as { slug?: string } | null | undefined;
  if (adminSociety?.slug) return `/${adminSociety.slug}/admin`;

  const firstSociety = memberships?.[0]?.societies as { slug?: string } | null | undefined;
  if (firstSociety?.slug) return `/${firstSociety.slug}/dashboard`;

  return "/";
}
