import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogoutButton } from "@/components/auth/logout-button";

export function AccessDenied({
  title = "Access denied",
  message,
  backHref = "/",
  backLabel = "Go home",
  showLogout = true,
}: {
  title?: string;
  message: string;
  backHref?: string;
  backLabel?: string;
  showLogout?: boolean;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-palette-navy/[0.03]">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{message}</p>
          <div className="flex flex-wrap gap-2">
            <Link href={backHref}>
              <Button variant="outline">{backLabel}</Button>
            </Link>
            {showLogout && <LogoutButton variant="secondary" />}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
