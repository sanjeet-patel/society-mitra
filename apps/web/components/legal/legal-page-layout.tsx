import Link from "next/link";
import { Building2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LegalPageLayout({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-palette-navy/10 bg-background/95 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-palette-navy">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-palette-navy">
              <Building2 className="h-4 w-4 text-palette-gold" />
            </div>
            Society Mitra
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 text-palette-navy">
              <ArrowLeft className="h-4 w-4" />
              Home
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12 md:py-16 max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-palette-navy mb-2">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: {lastUpdated}</p>
        <article className="prose-legal space-y-8 text-foreground">{children}</article>
      </main>

      <footer className="border-t border-palette-navy/10 bg-palette-navy py-6 text-center text-sm text-palette-gold/80">
        <p>© {new Date().getFullYear()} Society Mitra. All rights reserved.</p>
        <div className="mt-2 flex justify-center gap-4">
          <Link href="/privacy" className="hover:text-palette-gold transition-colors">
            Privacy Policy
          </Link>
          <Link href="/copyright" className="hover:text-palette-gold transition-colors">
            Copyright
          </Link>
        </div>
      </footer>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-palette-navy mb-3">{title}</h2>
      <div className="space-y-3 text-muted-foreground leading-relaxed">{children}</div>
    </section>
  );
}

export { Section };
