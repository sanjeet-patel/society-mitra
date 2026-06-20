import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Building2, Users, Megaphone, Shield, Wrench } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Building2 className="h-6 w-6 text-emerald-600" />
            Society Mitra
          </div>
          <div className="flex gap-2">
            <Link href="/login">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link href="/admin/societies">
              <Button>Platform Admin</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            One platform for every{" "}
            <span className="text-emerald-600">society need</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            People, services, communication, and community — structured and
            searchable, without WhatsApp clutter.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/greenvalley">
              <Button size="lg">View Demo Society</Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Get Started
              </Button>
            </Link>
          </div>
        </section>

        <section className="bg-muted/50 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-10">Core Features</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Users,
                  title: "Member Directory",
                  desc: "Find owners, tenants, and contacts by name or house number",
                },
                {
                  icon: Megaphone,
                  title: "Announcements",
                  desc: "Structured notices with push notifications",
                },
                {
                  icon: Shield,
                  title: "Emergency Contacts",
                  desc: "One-tap access to police, hospital, and society contacts",
                },
                {
                  icon: Wrench,
                  title: "Service Directory",
                  desc: "Trusted local plumbers, electricians, and more",
                },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-background rounded-lg border p-6">
                  <Icon className="h-8 w-8 text-emerald-600 mb-4" />
                  <h3 className="font-semibold mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        Society Mitra — Community-first society management
      </footer>
    </div>
  );
}
