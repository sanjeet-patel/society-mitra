import { redirect, notFound } from "next/navigation";
import { requireSocietyAdmin } from "@/lib/auth";
import { getEmergencyContacts } from "@/lib/actions/emergency";
import { HelplineManager } from "@/components/admin/helpline-manager";
import { SocietyAdminHeader } from "@/components/admin/society-admin-header";

export default async function AdminHelplinePage({
  params,
}: {
  params: Promise<{ societySlug: string }>;
}) {
  const { societySlug } = await params;
  const result = await requireSocietyAdmin(societySlug);

  if (result.error === "Society not found") notFound();
  if (result.error === "Unauthorized") redirect(`/login?redirect=/${societySlug}/admin/helpline`);
  if (result.error === "Forbidden") redirect(`/${societySlug}/dashboard`);

  const contacts = await getEmergencyContacts(societySlug);

  return (
    <div className="container mx-auto px-4 py-8">
      <SocietyAdminHeader
        societySlug={societySlug}
        societyName={result.society!.name}
        title="Helpline & emergency"
      />
      <HelplineManager
        societySlug={societySlug}
        contacts={contacts as Parameters<typeof HelplineManager>[0]["contacts"]}
      />
    </div>
  );
}
