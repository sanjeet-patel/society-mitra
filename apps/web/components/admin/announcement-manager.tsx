"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "@/lib/actions/announcements";

interface Announcement {
  id: string;
  title: string;
  body: string;
  category: string;
  is_pinned: boolean;
  profiles: { full_name: string } | null;
}

export function AnnouncementManager({
  societySlug,
  announcements,
}: {
  societySlug: string;
  announcements: Announcement[];
}) {
  const router = useRouter();

  async function handleCreate(formData: FormData) {
    await createAnnouncement(societySlug, formData);
    router.refresh();
  }

  async function handleUpdate(id: string, formData: FormData) {
    await updateAnnouncement(societySlug, id, formData);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this announcement?")) return;
    await deleteAnnouncement(societySlug, id);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {announcements.map((a) => (
        <Card key={a.id}>
          <CardContent className="pt-4 space-y-2">
            <div className="flex items-center gap-2">
              <p className="font-medium">{a.title}</p>
              {a.is_pinned && <Badge>Pinned</Badge>}
            </div>
            <form action={(fd) => handleUpdate(a.id, fd)} className="space-y-2">
              <Input name="title" defaultValue={a.title} required className="h-8" />
              <Textarea name="body" defaultValue={a.body} required rows={3} />
              <div className="flex flex-wrap gap-2 items-center">
                <Input name="category" defaultValue={a.category} className="h-8 w-40" />
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="isPinned" defaultChecked={a.is_pinned} />
                  Pin
                </label>
                <Button type="submit" size="sm" variant="outline">
                  Save
                </Button>
                <Button type="button" size="sm" variant="destructive" onClick={() => handleDelete(a.id)}>
                  Delete
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardContent className="pt-4">
          <form action={handleCreate} className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Title</Label>
              <Input name="title" required />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Body</Label>
              <Textarea name="body" required rows={3} />
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              <Input name="category" defaultValue="general" className="h-8 w-40" />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="isPinned" />
                Pin to top
              </label>
              <Button type="submit" size="sm">
                Post announcement
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
