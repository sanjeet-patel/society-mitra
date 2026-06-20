"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createAnnouncement } from "@/lib/actions/announcements";
import { ANNOUNCEMENT_CATEGORIES } from "@society-mitra/shared";

export function AnnouncementForm({ societySlug }: { societySlug: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");

    const result = await createAnnouncement(societySlug, formData);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.push(`/${societySlug}/announcements`);
    router.refresh();
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>New Announcement</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select name="category" defaultValue="general">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ANNOUNCEMENT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Message</Label>
            <Textarea id="body" name="body" rows={6} required />
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="isPinned" name="isPinned" />
            <Label htmlFor="isPinned">Pin this announcement</Label>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Publishing..." : "Publish Announcement"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
