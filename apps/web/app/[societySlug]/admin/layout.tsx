import { redirect, notFound } from "next/navigation";
import { requireSocietyAdmin, getCurrentUser } from "@/lib/auth";
import { getSessionActor } from "@/lib/auth/session-actor";
import { AdminShell } from "@/components/layout/admin-shell";
import { getPendingMembers } from "@/lib/actions/members";
import { AccessDenied } from "@/components/auth/access-denied";

export default async function SocietyAdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ societySlug: string }>;
}) {
  const { societySlug } = await params;
  const user = await getCurrentUser();
  const result = await requireSocietyAdmin(societySlug);

  if (result.error === "Society not found") notFound();
  if (result.error === "Unauthorized") redirect(`/login?redirect=/${societySlug}/admin`);
  if (result.error === "Not a member" || result.error === "Forbidden") {
    if (!user) redirect(`/login?redirect=/${societySlug}/admin`);
    return (
      <AccessDenied
        message={
          result.error === "Forbidden"
            ? "This console is for society admins only. Contact your platform admin if you need access."
            : "Your account is not linked to this society. Contact your society admin for access."
        }
        backHref={`/${societySlug}/dashboard`}
        backLabel="Back to dashboard"
      />
    );
  }

  const society = result.society!;
  const [actor, pendingMembers] = await Promise.all([
    getSessionActor(society.id),
    getPendingMembers(societySlug),
  ]);

  if (!actor) redirect(`/login?redirect=/${societySlug}/admin`);

  const base = `/${societySlug}/admin`;

  return (
    <AdminShell
      title={society.name}
      subtitle="Society Admin"
      actor={actor}
      homeHref={`/${societySlug}/dashboard`}
      navItems={[
        { href: base, label: "Dashboard", icon: "dashboard", exact: true },
        {
          href: `${base}/members`,
          label: "User management",
          icon: "users",
          badge: pendingMembers.length,
        },
        { href: `${base}/categories`, label: "Categories", icon: "folder" },
        { href: `${base}/vendors`, label: "Vendors", icon: "wrench" },
        { href: `${base}/classifieds`, label: "Classifieds", icon: "tag" },
        { href: `${base}/helpline`, label: "Helpline", icon: "phone" },
        { href: `${base}/announcements`, label: "Announcements", icon: "megaphone" },
      ]}
    >
      {children}
    </AdminShell>
  );
}
