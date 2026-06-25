"use client";

import Link from "next/link";
import { DEMO_ACCOUNTS, PUBLIC_SITE_URL } from "@/lib/config";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ExternalLink, Shield, User } from "lucide-react";

interface DemoLoginPanelProps {
  onSelectAccount?: (account: (typeof DEMO_ACCOUNTS)[number]) => void;
}

export function DemoLoginPanel({ onSelectAccount }: DemoLoginPanelProps) {
  return (
    <Card className="w-full max-w-md mx-auto border-palette-gold/30 bg-palette-gold/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-palette-navy">Demo accounts</CardTitle>
        <CardDescription>
          Pre-seeded mobile logins for{" "}
          <a
            href={PUBLIC_SITE_URL}
            className="font-medium text-palette-orange hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {PUBLIC_SITE_URL}
          </a>
          .
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {DEMO_ACCOUNTS.map((account) => {
          const Icon = account.role === "Super Admin" ? Shield : User;
          const afterUrl = `${PUBLIC_SITE_URL}${account.afterLoginPath}`;

          return (
            <div
              key={account.mobile}
              className="rounded-xl border border-border/70 bg-card p-4 space-y-3"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-palette-navy/10">
                  <Icon className="h-4 w-4 text-palette-navy" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-palette-navy">{account.role}</p>
                  <p className="text-sm text-muted-foreground">{account.description}</p>
                </div>
              </div>

              <div className="space-y-1.5 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-muted-foreground">Mobile:</span>
                  <code className="rounded bg-muted px-2 py-0.5 font-mono text-xs text-palette-navy">
                    {account.mobile}
                  </code>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-muted-foreground">Password:</span>
                  <code className="rounded bg-muted px-2 py-0.5 font-mono text-xs text-palette-navy">
                    {account.password}
                  </code>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-muted-foreground">After login:</span>
                  <a
                    href={afterUrl}
                    className="inline-flex items-center gap-1 text-palette-orange hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {account.afterLoginLabel}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {onSelectAccount && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => onSelectAccount(account)}
                  >
                    Use these credentials
                  </Button>
                )}
                <Link
                  href={account.loginPath}
                  className={cn(buttonVariants({ size: "sm", variant: "secondary" }), "text-xs")}
                >
                  Sign in as {account.role}
                </Link>
              </div>
            </div>
          );
        })}

        <p className="text-xs text-muted-foreground leading-relaxed rounded-lg border border-palette-orange/30 bg-palette-orange/5 p-3">
          Use a demo account above or sign in with credentials shared by your society admin.
        </p>
      </CardContent>
    </Card>
  );
}
