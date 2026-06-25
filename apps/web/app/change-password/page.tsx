import { redirect } from "next/navigation";
import { getCurrentUser, getCurrentProfile } from "@/lib/auth";
import { ChangePasswordForm } from "@/components/auth/change-password-form";
import { SessionBar } from "@/components/layout/session-bar";

export default async function ChangePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/change-password");

  const profile = await getCurrentProfile();
  const { redirect: redirectTo } = await searchParams;

  return (
    <div className="min-h-screen flex flex-col bg-palette-navy/[0.03]">
      <SessionBar userName={profile?.full_name} />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <ChangePasswordForm redirectTo={redirectTo || "/"} />
      </div>
    </div>
  );
}
