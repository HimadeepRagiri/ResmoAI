"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Icons } from "@/components/icons";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { auth, googleProvider, db } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  UserCredential,
  sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

const authSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." }),
  username: z.string().min(2, { message: "Username must be at least 2 characters." }).max(32, { message: "Username must be at most 32 characters." }).regex(/^[a-zA-Z0-9_]+$/, { message: "Username can only contain letters, numbers, and underscores." }).optional(),
});

type AuthFormData = z.infer<typeof authSchema>;

export function AuthForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [tab, setTab] = useState("login");
  const [verificationSent, setVerificationSent] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam === "register") setTab("register");
      if (tabParam === "login") setTab("login");
    }
  }, []);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  });

  const handleAuth = async (data: AuthFormData) => {
    setIsLoading(true);
    try {
      let userCred: UserCredential;
      if (tab === "register") {
        userCred = await createUserWithEmailAndPassword(
          auth,
          data.email,
          data.password
        );
        // Store user info in Firestore
        await setDoc(doc(db, "users", userCred.user.uid), {
          uid: userCred.user.uid,
          email: userCred.user.email,
          displayName: data.username || userCred.user.displayName || "",
          username: data.username || "",
          photoURL: userCred.user.photoURL || "",
          createdAt: new Date(),
        });
        await sendEmailVerification(userCred.user);
        setVerificationSent(true);
        setRegisteredEmail(userCred.user.email || "");
        toast({
          title: "Verification email sent!",
          description: "Please check your inbox and verify your email before continuing.",
        });
        setIsLoading(false);
        return;
      } else {
        userCred = await signInWithEmailAndPassword(
          auth,
          data.email,
          data.password
        );
        await userCred.user.reload();
        if (!userCred.user.emailVerified) {
          toast({
            title: "Email not verified",
            description: "Please verify your email before logging in.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        toast({ title: "Success!", description: "You have been logged in." });
      }
      router.push("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogle = async () => {
    setIsLoading(true);
    try {
      const userCred = await signInWithPopup(auth, googleProvider);
      // Store user info in Firestore if new
      const userDoc = await getDoc(doc(db, "users", userCred.user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", userCred.user.uid), {
          uid: userCred.user.uid,
          email: userCred.user.email,
          displayName: userCred.user.displayName || "",
          photoURL: userCred.user.photoURL || "",
          createdAt: new Date(),
        });
      }
      toast({ title: "Success!", description: "You have been logged in." });
      router.push("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // In the return, show a message if verificationSent is true
  if (verificationSent) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50 soft-shadow w-full max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle>Verify Your Email</CardTitle>
          <CardDescription>
            A verification email has been sent to <span className="font-semibold">{registeredEmail}</span>.<br />
            Please check your inbox and verify your email before continuing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm mb-4">
            Once verified, you can log in to your account.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Tabs
      defaultValue="login"
      value={tab}
      onValueChange={setTab}
      className="w-full max-w-md"
    >
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">Login</TabsTrigger>
        <TabsTrigger value="register">Register</TabsTrigger>
      </TabsList>
      <TabsContent value="login">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 soft-shadow">
          <form onSubmit={handleSubmit(handleAuth)}>
            <CardHeader>
              <CardTitle>Welcome Back</CardTitle>
              <CardDescription>
                Enter your credentials to access your dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-login">Email</Label>
                <Input
                  id="email-login"
                  type="email"
                  placeholder="m@example.com"
                  {...register("email")}
                  className="bg-background/50 focus:glow-border-violet"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-login">Password</Label>
                <Input
                  id="password-login"
                  type="password"
                  {...register("password")}
                  className="bg-background/50 focus:glow-border-violet"
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Continue
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full bg-background/50"
                disabled={isLoading}
                type="button"
                onClick={handleGoogle}
              >
                <Icons.google className="mr-2 h-5 w-5" />
                Continue with Google
              </Button>
            </CardFooter>
          </form>
        </Card>
      </TabsContent>
      <TabsContent value="register">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 soft-shadow">
          <form onSubmit={handleSubmit(handleAuth)}>
            <CardHeader>
              <CardTitle>Create an Account</CardTitle>
              <CardDescription>
                It’s free and only takes a minute.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username-register">Username</Label>
                <Input
                  id="username-register"
                  type="text"
                  placeholder="your_username"
                  {...register("username")}
                  className="bg-background/50 focus:glow-border-violet"
                />
                {errors.username && (
                  <p className="text-sm text-destructive">{errors.username.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-register">Email</Label>
                <Input
                  id="email-register"
                  type="email"
                  placeholder="m@example.com"
                  {...register("email")}
                  className="bg-background/50 focus:glow-border-violet"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-register">Password</Label>
                <Input
                  id="password-register"
                  type="password"
                  {...register("password")}
                  className="bg-background/50 focus:glow-border-violet"
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full bg-background/50"
                disabled={isLoading}
                type="button"
                onClick={handleGoogle}
              >
                <Icons.google className="mr-2 h-5 w-5" />
                Continue with Google
              </Button>
            </CardFooter>
          </form>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
