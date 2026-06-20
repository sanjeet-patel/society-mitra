"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import webpush from "web-push";

const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:admin@societymitra.info";

if (vapidPublic && vapidPrivate) {
  webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);
}

export async function savePushSubscription(subscription: {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}) {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) return { error: "Profile not found" };

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      profile_id: profile.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
    { onConflict: "profile_id,endpoint" }
  );

  if (error) return { error: error.message };
  return { success: true };
}

export async function sendAnnouncementPush(
  societyId: string,
  title: string,
  societySlug: string
) {
  if (!vapidPublic || !vapidPrivate) return;

  const admin = createAdminClient();

  const { data: members } = await admin
    .from("society_members")
    .select("profile_id")
    .eq("society_id", societyId)
    .eq("status", "approved");

  if (!members?.length) return;

  const profileIds = members.map((m) => m.profile_id);

  const { data: subscriptions } = await admin
    .from("push_subscriptions")
    .select("*")
    .in("profile_id", profileIds);

  if (!subscriptions?.length) return;

  const payload = JSON.stringify({
    title: "New Announcement",
    body: title,
    url: `/${societySlug}/announcements`,
  });

  await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        payload
      )
    )
  );
}
