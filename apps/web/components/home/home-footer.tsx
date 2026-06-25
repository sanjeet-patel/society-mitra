"use client";

import Link from "next/link";
import { AnimatedReveal } from "./animated-reveal";

export function HomeFooter() {
  const year = new Date().getFullYear();

  return (
    <AnimatedReveal direction="up" duration={600}>
      <footer className="border-t border-palette-navy/10 bg-palette-navy py-10 text-center text-sm text-palette-gold/80">
        <p className="font-medium text-palette-gold">
          Society Mitra — Community-first society management
        </p>
        <p className="mt-2">© {year} Society Mitra. All rights reserved.</p>
        <nav className="mt-4 flex justify-center gap-6" aria-label="Legal">
          <Link
            href="/privacy"
            className="hover:text-white transition-colors underline-offset-4 hover:underline"
          >
            Privacy Policy
          </Link>
          <Link
            href="/copyright"
            className="hover:text-white transition-colors underline-offset-4 hover:underline"
          >
            Copyright
          </Link>
        </nav>
      </footer>
    </AnimatedReveal>
  );
}
