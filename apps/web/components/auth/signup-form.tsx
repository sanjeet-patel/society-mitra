"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SubmitButton } from "@/components/ui/submit-button";
import { signUp } from "@/lib/actions/auth";

export function SignupForm({ redirect }: { redirect?: string }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirectPath, setRedirectPath] = useState(redirect ?? "");

  useEffect(() => {
    setRedirectPath(redirect ?? "");
  }, [redirect]);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");

    try {
      const result = await signUp(formData);
      if (result?.error) {
        setError(result.error);
        setLoading(false);
      }
    } catch (e) {
      if (e instanceof Error && e.message.includes("NEXT_REDIRECT")) throw e;
      setError("Registration failed");
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>
          Register with your mobile number. After signing up, you can request to join your society.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && <p className="text-sm text-destructive mb-4">{error}</p>}

        <form action={handleSubmit} className="space-y-4">
          {redirectPath && <input type="hidden" name="redirect" value={redirectPath} />}

          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" name="fullName" required minLength={2} autoComplete="name" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile number (login ID)</Label>
            <Input
              id="mobile"
              name="mobile"
              type="tel"
              inputMode="numeric"
              autoComplete="username"
              placeholder="9876543210"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>

          <SubmitButton type="submit" className="w-full" pending={loading} pendingLabel="Creating account…">
            Register
          </SubmitButton>
        </form>

        <p className="text-sm text-muted-foreground mt-6 text-center">
          Already have an account?{" "}
          <Link
            href={redirectPath ? `/login?redirect=${encodeURIComponent(redirectPath)}` : "/login"}
            className="text-primary font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
