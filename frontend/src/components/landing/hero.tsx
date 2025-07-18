"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export function Hero() {
  const { user } = useAuth();

  return (
    <section id="home" className="relative w-full h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/[0.05] [mask-image:linear-gradient(to_bottom,white_10%,transparent_100%)]"></div>
      <div className="container mx-auto px-4 md:px-6 text-center z-10">
        <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl text-glow">
            Unlock More Interviews with an ATS-Optimized PDF Resume
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-lg text-muted-foreground md:text-xl">
            ResmoAI is your competitive edge. Instantly analyze, enhance, and generate professional, ATS-friendly PDF resumes that get noticed. Upload your PDF, get actionable insights, and download a polished PDF ready for any application—no more guesswork, just results.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="transition-all duration-300 text-lg px-8 py-6 hover:scale-105 hover:shadow-[0_0_20px_hsl(var(--primary)/0.7)]"
            >
              <Link href={user ? "/dashboard" : "/login?tab=register"}>Get Started Free</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-transparent border-primary/50 hover:bg-primary/10 hover:border-primary transition-colors text-lg px-8 py-6"
            >
              <Link href="/dashboard">See It in Action</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
