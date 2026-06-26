import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSocietyAdmin } from "@/lib/auth";
import { getPendingMembers } from "@/lib/actions/members";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, FolderOpen, Wrench, Tag, Phone, Megaphone } from "lucide-react";

const sections = [
  { href: "members", label: "User management", icon: Users, desc: "Members, approvals, roles" },
  { href: "categories", label: "Categories", icon: FolderOpen, desc: "Service category CRUD" },
  { href: "vendors", label: "Vendors", icon: Wrench, desc: "Verify service providers" },
  { href: "classifieds", label: "Classifieds", icon: Tag, desc: "Moderate buy/sell ads" },
  { href: "helpline", label: "Helpline", icon: Phone, desc: "Emergency contacts" },
  { href: "announcements", label: "Announcements", icon: Megaphone, desc: "Society notices" },
];

export default async function SocietyAdminHubPage({
  params,
}: {
  params: Promise<{ societySlug: string }>;
}) {
  const { societySlug } = await params;
  const result = await requireSocietyAdmin(societySlug);
  if (result.error === "Society not found") notFound();
  if (result.error || !result.society) return null;

  const pendingMembers = await getPendingMembers(societySlug);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">{result.society.name}</p>
      </div>

      {pendingMembers.length > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="py-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium">{pendingMembers.length} pending join request(s)</p>
              <p className="text-sm text-muted-foreground">Review and approve new members</p>
            </div>
            <Link href={`/${societySlug}/admin/members`}>
              <Button>Review requests</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {sections.map(({ href, label, icon: Icon, desc }) => (
          <Link key={href} href={`/${societySlug}/admin/${href}`}>
            <Card className="h-full hover:border-primary/40 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {label}
                  {href === "members" && pendingMembers.length > 0 && (
                    <Badge variant="secondary">{pendingMembers.length}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
