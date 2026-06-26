import { authEmailToMobile } from "@society-mitra/shared";
import {
  getCurrentProfile,
  getCurrentUser,
  getMembership,
  syncPlatformAdminProfile,
} from "@/lib/auth";
import { syncPlatformAdminFromSession } from "@/lib/auth/post-login";

export type SessionActor = {
  id: string;
  displayName: string;
  phone: string | null;
  roleLabel: string;
  isPlatformAdmin: boolean;
};

function resolveMobileFromUser(user: {
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}) {
  const phone = user.user_metadata?.phone;
  return (typeof phone === "string" ? phone : null) || authEmailToMobile(user.email);
}

/** Resolved identity for admin chrome — syncs platform admin flag first. */
export async function getSessionActor(societyId?: string): Promise<SessionActor | null> {
  await syncPlatformAdminFromSession();

  const user = await getCurrentUser();
  const profile = await getCurrentProfile();
  if (!user || !profile) return null;

  const ensured = await syncPlatformAdminProfile(profile);
  const metadataName =
    typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null;
  const displayName = ensured.full_name?.trim() || metadataName || "User";
  const phone = ensured.phone || resolveMobileFromUser(user);

  let roleLabel = "Member";
  if (ensured.is_platform_admin) {
    roleLabel = "Super Admin";
  } else if (societyId) {
    const membership = await getMembership(societyId, ensured.id);
    if (membership?.role === "society_admin") roleLabel = "Society Admin";
    else if (membership?.role === "block_admin") roleLabel = "Block Admin";
  }

  return {
    id: ensured.id,
    displayName,
    phone,
    roleLabel,
    isPlatformAdmin: ensured.is_platform_admin,
  };
}
