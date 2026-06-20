import { redirect, notFound } from "next/navigation";
import { getSocietyBySlug, getCurrentProfile, getMembership } from "@/lib/auth";
import { JoinSocietyForm } from "@/components/members/join-form";

export default async function JoinPage({
  params,
}: {
  params: Promise<{ societySlug: string }>;
}) {
  const { societySlug } = await params;
  const society = await getSocietyBySlug(societySlug);
  if (!society) notFound();

  const profile = await getCurrentProfile();
  if (!profile) redirect(`/login?redirect=/${societySlug}/join`);

  const membership = await getMembership(society.id, profile.id);
  if (membership?.status === "approved") {
    redirect(`/${societySlug}/dashboard`);
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <JoinSocietyForm societySlug={societySlug} />
    </div>
  );
}
