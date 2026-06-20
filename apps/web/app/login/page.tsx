import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-palette-navy/5 via-palette-gold/10 to-background">
      <LoginForm redirect={params.redirect} />
    </div>
  );
}
