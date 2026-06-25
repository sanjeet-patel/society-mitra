"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HomeHero() {
  return (
    <div className="flex flex-1 flex-col justify-center">
      <div className="container mx-auto px-4 py-16 md:py-24 text-center">
        <p className="mb-4 inline-flex items-center rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-medium tracking-wide text-white backdrop-blur-sm animate-hero-enter [animation-delay:120ms]">
          Community-first society management
        </p>
        <h1 className="text-display mb-6 max-w-4xl mx-auto text-white animate-hero-enter [animation-delay:220ms] drop-shadow-[0_2px_24px_rgba(0,0,0,0.9)]">
          One platform for every{" "}
          <span className="text-white underline decoration-palette-gold/80 decoration-4 underline-offset-8">
            society need
          </span>
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 font-normal leading-relaxed text-white animate-hero-enter [animation-delay:360ms] drop-shadow-[0_2px_16px_rgba(0,0,0,0.85)]">
          People, services, communication, and community — structured and
          searchable, without WhatsApp clutter.
        </p>
        <div className="flex gap-4 justify-center flex-wrap animate-hero-enter [animation-delay:500ms]">
          <Link href="/greenvalley">
            <Button
              size="lg"
              className="bg-white text-palette-navy shadow-lg shadow-black/40 transition-transform duration-300 hover:scale-[1.03] hover:bg-white/90 active:scale-[0.98]"
            >
              View Demo Society
            </Button>
          </Link>
          <Link href="/login">
            <Button
              size="lg"
              variant="outline"
              className="border-white/60 bg-white/10 text-white backdrop-blur-sm transition-transform duration-300 hover:scale-[1.03] hover:bg-white/20 hover:text-white active:scale-[0.98]"
            >
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
