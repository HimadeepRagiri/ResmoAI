import Link from "next/link";
import { Github, Linkedin, Twitter, Instagram, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const socialLinks = [
  {
    href: "https://github.com/HimadeepRagiri/ResmoAI",
    icon: Github,
    label: "GitHub",
  },
  {
    href: "https://www.linkedin.com/in/ragiri-himadeep-608647291",
    icon: Linkedin,
    label: "LinkedIn",
  },
  {
    href: "https://x.com/RagiriHimadeep",
    icon: Twitter,
    label: "Twitter",
  },
  {
    href: "https://www.instagram.com/himadeep421?igsh=amY5aDUwdW1rN25k",
    icon: Instagram,
    label: "Instagram",
  },
  {
    href: "mailto:himadeepragiri@gmail.com",
    icon: Mail,
    label: "Email",
  },
];

export function Footer() {
  return (
    <footer className="bg-background/50 border-t border-border">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-8 md:flex-row md:px-6">
        <p className="text-sm text-muted-foreground">
          Made with ❤️ by Ragiri Himadeep
        </p>
        <div className="flex items-center gap-2">
          {socialLinks.map((social) => (
            <Button
              key={social.label}
              variant="ghost"
              size="icon"
              asChild
              className="text-muted-foreground hover:text-primary hover:bg-primary/10"
            >
              <Link href={social.href} target="_blank" rel="noopener noreferrer">
                <social.icon className="h-5 w-5" />
                <span className="sr-only">{social.label}</span>
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </footer>
  );
}
