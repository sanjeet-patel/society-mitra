"use client";

import Link from "next/link";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HomeHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-palette-navy/10 bg-background/85 backdrop-blur-md animate-header-enter">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-palette-navy">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-palette-navy transition-transform duration-300 hover:rotate-[-4deg] hover:scale-105">
            <Building2 className="h-5 w-5 text-palette-gold" />
          </div>
          Society Mitra
        </div>
        <div className="flex gap-2">
          <Link href="/login">
            <Button
              variant="outline"
              className="border-palette-navy/20 text-palette-navy transition-all duration-300 hover:bg-palette-navy/5 hover:scale-[1.02] active:scale-[0.98]"
            >
              Sign In
            </Button>
          </Link>
          <Link href="/admin/societies">
            <Button className="shadow-md shadow-palette-navy/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]">
              Platform Admin
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
