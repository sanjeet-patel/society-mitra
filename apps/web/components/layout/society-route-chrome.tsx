"use client";

import { usePathname } from "next/navigation";

/** Hides society member nav on admin console routes (admin layout provides its own shell). */
export function SocietyRouteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminConsole = pathname.includes("/admin");

  if (isAdminConsole) return null;
  return <>{children}</>;
}
