import { redirect, notFound } from "next/navigation";
import { requireMembership, requireSocietyAdmin, isAdminRole } from "@/lib/auth";
import { getEmergencyContacts, deleteEmergencyContact } from "@/lib/actions/emergency";
import { EmergencyContactForm } from "@/components/emergency/emergency-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, MessageCircle, Trash2 } from "lucide-react";

export default async function EmergencyPage({
  params,
}: {
  params: Promise<{ societySlug: string }>;
}) {
  const { societySlug } = await params;
  const result = await requireMembership(societySlug);

  if (result.error === "Society not found") notFound();
  if (result.error === "Unauthorized") redirect(`/login?redirect=/${societySlug}/emergency`);
  if (result.error === "Not a member") redirect(`/${societySlug}/join`);

  const isAdmin = result.membership && isAdminRole(result.membership.role);
  const contacts = await getEmergencyContacts(societySlug);

  const external = contacts.filter((c) => c.contact_type === "external");
  const society = contacts.filter((c) => c.contact_type === "society");

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Emergency Directory</h1>
      <p className="text-muted-foreground mb-6">
        One-tap access to emergency and society contacts
      </p>

      {isAdmin && (
        <div className="mb-8">
          <EmergencyContactForm societySlug={societySlug} />
        </div>
      )}

      <ContactSection
        title="Emergency Services"
        contacts={external}
        societySlug={societySlug}
        isAdmin={!!isAdmin}
      />

      <ContactSection
        title="Society Contacts"
        contacts={society}
        societySlug={societySlug}
        isAdmin={!!isAdmin}
        className="mt-8"
      />
    </div>
  );
}

function ContactSection({
  title,
  contacts,
  societySlug,
  isAdmin,
  className,
}: {
  title: string;
  contacts: Awaited<ReturnType<typeof getEmergencyContacts>>;
  societySlug: string;
  isAdmin: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {contacts.map((contact) => (
          <Card key={contact.id}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{contact.name}</p>
                  {contact.role_label && (
                    <p className="text-xs text-muted-foreground">{contact.role_label}</p>
                  )}
                  <p className="text-sm mt-1">{contact.phone}</p>
                </div>
                {isAdmin && (
                  <form
                    action={async () => {
                      "use server";
                      await deleteEmergencyContact(societySlug, contact.id);
                    }}
                  >
                    <Button variant="ghost" size="sm" type="submit">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </form>
                )}
              </div>
              <div className="flex gap-2 mt-3">
                <a href={`tel:${contact.phone}`}>
                  <Button size="sm" className="gap-1">
                    <Phone className="h-3 w-3" />
                    Call
                  </Button>
                </a>
                {(contact.whatsapp || contact.phone) && (
                  <a
                    href={`https://wa.me/${(contact.whatsapp || contact.phone).replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="sm" variant="outline" className="gap-1">
                      <MessageCircle className="h-3 w-3" />
                      WhatsApp
                    </Button>
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {contacts.length === 0 && (
        <p className="text-sm text-muted-foreground">No contacts added yet.</p>
      )}
    </div>
  );
}
