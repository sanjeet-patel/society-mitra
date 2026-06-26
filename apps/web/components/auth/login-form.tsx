"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { signIn } from "@/lib/actions/auth";
import { DemoLoginPanel } from "./demo-login-panel";

export function LoginForm({
  redirect,
  signedOut,
}: {
  redirect?: string;
  signedOut?: boolean;
}) {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [redirectPath, setRedirectPath] = useState(redirect ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setRedirectPath(redirect ?? "");
  }, [redirect]);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");

    try {
      const result = await signIn(formData);
      if (result?.error) {
        setError(result.error);
        setLoading(false);
      }
    } catch (e) {
      if (e instanceof Error && e.message.includes("NEXT_REDIRECT")) throw e;
      setError("Sign in failed");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto grid gap-8 lg:grid-cols-2 items-start">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Sign in to Society Mitra</CardTitle>
          <CardDescription>
            Use your mobile number (login ID) and password. Accounts are created by your society
            admin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {signedOut && (
            <p className="text-sm text-primary mb-4">You have been signed out successfully.</p>
          )}
          {error && <p className="text-sm text-destructive mb-4">{error}</p>}

          <form action={handleSubmit} className="space-y-4">
            {redirectPath && <input type="hidden" name="redirect" value={redirectPath} />}

            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number (Login ID)</Label>
              <Input
                id="mobile"
                name="mobile"
                type="tel"
                inputMode="numeric"
                autoComplete="username"
                placeholder="9876543210"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="text-sm text-muted-foreground mt-6 text-center">
            New here?{" "}
            <a
              href={
                redirectPath
                  ? `/signup?redirect=${encodeURIComponent(redirectPath)}`
                  : "/signup"
              }
              className="text-primary font-medium hover:underline"
            >
              Create an account
            </a>
          </p>
        </CardContent>
      </Card>

      <DemoLoginPanel
        onSelectAccount={(account) => {
          setMobile(account.mobile);
          setPassword(account.password);
          setRedirectPath(account.afterLoginPath);
          setError("");
        }}
      />
    </div>
  );
}
