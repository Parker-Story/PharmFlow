"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { PharmacyIcon } from "@/components/ui/pharmacy-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { signIn, signUp } from "@/lib/actions/auth";

interface AuthFormProps {
  mode: "login" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const isLogin = mode === "login";

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = isLogin ? await signIn(formData) : await signUp(formData);
      if (result?.error) setError(result.error);
      if ("success" in result && result.success) setSuccess(result.success as string);
    });
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left branding panel */}
      <div
        className="hidden lg:flex lg:w-5/12 flex-col items-center justify-center gap-6 p-12"
        style={{ backgroundColor: "hsl(var(--navbar))" }}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
          <PharmacyIcon className="h-8 w-8 text-white" />
        </div>
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white">PharmFlow</h1>
          <p className="mt-2 text-white/75 text-base max-w-xs leading-relaxed">
            Upload lecture PDFs and generate practice exams instantly.
          </p>
        </div>
        <div className="mt-6 space-y-3 text-sm text-white/60 text-center">
          <p>✦ AI-generated practice questions</p>
          <p>✦ Organized study library</p>
          <p>✦ Multiple choice &amp; true/false</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile branding */}
          <div className="mb-8 text-center lg:hidden">
            <div
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{ backgroundColor: "hsl(var(--navbar))" }}
            >
              <BookOpen className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold" style={{ color: "hsl(var(--foreground))" }}>PharmFlow</h1>
            <p className="mt-1 text-muted-foreground">Study smarter, not harder</p>
          </div>

          <Card className="border-2 shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">
                {isLogin ? "Welcome back" : "Create your account"}
              </CardTitle>
              <CardDescription>
                {isLogin
                  ? "Sign in to access your study materials"
                  : "Start your pharmacy study journey today"}
              </CardDescription>
            </CardHeader>

            <form action={handleSubmit}>
              <CardContent className="space-y-4">
                {!isLogin && (
                  <div className="space-y-1.5">
                    <Label htmlFor="full_name">Full name</Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      placeholder="Jane Doe"
                      autoComplete="name"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      required
                      autoComplete={isLogin ? "current-password" : "new-password"}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {error}
                  </p>
                )}

                {success && (
                  <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
                    {success}
                  </p>
                )}
              </CardContent>

              <CardFooter className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLogin ? "Sign in" : "Create account"}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  {isLogin ? (
                    <>
                      Don&apos;t have an account?{" "}
                      <Link href="/signup" className="font-medium text-primary hover:underline">
                        Sign up
                      </Link>
                    </>
                  ) : (
                    <>
                      Already have an account?{" "}
                      <Link href="/login" className="font-medium text-primary hover:underline">
                        Sign in
                      </Link>
                    </>
                  )}
                </p>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
