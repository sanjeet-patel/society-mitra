// Supabase Edge Function stub for announcement push notifications.
// Deploy with: supabase functions deploy send-announcement-push
// Trigger via database webhook on announcements INSERT.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const VAPID_PUBLIC = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE = Deno.env.get("VAPID_PRIVATE_KEY")!;
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") ?? "mailto:admin@societymitra.info";

Deno.serve(async (req) => {
  const { society_id, title, slug } = await req.json();

  // In production, fetch push_subscriptions for society members and send via web-push.
  // MVP uses Next.js server action in lib/push.ts instead.

  return new Response(
    JSON.stringify({ ok: true, society_id, title, slug, vapidConfigured: !!VAPID_PUBLIC }),
    { headers: { "Content-Type": "application/json" } }
  );
});
