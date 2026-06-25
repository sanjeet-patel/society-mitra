import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { requireSocietyAdmin, getCurrentUser } from "@/lib/auth";
import { AccessDenied } from "@/components/auth/access-denied";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Tag, Wrench, Megaphone, Phone, FolderOpen } from "lucide-react";

const sections = [
  { href: "members", label: "Members", icon: Users, desc: "Provision residents, reset passwords" },
  { href: "categories", label: "Categories", icon: FolderOpen, desc: "Service category CRUD" },
  { href: "vendors", label: "Vendors", icon: Wrench, desc: "Verify and manage service providers" },
  { href: "classifieds", label: "Classifieds", icon: Tag, desc: "Moderate buy/sell ads" },
  { href: "helpline", label: "Helpline", icon: Phone, desc: "Emergency contacts CRUD" },
  { href: "announcements", label: "Announcements", icon: Megaphone, desc: "Society notices CRUD" },
];

export default async function SocietyAdminHubPage({
  params,
}: {
  params: Promise<{ societySlug: string }>;
}) {
  const { societySlug } = await params;
  const user = await getCurrentUser();
  const result = await requireSocietyAdmin(societySlug);

  if (result.error === "Society not found") notFound();
  if (result.error === "Unauthorized") redirect(`/login?redirect=/${societySlug}/admin`);
  if (result.error === "Not a member" || result.error === "Forbidden") {
    if (!user) redirect(`/login?redirect=/${societySlug}/admin`);
    return (
      <AccessDenied
        message={
          result.error === "Forbidden"
            ? "This console is for society admins only. Contact your platform admin if you need access."
            : "Your account is not linked to this society. Contact your society admin for access."
        }
        backHref={`/${societySlug}/dashboard`}
        backLabel="Back to dashboard"
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Society Admin Console</h1>
      <p className="text-muted-foreground mb-8">{result.society!.name}</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map(({ href, label, icon: Icon, desc }) => (
          <Link key={href} href={`/${societySlug}/admin/${href}`}>
            <Card className="h-full hover:border-primary/40 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {label}
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
