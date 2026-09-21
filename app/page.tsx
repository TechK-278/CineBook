import Link from "next/link";
import { Film, Clapperboard, Ticket, ShieldCheck, Database, Layers, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  const architectureHighlights = [
    {
      icon: Layers,
      title: "Next.js App Router & React 19",
      description: "Server Components, dynamic routing, and strict TypeScript domain models.",
    },
    {
      icon: Database,
      title: "Supabase & PostgreSQL Schema",
      description: "Relational tables for movies, screens, seats, shows, real-time locking, and bookings with RLS.",
    },
    {
      icon: ShieldCheck,
      title: "Zero-Trust Security & Pricing Engine",
      description: "Centralized server-side pricing calculation, Zod validations, and environment isolation.",
    },
  ];

  return (
    <div className="flex flex-col gap-12 pb-16">
      {/* Hero Section */}
      <section className="relative border-b border-cinebook-border bg-gradient-to-b from-cinebook-surface to-cinebook-dark py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center flex flex-col items-center">
          <Badge variant="accent" className="mb-4 gap-1.5 px-3 py-1 text-xs">
            <Sparkles className="h-3.5 w-3.5" />
            CineBook v2 Architecture Foundation
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Cinematic Movie Discovery & <br />
            <span className="text-cinebook-accent">Full-Stack Ticket Booking</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-zinc-400">
            Next-generation cinema platform built with Next.js, TypeScript, Tailwind CSS, Supabase, and PostgreSQL.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/movies">
              <Button size="lg" className="gap-2">
                <Clapperboard className="h-5 w-5" />
                Browse Movies
              </Button>
            </Link>
            <Link href="/theatres">
              <Button variant="outline" size="lg" className="gap-2">
                <Film className="h-5 w-5" />
                Explore Theatres
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Architecture Highlights */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-white">Production Architecture</h2>
          <p className="text-sm text-zinc-400 mt-1">Core foundations established in CineBook v2</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {architectureHighlights.map((item, i) => {
            const Icon = item.icon;
            return (
              <Card key={i} className="hover:border-zinc-700 transition-colors">
                <CardHeader>
                  <div className="h-10 w-10 rounded-lg bg-cinebook-dark border border-cinebook-border flex items-center justify-center text-cinebook-accent mb-2">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
