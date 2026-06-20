"use client";

import { Users, Megaphone, Shield, Wrench, type LucideIcon } from "lucide-react";
import { AnimatedReveal } from "./animated-reveal";

const features: {
  icon: LucideIcon;
  title: string;
  desc: string;
  iconBg: string;
  iconColor: string;
  hoverBorder: string;
  glow: string;
}[] = [
  {
    icon: Users,
    title: "Member Directory",
    desc: "Find owners, tenants, and contacts by name or house number",
    iconBg: "bg-palette-navy/10",
    iconColor: "text-palette-navy",
    hoverBorder: "hover:border-palette-navy/30",
    glow: "group-hover:shadow-palette-navy/10",
  },
  {
    icon: Megaphone,
    title: "Announcements",
    desc: "Structured notices with push notifications",
    iconBg: "bg-palette-orange/15",
    iconColor: "text-palette-orange",
    hoverBorder: "hover:border-palette-orange/40",
    glow: "group-hover:shadow-palette-orange/15",
  },
  {
    icon: Shield,
    title: "Emergency Contacts",
    desc: "One-tap access to police, hospital, and society contacts",
    iconBg: "bg-palette-red/10",
    iconColor: "text-palette-red",
    hoverBorder: "hover:border-palette-red/30",
    glow: "group-hover:shadow-palette-red/10",
  },
  {
    icon: Wrench,
    title: "Service Directory",
    desc: "Trusted local plumbers, electricians, and more",
    iconBg: "bg-palette-gold/25",
    iconColor: "text-palette-navy",
    hoverBorder: "hover:border-palette-gold/50",
    glow: "group-hover:shadow-palette-gold/20",
  },
];

export function FeatureCards() {
  return (
    <section className="py-20 bg-palette-navy/[0.03]">
      <div className="container mx-auto px-4">
        <AnimatedReveal>
          <h2 className="text-center mb-3 text-palette-navy">Core Features</h2>
        </AnimatedReveal>
        <AnimatedReveal delay={120}>
          <p className="text-lead text-center mb-12 max-w-xl mx-auto">
            Everything your society needs, in one warm and welcoming workspace.
          </p>
        </AnimatedReveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map(
            ({ icon: Icon, title, desc, iconBg, iconColor, hoverBorder, glow }, index) => (
              <AnimatedReveal key={title} delay={index * 120} duration={650}>
                <div
                  className={`group h-full bg-card rounded-2xl border border-border/70 p-6 shadow-sm transition-all duration-500 hover:shadow-lg hover:-translate-y-1.5 ${hoverBorder} ${glow}`}
                >
                  <div
                    className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ${iconBg}`}
                  >
                    <Icon
                      className={`h-5 w-5 transition-transform duration-500 group-hover:scale-110 ${iconColor}`}
                    />
                  </div>
                  <h3 className="font-semibold mb-2 tracking-tight text-palette-navy transition-colors duration-300 group-hover:text-palette-orange">
                    {title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </AnimatedReveal>
            )
          )}
        </div>
      </div>
    </section>
  );
}
