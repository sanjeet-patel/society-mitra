"use client";

import { HomeHeader } from "./home-header";
import { HomeHero } from "./home-hero";
import { TubesCursorBackground } from "./tubes-cursor-background";

type HeroShowcaseProps = {
  isLoggedIn?: boolean;
  userName?: string | null;
  isPlatformAdmin?: boolean;
};

export function HeroShowcase({ isLoggedIn, userName, isPlatformAdmin }: HeroShowcaseProps) {
  return (
    <section className="relative min-h-[92vh] overflow-hidden bg-[#001f33]">
      <div className="absolute inset-0">
        <TubesCursorBackground />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,15,30,0.55)_0%,_transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#001f33]/50 via-transparent to-background" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background via-background/80 to-transparent" />

      <div className="relative z-10 flex min-h-[92vh] flex-col">
        <HomeHeader
          isLoggedIn={isLoggedIn}
          userName={userName}
          isPlatformAdmin={isPlatformAdmin}
        />
        <HomeHero />
      </div>
    </section>
  );
}
