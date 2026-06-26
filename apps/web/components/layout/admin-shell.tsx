"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/auth/logout-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Home, Menu, X, LayoutDashboard, Users, FolderOpen, Wrench, Tag, Phone, Megaphone } from "lucide-react";
import { useState } from "react";
import type { AdminNavIconName, AdminNavItem } from "@/lib/admin-nav";

const NAV_ICONS: Record<AdminNavIconName, React.ComponentType<{ className?: string }>> = {
  dashboard: LayoutDashboard,
  building: Building2,
  users: Users,
  folder: FolderOpen,
  wrench: Wrench,
  tag: Tag,
  phone: Phone,
  megaphone: Megaphone,
};

export type { AdminNavItem };

export function AdminShell({
  title,
  subtitle,
  navItems,
  actor,
  homeHref = "/",
  children,
}: {
  title: string;
  subtitle?: string;
  navItems: AdminNavItem[];
  actor: { displayName: string; phone: string | null; roleLabel: string };
  homeHref?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(item: AdminNavItem) {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 px-5 py-5">
        <Link href={navItems[0]?.href ?? homeHref} className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Building2 className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-white">{title}</p>
            {subtitle && (
              <p className="truncate text-xs text-zinc-400">{subtitle}</p>
            )}
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const Icon = NAV_ICONS[item.icon];
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-white/10 text-white"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge != null && item.badge > 0 && (
                <Badge className="h-5 min-w-5 justify-center bg-primary px-1.5 text-[10px] text-primary-foreground">
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-4 py-4 space-y-3">
        <div className="rounded-lg bg-white/5 px-3 py-3">
          <p className="truncate text-sm font-medium text-white">{actor.displayName}</p>
          <p className="text-xs text-zinc-400">{actor.roleLabel}</p>
          {actor.phone && (
            <p className="mt-1 truncate text-xs text-zinc-500">{actor.phone}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Link href={homeHref} className="flex-1">
            <Button
              variant="outline"
              size="sm"
              className="w-full border-white/15 bg-transparent text-zinc-300 hover:bg-white/5 hover:text-white"
            >
              <Home className="h-3.5 w-3.5" />
              Home
            </Button>
          </Link>
          <LogoutButton
            variant="outline"
            size="sm"
            className="flex-1 border-white/15 bg-transparent text-zinc-300 hover:bg-white/5 hover:text-white"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="hidden w-64 shrink-0 bg-zinc-950 lg:flex lg:flex-col">
        {sidebar}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative flex h-full w-72 flex-col bg-zinc-950 shadow-xl">
            <button
              type="button"
              className="absolute right-3 top-3 rounded-lg p-2 text-zinc-400 hover:bg-white/5 hover:text-white"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-3 border-b bg-background px-4 lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{title}</p>
            <p className="truncate text-xs text-muted-foreground">{actor.roleLabel}</p>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
