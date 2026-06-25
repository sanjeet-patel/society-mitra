"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function SocietyAdminHeader({
  societySlug,
  societyName,
  title,
}: {
  societySlug: string;
  societyName: string;
  title: string;
}) {
  return (
    <div className="mb-6">
      <Link href={`/${societySlug}/admin`}>
        <Button variant="ghost" size="sm" className="gap-2 mb-2 -ml-2">
          <ArrowLeft className="h-4 w-4" />
          Admin Console
        </Button>
      </Link>
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-muted-foreground">{societyName}</p>
    </div>
  );
}
