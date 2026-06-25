"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MEMBER_TAG_PRESETS } from "@society-mitra/shared";
import { X } from "lucide-react";

export function MemberTagsEditor({
  name = "tags",
  defaultTags = [],
}: {
  name?: string;
  defaultTags?: string[];
}) {
  const [tags, setTags] = useState<string[]>(defaultTags);
  const [customTag, setCustomTag] = useState("");

  function addTag(tag: string) {
    const normalized = tag.trim();
    if (!normalized || normalized.length > 50) return;
    if (tags.length >= 5) return;
    if (tags.some((existing) => existing.toLowerCase() === normalized.toLowerCase())) return;
    setTags((current) => [...current, normalized]);
    setCustomTag("");
  }

  function removeTag(tag: string) {
    setTags((current) =>
      current.filter((existing) => existing.toLowerCase() !== tag.toLowerCase())
    );
  }

  function togglePreset(preset: string) {
    const selected = tags.some(
      (tag) => tag.toLowerCase() === preset.toLowerCase()
    );
    if (selected) {
      removeTag(preset);
    } else {
      addTag(preset);
    }
  }

  return (
    <div className="space-y-2 sm:col-span-2">
      <Label className="text-xs">Tags (President, Secretary, etc.)</Label>
      <input type="hidden" name={name} value={JSON.stringify(tags)} />
      <div className="flex flex-wrap gap-1.5">
        {MEMBER_TAG_PRESETS.map((preset) => {
          const selected = tags.some(
            (tag) => tag.toLowerCase() === preset.toLowerCase()
          );
          return (
            <Button
              key={preset}
              type="button"
              size="sm"
              variant={selected ? "default" : "outline"}
              className="h-7 text-xs"
              disabled={!selected && tags.length >= 5}
              onClick={() => togglePreset(preset)}
            >
              {preset}
            </Button>
          );
        })}
      </div>
      <div className="flex gap-2">
        <Input
          value={customTag}
          onChange={(event) => setCustomTag(event.target.value)}
          placeholder="Custom tag"
          className="h-8"
          maxLength={50}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addTag(customTag);
            }
          }}
        />
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="h-8"
          disabled={!customTag.trim() || tags.length >= 5}
          onClick={() => addTag(customTag)}
        >
          Add
        </Button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1 pr-1">
              {tag}
              <button
                type="button"
                className="rounded-full p-0.5 hover:bg-muted"
                aria-label={`Remove ${tag}`}
                onClick={() => removeTag(tag)}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
