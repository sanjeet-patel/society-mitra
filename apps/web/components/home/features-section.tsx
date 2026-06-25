"use client";

import Link from "next/link";
import {
  Users,
  Megaphone,
  Shield,
  Wrench,
  Bell,
  Smartphone,
  Building2,
  UserCheck,
  Search,
  Lock,
  LayoutDashboard,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedReveal } from "./animated-reveal";

type FeatureItem = {
  icon: LucideIcon;
  title: string;
  desc: string;
  details: string[];
  iconBg: string;
  iconColor: string;
  accent: string;
};

const coreFeatures: FeatureItem[] = [
  {
    icon: Users,
    title: "Member Directory",
    desc: "A searchable directory of every resident in your society.",
    details: [
      "Search by name, flat number, or block",
      "Separate owner and tenant listings",
      "Controlled phone visibility per society",
      "Quick contact without WhatsApp groups",
    ],
    iconBg: "bg-palette-navy/10",
    iconColor: "text-palette-navy",
    accent: "border-palette-navy/20",
  },
  {
    icon: Megaphone,
    title: "Announcements",
    desc: "Official notices that reach every member reliably.",
    details: [
      "Structured posts with titles and dates",
      "Web push notifications to devices",
      "Society-wide broadcast in one place",
      "No messages lost in chat threads",
    ],
    iconBg: "bg-palette-orange/15",
    iconColor: "text-palette-orange",
    accent: "border-palette-orange/25",
  },
  {
    icon: Shield,
    title: "Emergency Contacts",
    desc: "Critical numbers available when seconds matter.",
    details: [
      "Police, fire, ambulance, and hospital",
      "Society president, secretary, and gate",
      "Categorized internal and external contacts",
      "One-tap dial from any member device",
    ],
    iconBg: "bg-palette-red/10",
    iconColor: "text-palette-red",
    accent: "border-palette-red/20",
  },
  {
    icon: Wrench,
    title: "Service Directory",
    desc: "Trusted local vendors recommended by your community.",
    details: [
      "Plumbers, electricians, RO service, and more",
      "Ratings and reviews from residents",
      "Verified provider badges",
      "Direct inquiry without middlemen",
    ],
    iconBg: "bg-palette-gold/25",
    iconColor: "text-palette-navy",
    accent: "border-palette-gold/40",
  },
];

const platformFeatures: FeatureItem[] = [
  {
    icon: UserCheck,
    title: "Join & Approval",
    desc: "Residents request access; admins approve with confidence.",
    details: [
      "Self-service join requests per society",
      "Admin review and approve or reject",
      "Role-based access after approval",
      "Audit-friendly membership flow",
    ],
    iconBg: "bg-palette-navy/10",
    iconColor: "text-palette-navy",
    accent: "border-palette-navy/20",
  },
  {
    icon: Building2,
    title: "Multi-Tenant Societies",
    desc: "Each society gets its own isolated workspace and URL.",
    details: [
      "Path-based routing like /greenvalley",
      "Separate data per society with RLS",
      "Blocks, units, and member structure",
      "Scale from one society to hundreds",
    ],
    iconBg: "bg-palette-orange/15",
    iconColor: "text-palette-orange",
    accent: "border-palette-orange/25",
  },
  {
    icon: Smartphone,
    title: "Installable PWA",
    desc: "Works like a native app on phones and desktops.",
    details: [
      "Add to home screen on Android and iOS",
      "Fast, app-like experience in the browser",
      "Push notifications on supported devices",
      "No app store download required",
    ],
    iconBg: "bg-palette-gold/25",
    iconColor: "text-palette-navy",
    accent: "border-palette-gold/40",
  },
  {
    icon: LayoutDashboard,
    title: "Society Dashboard",
    desc: "A single home for members after they log in.",
    details: [
      "Recent announcements at a glance",
      "Emergency contacts surfaced first",
      "Profile and unit management",
      "Admin tools for member approvals",
    ],
    iconBg: "bg-palette-red/10",
    iconColor: "text-palette-red",
    accent: "border-palette-red/20",
  },
];

const highlights = [
  {
    icon: Search,
    title: "Find anyone in seconds",
    desc: "Stop scrolling through 200-person WhatsApp groups. Search the directory by name or flat number and reach the right person immediately.",
    bullets: ["Owner & tenant views", "Block-wise organization", "Privacy-respecting contact info"],
    imageSide: "right" as const,
  },
  {
    icon: Bell,
    title: "Announcements that actually get seen",
    desc: "Publish society notices with structure and push them to members' devices — so maintenance schedules, AGM dates, and water cuts don't get buried.",
    bullets: ["Push notification support", "Chronological notice board", "Admin-only publishing"],
    imageSide: "left" as const,
  },
  {
    icon: Lock,
    title: "Secure, society-scoped access",
    desc: "Every society is isolated with row-level security. Members only see their community's data — admins control who joins and what gets shared.",
    bullets: ["Supabase Auth + RLS", "Per-society membership", "Platform admin oversight"],
    imageSide: "right" as const,
  },
];

const steps = [
  {
    step: "01",
    title: "Create or join a society",
    desc: "Platform admins set up a society. Residents visit the society URL and request to join.",
  },
  {
    step: "02",
    title: "Get approved by admin",
    desc: "Society admins review pending members and approve legitimate residents.",
  },
  {
    step: "03",
    title: "Use the full workspace",
    desc: "Access directory, announcements, emergency contacts, services, and your profile.",
  },
];

function FeatureCard({ feature, index }: { feature: FeatureItem; index: number }) {
  const { icon: Icon, title, desc, details, iconBg, iconColor, accent } = feature;

  return (
    <AnimatedReveal delay={index * 100} duration={650}>
      <div
        className={`group flex h-full flex-col rounded-2xl border bg-card p-6 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-lg ${accent}`}
      >
        <div
          className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-500 group-hover:scale-110 ${iconBg}`}
        >
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <h3 className="mb-2 font-semibold tracking-tight text-palette-navy group-hover:text-palette-orange transition-colors">
          {title}
        </h3>
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{desc}</p>
        <ul className="mt-auto space-y-2">
          {details.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-palette-orange" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </AnimatedReveal>
  );
}

function HighlightBlock({
  icon: Icon,
  title,
  desc,
  bullets,
  imageSide,
  index,
}: (typeof highlights)[number] & { index: number }) {
  const isRight = imageSide === "right";

  return (
    <AnimatedReveal duration={700}>
      <div
        className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${!isRight ? "lg:[&>*:first-child]:order-2" : ""}`}
      >
        <div>
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-palette-navy/10">
            <Icon className="h-6 w-6 text-palette-navy" />
          </div>
          <h3 className="mb-3 text-2xl font-semibold tracking-tight text-palette-navy">{title}</h3>
          <p className="mb-6 leading-relaxed text-muted-foreground">{desc}</p>
          <ul className="space-y-3">
            {bullets.map((bullet) => (
              <li key={bullet} className="flex items-center gap-3 text-sm font-medium text-palette-navy">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-palette-gold/30 text-palette-navy text-xs">
                  ✓
                </span>
                {bullet}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-palette-navy/5 via-palette-gold/10 to-palette-orange/5 p-8 min-h-[220px] flex items-center justify-center">
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_30%_20%,#fcbf49_0%,transparent_50%),radial-gradient(circle_at_70%_80%,#f77f00_0%,transparent_50%)]" />
          <div className="relative grid grid-cols-2 gap-3 w-full max-w-xs">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/60 bg-white/70 p-4 shadow-sm backdrop-blur-sm"
                style={{ animationDelay: `${index * 100 + i * 80}ms` }}
              >
                <div className="mb-2 h-2 w-8 rounded-full bg-palette-navy/20" />
                <div className="h-2 w-full rounded-full bg-palette-orange/20" />
                <div className="mt-2 h-2 w-2/3 rounded-full bg-palette-gold/30" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </AnimatedReveal>
  );
}

export function FeaturesSection() {
  return (
    <>
      {/* Core features */}
      <section className="py-20 bg-palette-navy/[0.03]">
        <div className="container mx-auto px-4">
          <AnimatedReveal>
            <p className="text-center text-sm font-medium uppercase tracking-widest text-palette-orange mb-2">
              Core Features
            </p>
            <h2 className="text-center mb-3 text-palette-navy">
              Everything residents need, daily
            </h2>
          </AnimatedReveal>
          <AnimatedReveal delay={100}>
            <p className="text-lead text-center mb-14 max-w-2xl mx-auto">
              Replace scattered WhatsApp groups with structured tools built for
              housing societies — directory, notices, emergencies, and local services.
            </p>
          </AnimatedReveal>

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
            {coreFeatures.map((feature, index) => (
              <FeatureCard key={feature.title} feature={feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Platform capabilities */}
      <section className="py-20 bg-background border-y border-border/60">
        <div className="container mx-auto px-4">
          <AnimatedReveal>
            <p className="text-center text-sm font-medium uppercase tracking-widest text-palette-orange mb-2">
              Platform
            </p>
            <h2 className="text-center mb-3 text-palette-navy">
              Built for admins and residents alike
            </h2>
          </AnimatedReveal>
          <AnimatedReveal delay={100}>
            <p className="text-lead text-center mb-14 max-w-2xl mx-auto">
              From onboarding new members to running multiple societies — Society Mitra
              handles the full lifecycle with secure, role-based access.
            </p>
          </AnimatedReveal>

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
            {platformFeatures.map((feature, index) => (
              <FeatureCard key={feature.title} feature={feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Deep-dive highlights */}
      <section className="py-20 bg-palette-navy/[0.03]">
        <div className="container mx-auto px-4">
          <AnimatedReveal>
            <p className="text-center text-sm font-medium uppercase tracking-widest text-palette-orange mb-2">
              Why Society Mitra
            </p>
            <h2 className="text-center mb-14 text-palette-navy">
              Designed for real society problems
            </h2>
          </AnimatedReveal>

          <div className="space-y-20 max-w-5xl mx-auto">
            {highlights.map((item, index) => (
              <HighlightBlock key={item.title} {...item} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <AnimatedReveal>
            <p className="text-center text-sm font-medium uppercase tracking-widest text-palette-orange mb-2">
              Getting Started
            </p>
            <h2 className="text-center mb-3 text-palette-navy">How it works</h2>
          </AnimatedReveal>
          <AnimatedReveal delay={100}>
            <p className="text-lead text-center mb-14 max-w-xl mx-auto">
              Up and running in three steps — no complex setup for residents.
            </p>
          </AnimatedReveal>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((item, index) => (
              <AnimatedReveal key={item.step} delay={index * 150}>
                <div className="relative text-center">
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-px bg-palette-gold/40" />
                  )}
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-palette-navy text-palette-gold text-xl font-bold">
                    {item.step}
                  </div>
                  <h3 className="mb-2 font-semibold text-palette-navy">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                </div>
              </AnimatedReveal>
            ))}
          </div>

          <AnimatedReveal delay={400}>
            <div className="mt-14 text-center">
              <Link href="/greenvalley">
                <Button size="lg" className="gap-2 shadow-md shadow-palette-navy/20">
                  Explore Demo Society
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </AnimatedReveal>
        </div>
      </section>
    </>
  );
}
