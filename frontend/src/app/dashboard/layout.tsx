"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

function DashboardNavbar() {
  const router = useRouter();
  const [hasScrolled, setHasScrolled] = useState(false);
  const { user, loading, username } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent hydration mismatch: don't render until auth state is loaded
  if (loading) return null;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        hasScrolled
          ? "bg-background/80 backdrop-blur-sm border-b border-violet-500/20"
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-6">
          <Logo />
          <span className="hidden md:block text-lg font-medium text-muted-foreground">
            Resume Assistant
          </span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.photoURL || undefined} alt={username || user?.displayName || user?.email || "User"} />
                <AvatarFallback>{(username ? username[0] : (user?.displayName ? user.displayName[0] : (user?.email ? user.email[0] : "U")))}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{username || user?.displayName || "User"}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {user && (
              <DropdownMenuItem
                onClick={async () => {
                  const { signOut } = await import("firebase/auth");
                  const { auth } = await import("@/lib/firebase");
                  await signOut(auth);
                  router.push("/");
                }}
                className="cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <DashboardNavbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
