"use client";

import Link from "next/link";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/auth/logout-button";

type HomeHeaderProps = {
  isLoggedIn?: boolean;
  userName?: string | null;
  isPlatformAdmin?: boolean;
};

export function HomeHeader({ isLoggedIn, userName, isPlatformAdmin }: HomeHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#001f33]/40 backdrop-blur-lg animate-header-enter">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-white min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-palette-navy shadow-md shadow-black/30 transition-transform duration-300 hover:rotate-[-4deg] hover:scale-105">
            <Building2 className="h-5 w-5 text-palette-gold" />
          </div>
          <span className="truncate">Society Mitra</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isLoggedIn ? (
            <>
              {userName && (
                <span className="text-sm text-white/70 hidden md:inline truncate max-w-[140px]">
                  {userName}
                </span>
              )}
              {isPlatformAdmin && (
                <Link href="/admin">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/20 bg-white/5 text-white backdrop-blur-sm hover:bg-white/10"
                  >
                    Platform
                  </Button>
                </Link>
              )}
              <LogoutButton
                variant="outline"
                className="border-white/20 bg-white/5 text-white backdrop-blur-sm hover:bg-white/10 hover:text-white"
              />
            </>
          ) : (
            <>
              <Link href="/login">
                <Button
                  variant="outline"
                  className="border-white/20 bg-white/5 text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/login?redirect=/admin">
                <Button className="bg-white text-palette-navy shadow-md shadow-black/30 transition-all duration-300 hover:scale-[1.02] hover:bg-white/90 hover:shadow-lg active:scale-[0.98]">
                  Platform Admin
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
