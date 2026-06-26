import { notFound, redirect } from "next/navigation";
import {
  getSocietyBySlug,
  getMembership,
  getCurrentUser,
} from "@/lib/auth";
import { SocietyNav } from "@/components/layout/society-nav";
import { SessionBar } from "@/components/layout/session-bar";
import { SocietyRouteChrome } from "@/components/layout/society-route-chrome";
import { getSessionActor } from "@/lib/auth/session-actor";

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

  const user = await getCurrentUser();
  if (user?.user_metadata?.must_change_password) {
    redirect(`/change-password?redirect=/${societySlug}/dashboard`);
  }

  const actor = user ? await getSessionActor(society.id) : null;
  let membership = null;
  if (actor) {
    membership = await getMembership(society.id, actor.id);
  }

  const displayName = actor?.displayName ?? null;
  const isPlatformAdmin = actor?.isPlatformAdmin ?? false;

  return (
    <div className="min-h-screen flex flex-col">
      <SocietyRouteChrome>
        {membership?.status === "approved" ? (
          <SocietyNav
            societySlug={societySlug}
            societyName={society.name}
            role={membership.role}
            isPlatformAdmin={isPlatformAdmin}
          />
        ) : user ? (
          <SessionBar
            userName={displayName}
            roleLabel={actor?.roleLabel}
            homeHref={`/${societySlug}`}
          />
        ) : null}
      </SocietyRouteChrome>
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
