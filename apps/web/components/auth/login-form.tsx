"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { sendOtp, verifyOtp } from "@/lib/actions/auth";

export function LoginForm({ redirect }: { redirect?: string }) {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSendOtp(formData: FormData) {
    setLoading(true);
    setError("");
    const result = await sendOtp(formData);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setEmail(result.email || (formData.get("email") as string));
    setStep("otp");
  }

  async function handleVerifyOtp(formData: FormData) {
    setLoading(true);
    setError("");
    formData.set("email", email);
    if (redirect) formData.set("redirect", redirect);

    try {
      await verifyOtp(formData);
    } catch (e) {
      if (e instanceof Error && e.message.includes("NEXT_REDIRECT")) throw e;
      setError("Verification failed");
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Sign in to Society Mitra</CardTitle>
        <CardDescription>
          {step === "email"
            ? "Enter your email to receive a one-time code"
            : `Enter the 6-digit code sent to ${email}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <p className="text-sm text-destructive mb-4">{error}</p>
        )}

        {step === "email" ? (
          <form action={handleSendOtp} className="space-y-4">
            {redirect && <input type="hidden" name="redirect" value={redirect} />}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending..." : "Send Code"}
            </Button>
          </form>
        ) : (
          <form action={handleVerifyOtp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="token">Verification Code</Label>
              <Input
                id="token"
                name="token"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                placeholder="123456"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Verifying..." : "Verify & Sign In"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setStep("email")}
            >
              Use different email
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
