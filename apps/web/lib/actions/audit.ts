"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/auth";

export async function logAuditEvent(
  action: string,
  entityType: string,
  entityId?: string,
  societyId?: string,
  metadata?: Record<string, unknown>
) {
  const profile = await getCurrentProfile();
  const admin = createAdminClient();

  await admin.from("audit_events").insert({
    society_id: societyId ?? null,
    actor_id: profile?.id ?? null,
    action,
    entity_type: entityType,
    entity_id: entityId ?? null,
    metadata: metadata ?? {},
  });
}
