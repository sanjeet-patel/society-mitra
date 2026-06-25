import { redirect, notFound } from "next/navigation";
import { getSocietyBySlug, getCurrentProfile } from "@/lib/auth";

export default async function JoinPage({
  params,
}: {
  params: Promise<{ societySlug: string }>;
}) {
  const { societySlug } = await params;
  const society = await getSocietyBySlug(societySlug);
  if (!society) notFound();

  const profile = await getCurrentProfile();
  if (!profile) redirect(`/login?redirect=/${societySlug}/dashboard`);

  redirect(`/${societySlug}/dashboard`);
}
