import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "text-2xl font-bold text-foreground transition-colors",
        className
      )}
    >
      <span>Resmo</span><span className="text-primary">AI</span>
    </Link>
  );
}
