import { redirect } from "next/navigation";
import { getCurrentUser, requirePlatformAdmin } from "@/lib/auth";
import { getSessionActor } from "@/lib/auth/session-actor";
import { AdminShell } from "@/components/layout/admin-shell";
import { getPlatformPendingMemberCount } from "@/lib/actions/platform";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/admin");

  const { error } = await requirePlatformAdmin();
  if (error) {
    return <div className="min-h-screen bg-muted/30">{children}</div>;
  }

  const [actor, pendingCount] = await Promise.all([
    getSessionActor(),
    getPlatformPendingMemberCount(),
  ]);

  if (!actor) redirect("/login?redirect=/admin");

  return (
    <AdminShell
      title="Society Mitra"
      subtitle="Platform Console"
      actor={actor}
      homeHref="/"
      navItems={[
        { href: "/admin", label: "Dashboard", icon: "dashboard", exact: true },
        { href: "/admin/societies", label: "Societies", icon: "building" },
        {
          href: "/admin/members",
          label: "User management",
          icon: "users",
          badge: pendingCount,
        },
        { href: "/admin/categories", label: "Categories", icon: "folder" },
      ]}
    >
      {children}
    </AdminShell>
  );
}
