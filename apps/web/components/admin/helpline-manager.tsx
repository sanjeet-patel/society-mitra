"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  createEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
} from "@/lib/actions/emergency";
import { editFormKey } from "@/lib/form-key";

interface Contact {
  id: string;
  name: string;
  phone: string;
  contact_type: string;
  role_label: string | null;
  whatsapp: string | null;
  sort_order: number;
}

export function HelplineManager({
  societySlug,
  contacts,
}: {
  societySlug: string;
  contacts: Contact[];
}) {
  const router = useRouter();

  async function handleCreate(formData: FormData) {
    await createEmergencyContact(societySlug, formData);
    router.refresh();
  }

  async function handleUpdate(id: string, formData: FormData) {
    await updateEmergencyContact(societySlug, id, formData);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this contact?")) return;
    await deleteEmergencyContact(societySlug, id);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {contacts.map((c) => (
        <Card key={c.id}>
          <CardContent className="pt-4">
            <form
              key={editFormKey(
                c.id,
                c.name,
                c.phone,
                c.contact_type,
                c.role_label,
                c.whatsapp,
                c.sort_order
              )}
              action={(fd) => handleUpdate(c.id, fd)}
              className="grid sm:grid-cols-3 gap-2 items-end"
            >
              <Input name="name" defaultValue={c.name} required className="h-8" />
              <Input name="phone" defaultValue={c.phone} required className="h-8" />
              <select name="contactType" defaultValue={c.contact_type} className="h-8 border rounded-md px-2 text-sm">
                <option value="emergency">Emergency</option>
                <option value="security">Security</option>
                <option value="maintenance">Maintenance</option>
                <option value="medical">Medical</option>
                <option value="other">Other</option>
              </select>
              <Input name="roleLabel" defaultValue={c.role_label ?? ""} placeholder="Role" className="h-8" />
              <Input name="whatsapp" defaultValue={c.whatsapp ?? ""} placeholder="WhatsApp" className="h-8" />
              <Input name="sortOrder" type="number" defaultValue={c.sort_order} className="h-8 w-20" />
              <div className="flex gap-2 sm:col-span-3">
                <Button type="submit" size="sm" variant="outline">
                  Save
                </Button>
                <Button type="button" size="sm" variant="destructive" onClick={() => handleDelete(c.id)}>
                  Delete
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardContent className="pt-4">
          <form action={handleCreate} className="grid sm:grid-cols-3 gap-2 items-end">
            <div className="space-y-1">
              <Label className="text-xs">Name</Label>
              <Input name="name" required className="h-8" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Phone</Label>
              <Input name="phone" required className="h-8" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Type</Label>
              <select name="contactType" defaultValue="emergency" className="h-8 border rounded-md px-2 text-sm w-full">
                <option value="emergency">Emergency</option>
                <option value="security">Security</option>
                <option value="maintenance">Maintenance</option>
                <option value="medical">Medical</option>
                <option value="other">Other</option>
              </select>
            </div>
            <Input name="roleLabel" placeholder="Role label" className="h-8" />
            <Input name="sortOrder" type="number" defaultValue={10} className="h-8 w-20" />
            <Button type="submit" size="sm">
              Add contact
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
