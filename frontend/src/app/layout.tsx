import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Poppins } from "next/font/google";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/lib/auth-context";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "ResmoAI: Your Personal AI Resume Assistant",
  description: "Craft the perfect resume with ResmoAI. Get instant, intelligent feedback, generate tailored resumes from scratch, and see how you stack up against job descriptions—all for free.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          poppins.variable
        )}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
