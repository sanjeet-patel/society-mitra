"use server";

import { createClient } from "@/lib/supabase/server";
import { requireSocietyAdmin, requireMembership } from "@/lib/auth";
import { announcementSchema } from "@society-mitra/shared";
import { revalidatePath } from "next/cache";
import { sendAnnouncementPush } from "@/lib/push";

export async function createAnnouncement(societySlug: string, formData: FormData) {
  const { error: authError, society, profile } = await requireSocietyAdmin(societySlug);
  if (authError || !society || !profile) return { error: authError || "Not found" };

  const parsed = announcementSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
    category: formData.get("category"),
    isPinned: formData.get("isPinned") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("announcements")
    .insert({
      society_id: society.id,
      author_id: profile.id,
      title: parsed.data.title,
      body: parsed.data.body,
      category: parsed.data.category,
      is_pinned: parsed.data.isPinned,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  try {
    await sendAnnouncementPush(society.id, parsed.data.title, societySlug);
  } catch {
    // Push is best-effort
  }

  revalidatePath(`/${societySlug}/announcements`);
  revalidatePath(`/${societySlug}/dashboard`);
  return { success: true, announcement: data };
}

export async function deleteAnnouncement(societySlug: string, id: string) {
  const { error: authError, society } = await requireSocietyAdmin(societySlug);
  if (authError || !society) return { error: authError || "Not found" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("announcements")
    .delete()
    .eq("id", id)
    .eq("society_id", society.id);

  if (error) return { error: error.message };

  revalidatePath(`/${societySlug}/announcements`);
  return { success: true };
}

export async function getAnnouncements(societySlug: string) {
  const { error, society } = await requireMembership(societySlug);
  if (error || !society) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("announcements")
    .select("*, profiles(full_name)")
    .eq("society_id", society.id)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });

  return data ?? [];
}
