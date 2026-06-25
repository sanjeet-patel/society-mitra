"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createGlobalCategory, createSocietyCategory, updateCategory, deleteCategory } from "@/lib/actions/categories";

interface Category {
  id: string;
  slug: string;
  label: string;
  sort_order: number;
  society_id: string | null;
}

export function CategoryManager({
  scope,
  societySlug,
  categories,
  globalCategories = [],
}: {
  scope: "platform" | "society";
  societySlug?: string;
  categories: Category[];
  globalCategories?: Category[];
}) {
  const router = useRouter();

  async function handleCreate(formData: FormData) {
    const result =
      scope === "platform"
        ? await createGlobalCategory(formData)
        : await createSocietyCategory(societySlug!, formData);

    if (!result.error) router.refresh();
  }

  async function handleUpdate(categoryId: string, formData: FormData) {
    await updateCategory(scope === "platform" ? null : societySlug!, categoryId, formData);
    router.refresh();
  }

  async function handleDelete(categoryId: string) {
    if (!confirm("Deactivate this category?")) return;
    await deleteCategory(scope === "platform" ? null : societySlug!, categoryId);
    router.refresh();
  }

  const list = categories;

  return (
    <div className="space-y-6">
      {scope === "society" && globalCategories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Global categories (read-only)</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {globalCategories.map((cat) => (
              <span key={cat.id} className="text-sm border rounded px-2 py-1">
                {cat.label}
              </span>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {scope === "platform" ? "Global categories" : "Society-only categories"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {list.map((cat) => (
            <form
              key={cat.id}
              action={(fd) => handleUpdate(cat.id, fd)}
              className="grid sm:grid-cols-4 gap-2 items-end border-b pb-3"
            >
              <div className="space-y-1">
                <Label className="text-xs">Slug</Label>
                <Input name="slug" defaultValue={cat.slug} required className="h-8" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Label</Label>
                <Input name="label" defaultValue={cat.label} required className="h-8" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Sort</Label>
                <Input
                  name="sortOrder"
                  type="number"
                  defaultValue={cat.sort_order}
                  className="h-8 w-20"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm" variant="outline">
                  Save
                </Button>
                <Button type="button" size="sm" variant="destructive" onClick={() => handleDelete(cat.id)}>
                  Delete
                </Button>
              </div>
            </form>
          ))}
          {list.length === 0 && (
            <p className="text-sm text-muted-foreground">No custom categories yet.</p>
          )}

          <form action={handleCreate} className="grid sm:grid-cols-3 gap-3 items-end pt-2">
            <div className="space-y-1">
              <Label className="text-xs">Slug</Label>
              <Input name="slug" placeholder="bakery" required />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Label</Label>
              <Input name="label" placeholder="Bakery" required />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Sort order</Label>
              <Input name="sortOrder" type="number" defaultValue={50} className="w-24" />
            </div>
            <Button type="submit" size="sm" className="sm:col-span-3 w-fit">
              Add category
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
