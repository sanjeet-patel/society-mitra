import { HeroShowcase } from "@/components/home/hero-showcase";
import { FeaturesSection } from "@/components/home/features-section";
import { HomeFooter } from "@/components/home/home-footer";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth";

export default async function HomePage() {
  const user = await getCurrentUser();
  const profile = user ? await getCurrentProfile() : null;

  return (
    <div className="min-h-screen flex flex-col">
      <HeroShowcase
        isLoggedIn={Boolean(user)}
        userName={profile?.full_name}
        isPlatformAdmin={profile?.is_platform_admin}
      />
      <main className="flex-1">
        <FeaturesSection />
      </main>
      <HomeFooter />
    </div>
  );
}
