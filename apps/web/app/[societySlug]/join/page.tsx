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
  if (membership?.status === "pending") {
    return (
      <div className="container mx-auto px-4 py-12 max-w-lg text-center space-y-4">
        <h1 className="text-2xl font-bold">Request pending</h1>
        <p className="text-muted-foreground">
          Your request to join {society.name} is awaiting admin approval. You will get access once
          approved.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">Join {society.name}</h1>
        <p className="text-muted-foreground mt-2">
          Submit a request — a society admin will review and approve your membership.
        </p>
      </div>
      <JoinSocietyForm societySlug={societySlug} defaultFullName={profile.full_name} defaultPhone={profile.phone} />
    </div>
  );
}
