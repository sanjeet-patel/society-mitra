import { HomeHeader } from "@/components/home/home-header";
import { HomeHero } from "@/components/home/home-hero";
import { FeatureCards } from "@/components/home/feature-cards";
import { HomeFooter } from "@/components/home/home-footer";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <HomeHeader />
      <main className="flex-1">
        <HomeHero />
        <FeatureCards />
      </main>
      <HomeFooter />
    </div>
  );
}
