import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PharmacyIcon } from "@/components/ui/pharmacy-icon";
import { Button } from "@/components/ui/button";
import { Sparkles, Pill, ClipboardCheck } from "lucide-react";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <header className="flex items-center justify-between px-8 h-16 border-b border-border/50">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ backgroundColor: "hsl(var(--navbar))" }}
          >
            <PharmacyIcon className="h-4 w-4 text-white" strokeWidth={2} />
          </div>
          <span className="text-lg font-bold">PharmFlow</span>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/signup">Get started</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center text-center px-6 py-24">
        <div
          className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl shadow-lg"
          style={{ backgroundColor: "hsl(var(--navbar))" }}
        >
          <PharmacyIcon className="h-10 w-10 text-white" strokeWidth={1.5} />
        </div>

        <h1 className="text-5xl font-bold tracking-tight max-w-2xl leading-tight">
          Find your{" "}
          <span style={{ color: "hsl(var(--primary))" }}>flow.</span>
        </h1>

        <p className="mt-5 text-lg text-muted-foreground max-w-md leading-relaxed">
          Everything you need for pharmacy school, in one place.
        </p>

        <div className="mt-8 flex items-center gap-4">
          <Button asChild size="lg">
            <Link href="/signup">Get started free</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="px-8 pb-24">
        <div className="mx-auto max-w-3xl grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border-2 bg-card p-6 space-y-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: "hsl(var(--navbar))" }}
            >
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-semibold">AI Study Materials</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Upload any lecture PDF and instantly generate practice exams, flashcard sets, or a concise summary.
            </p>
          </div>

          <div className="rounded-xl border-2 bg-card p-6 space-y-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: "hsl(var(--navbar))" }}
            >
              <Pill className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-semibold">Drug Reference</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Look up any drug&apos;s full FDA prescribing information or drill the top 200 drugs with flashcards.
            </p>
          </div>

          <div className="rounded-xl border-2 bg-card p-6 space-y-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: "hsl(var(--navbar))" }}
            >
              <ClipboardCheck className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-semibold">Pharmacy Practice</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Spot errors in AI-generated prescriptions, build mnemonics for drug groups, and earn achievements as you study.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6 text-center text-sm text-muted-foreground">
        PharmFlow, built for pharmacy students
      </footer>
    </div>
  );
}
