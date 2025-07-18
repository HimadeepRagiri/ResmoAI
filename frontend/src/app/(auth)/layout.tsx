import { Logo } from "@/components/ui/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-4">
      <div className="absolute top-8 left-8">
        <Logo />
      </div>
      {children}
    </div>
  );
}
