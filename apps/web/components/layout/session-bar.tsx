import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";
import { Button } from "@/components/ui/button";

export function SessionBar({
  userName,
  roleLabel,
  homeHref = "/",
}: {
  userName?: string | null;
  roleLabel?: string | null;
  homeHref?: string;
}) {
  return (
    <header className="border-b border-palette-navy/10 bg-background/95 backdrop-blur sticky top-0 z-50">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link href={homeHref}>
            <Button variant="ghost" size="sm">
              Home
            </Button>
          </Link>
          {userName && (
            <div className="min-w-0 hidden sm:block">
              <p className="text-sm font-medium truncate">{userName}</p>
              {roleLabel && (
                <p className="text-xs text-muted-foreground truncate">{roleLabel}</p>
              )}
            </div>
          )}
        </div>
        <LogoutButton />
      </div>
    </header>
  );
}
