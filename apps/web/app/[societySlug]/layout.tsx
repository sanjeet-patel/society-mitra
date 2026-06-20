import { notFound } from "next/navigation";
import {
  getSocietyBySlug,
  getCurrentProfile,
  getMembership,
} from "@/lib/auth";
import { SocietyNav } from "@/components/layout/society-nav";

export default async function SocietyLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ societySlug: string }>;
}) {
  const { societySlug } = await params;

  const society = await getSocietyBySlug(societySlug);
  if (!society) notFound();

  const profile = await getCurrentProfile();
  let membership = null;
  if (profile) {
    membership = await getMembership(society.id, profile.id);
  }

  return (
    <div className="min-h-screen flex flex-col">
      {membership?.status === "approved" && (
        <SocietyNav
          societySlug={societySlug}
          societyName={society.name}
          role={membership.role}
          isPlatformAdmin={profile?.is_platform_admin}
        />
      )}
      <main className="flex-1">{children}</main>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ societySlug: string }>;
}) {
  const { societySlug } = await params;
  const society = await getSocietyBySlug(societySlug);
  return {
    title: society?.name ?? "Society",
  };
}
