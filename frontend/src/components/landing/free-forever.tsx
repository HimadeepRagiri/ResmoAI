"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export function FreeForever() {
  const { user } = useAuth();

  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl text-glow">
            No Cost. No Limits. Always Free.
          </h2>
          <p className="mt-6 text-lg text-muted-foreground md:text-xl">
            ResmoAI is 100% free—no hidden fees, no premium paywalls. Start building your future today with unlimited ATS-friendly PDF resumes.
          </p>
          <div className="mt-10">
            <Button
              asChild
              size="lg"
              className="transition-all duration-300 text-lg px-8 py-6 hover:scale-105 hover:shadow-[0_0_20px_hsl(var(--primary)/0.7)]"
            >
              <Link href={user ? "/dashboard" : "/login?tab=register"}>Start Building Your Future</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
