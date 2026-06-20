import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Home,
  Users,
  Megaphone,
  Phone,
  Wrench,
  Settings,
  LogOut,
  Shield,
} from "lucide-react";
import { signOut } from "@/lib/actions/auth";
import { isAdminRole } from "@/lib/auth";
import type { MemberRole } from "@society-mitra/shared";

interface SocietyNavProps {
  societySlug: string;
  societyName: string;
  role?: MemberRole;
  isPlatformAdmin?: boolean;
}

const navItems = [
  { href: "dashboard", label: "Dashboard", icon: Home },
  { href: "directory", label: "Directory", icon: Users },
  { href: "announcements", label: "Announcements", icon: Megaphone },
  { href: "emergency", label: "Emergency", icon: Phone },
  { href: "services", label: "Services", icon: Wrench },
];

export function SocietyNav({
  societySlug,
  societyName,
  role,
  isPlatformAdmin,
}: SocietyNavProps) {
  const isAdmin = role && isAdminRole(role);

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/${societySlug}/dashboard`} className="font-bold text-lg">
              {societyName}
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={`/${societySlug}/${href}`}>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Icon className="h-4 w-4" />
                  {label}
                </Button>
              </Link>
            ))}
            {isAdmin && (
              <Link href={`/${societySlug}/admin/members`}>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Shield className="h-4 w-4" />
                  Admin
                </Button>
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <Link href={`/${societySlug}/profile`}>
              <Button variant="ghost" size="sm" className="gap-2">
                <Settings className="h-4 w-4" />
                Profile
              </Button>
            </Link>
            {isPlatformAdmin && (
              <Link href="/admin/societies">
                <Button variant="outline" size="sm">
                  Platform
                </Button>
              </Link>
            )}
            <form action={signOut}>
              <Button variant="ghost" size="sm" type="submit" className="gap-2">
                <LogOut className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>

        <nav className="md:hidden flex overflow-x-auto gap-1 pb-2 -mx-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={`/${societySlug}/${href}`}>
              <Button variant="ghost" size="sm" className="gap-1 shrink-0 text-xs">
                <Icon className="h-3 w-3" />
                {label}
              </Button>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
