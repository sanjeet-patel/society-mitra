import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/auth/logout-button";
import { Building2 } from "lucide-react";

export async function PlatformAdminHeader() {
  const profile = await getCurrentProfile();

  return (
    <header className="border-b border-palette-navy/10 bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center gap-3">
        <Link href="/admin" className="flex items-center gap-2 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-palette-navy">
            <Building2 className="h-4 w-4 text-palette-gold" />
          </div>
          <span className="font-bold text-lg text-palette-navy hidden sm:inline">Platform Admin</span>
        </Link>

        <nav className="flex items-center gap-1 ml-2">
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              Dashboard
            </Button>
          </Link>
          <Link href="/admin/societies">
            <Button variant="ghost" size="sm">
              Societies
            </Button>
          </Link>
          <Link href="/admin/categories">
            <Button variant="ghost" size="sm">
              Categories
            </Button>
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {profile?.full_name && (
            <span className="text-sm text-muted-foreground hidden md:inline truncate max-w-[160px]">
              {profile.full_name}
            </span>
          )}
          <Link href="/">
            <Button variant="outline" size="sm">
              Home
            </Button>
          </Link>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
