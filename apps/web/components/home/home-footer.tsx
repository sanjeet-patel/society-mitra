"use client";

import { AnimatedReveal } from "./animated-reveal";

export function HomeFooter() {
  return (
    <AnimatedReveal direction="up" duration={600}>
      <footer className="border-t border-palette-navy/10 bg-palette-navy py-8 text-center text-sm text-palette-gold/80">
        Society Mitra — Community-first society management
      </footer>
    </AnimatedReveal>
  );
}
