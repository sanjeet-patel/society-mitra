import { PlatformAdminHeader } from "@/components/layout/platform-admin-header";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-palette-navy/[0.03] flex flex-col">
      <PlatformAdminHeader />
      <div className="flex-1">{children}</div>
    </div>
  );
}
