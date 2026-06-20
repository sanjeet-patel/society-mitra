"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HomeHero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-palette-navy/8 via-palette-gold/5 to-background animate-hero-gradient" />
      <div className="absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-palette-orange/20 via-palette-gold/10 to-transparent animate-hero-glow" />
      <div className="absolute -right-24 top-32 -z-10 h-72 w-72 rounded-full bg-palette-gold/20 blur-3xl animate-float-slow" />
      <div className="absolute -left-16 bottom-0 -z-10 h-56 w-56 rounded-full bg-palette-orange/15 blur-3xl animate-float-slower" />
      <div className="absolute left-1/2 top-20 -z-10 h-40 w-40 -translate-x-1/2 rounded-full bg-palette-red/8 blur-3xl animate-float-slow [animation-delay:2s]" />

      <div className="container mx-auto px-4 py-24 md:py-32 text-center">
        <p className="text-overline mb-4 inline-flex items-center rounded-full border border-palette-gold/40 bg-palette-gold/20 px-4 py-1.5 text-palette-navy animate-hero-enter [animation-delay:120ms]">
          Community-first society management
        </p>
        <h1 className="text-display mb-6 max-w-4xl mx-auto text-palette-navy animate-hero-enter [animation-delay:220ms]">
          One platform for every{" "}
          <span className="animate-shimmer-text bg-gradient-to-r from-palette-orange via-palette-gold to-palette-orange bg-[length:200%_auto] bg-clip-text text-transparent">
            society need
          </span>
        </h1>
        <p className="text-lead max-w-2xl mx-auto mb-10 animate-hero-enter [animation-delay:360ms]">
          People, services, communication, and community — structured and
          searchable, without WhatsApp clutter.
        </p>
        <div className="flex gap-4 justify-center flex-wrap animate-hero-enter [animation-delay:500ms]">
          <Link href="/greenvalley">
            <Button
              size="lg"
              className="shadow-lg shadow-palette-navy/25 transition-transform duration-300 hover:scale-[1.03] hover:brightness-110 active:scale-[0.98]"
            >
              View Demo Society
            </Button>
          </Link>
          <Link href="/login">
            <Button
              size="lg"
              variant="outline"
              className="border-palette-orange/50 text-palette-orange transition-transform duration-300 hover:scale-[1.03] hover:bg-palette-orange/10 hover:text-palette-orange active:scale-[0.98]"
            >
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
