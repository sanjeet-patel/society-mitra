import { createClient } from "@/lib/supabase/server";
import { syncPlatformAdmin } from "@/lib/actions/auth";
import { redirect } from "next/navigation";

export default async function AuthCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await syncPlatformAdmin();
    redirect(params.redirect || "/");
  }

  redirect("/login");
}
