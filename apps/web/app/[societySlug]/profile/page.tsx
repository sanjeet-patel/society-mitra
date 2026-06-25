import { redirect, notFound } from "next/navigation";
import { requireMembership } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/profile/profile-form";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ societySlug: string }>;
}) {
  const { societySlug } = await params;
  const result = await requireMembership(societySlug);

  if (result.error === "Society not found") notFound();
  if (result.error === "Unauthorized") redirect(`/login?redirect=/${societySlug}/profile`);
  if (result.error === "Not a member") redirect(`/login?redirect=/${societySlug}/dashboard`);

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*, family_members(*), vehicles(*)")
    .eq("id", result.profile!.id)
    .single();

  if (!profile) notFound();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      <ProfileForm
        societySlug={societySlug}
        profile={profile as Parameters<typeof ProfileForm>[0]["profile"]}
      />
    </div>
  );
}
