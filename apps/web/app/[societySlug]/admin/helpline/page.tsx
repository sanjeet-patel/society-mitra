import { notFound } from "next/navigation";
import { requireSocietyAdmin } from "@/lib/auth";
import { getEmergencyContacts } from "@/lib/actions/emergency";
import { HelplineManager } from "@/components/admin/helpline-manager";

export default async function AdminHelplinePage({
  params,
}: {
  params: Promise<{ societySlug: string }>;
}) {
  const { societySlug } = await params;
  const result = await requireSocietyAdmin(societySlug);
  if (result.error === "Society not found") notFound();
  if (result.error || !result.society) return null;

  const contacts = await getEmergencyContacts(societySlug);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Helpline &amp; emergency</h1>
        <p className="text-muted-foreground text-sm mt-1">{result.society.name}</p>
      </div>
      <HelplineManager
        societySlug={societySlug}
        contacts={contacts as Parameters<typeof HelplineManager>[0]["contacts"]}
      />
    </div>
  );
}
