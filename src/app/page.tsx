import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PharmacyIcon } from "@/components/ui/pharmacy-icon";
import { Button } from "@/components/ui/button";
import {
  Upload, Sparkles, Trophy,
  FileQuestion, StickyNote, BookText,
  Pill, List, ClipboardCheck, Brain,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload your lecture notes",
    description: "Drop in any PDF from class. PharmFlow extracts the content and never stores your files.",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "AI generates your study materials",
    description: "Get a practice exam, flashcard set, or 5-sentence summary in seconds. Or all three at once.",
  },
  {
    number: "03",
    icon: Trophy,
    title: "Study, drill, and track your progress",
    description: "Work through your materials, earn achievements, and watch your rank climb as you improve.",
  },
];

const tools = [
  { icon: FileQuestion, name: "Practice Exams",       description: "Multiple choice and true/false at adjustable difficulty" },
  { icon: StickyNote,   name: "Notecard Sets",        description: "Know It / Don't Know flashcard flow from your notes" },
  { icon: BookText,     name: "Summaries",            description: "5-sentence overview of any lecture's key concepts" },
  { icon: Pill,         name: "Drug Lookup",          description: "Full FDA prescribing info via RxNorm and OpenFDA" },
  { icon: List,         name: "Top 200 Drugs",        description: "Select and drill pharmacy's most-tested drugs" },
  { icon: ClipboardCheck, name: "Rx Verification",   description: "Spot clinical errors in AI-generated prescriptions" },
  { icon: Brain,        name: "Mnemonic Generator",  description: "AI-crafted mnemonics for mechanisms, side effects, and interactions" },
];

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <header className="flex items-center justify-between px-8 h-16 border-b border-border/50 sticky top-0 bg-background/80 backdrop-blur-sm z-10">
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
      <section className="flex flex-col items-center justify-center text-center px-6 py-28">
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

      {/* How it works */}
      <section className="px-8 py-20 border-t border-border/50 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center mb-2">How it works</p>
          <h2 className="text-3xl font-bold text-center mb-12">From notes to exam-ready in minutes</h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="flex flex-col items-center text-center gap-4">
                  <div className="relative">
                    <div
                      className="flex h-14 w-14 items-center justify-center rounded-2xl"
                      style={{ backgroundColor: "hsl(var(--navbar))" }}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="absolute -top-2 -right-2 text-xs font-bold text-white rounded-full w-5 h-5 flex items-center justify-center"
                      style={{ backgroundColor: "hsl(var(--primary))" }}>
                      {step.number.replace("0", "")}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-base mb-1">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* What's included */}
      <section className="px-8 py-20 border-t border-border/50">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center mb-2">What&apos;s included</p>
          <h2 className="text-3xl font-bold text-center mb-12">Every tool you need, nothing you don&apos;t</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <div key={tool.name} className="flex items-start gap-4 rounded-xl border bg-card p-5">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: "hsl(var(--navbar))" }}
                  >
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{tool.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{tool.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="px-8 py-20 border-t border-border/50 bg-muted/30">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-2xl font-medium leading-relaxed text-foreground">
            &ldquo;PharmFlow turned my lecture slides into a full study session in under a minute. I don&apos;t know how I studied without it.&rdquo;
          </p>
          <p className="mt-4 text-sm text-muted-foreground">Pharmacy student, ULM</p>
        </div>
      </section>

      {/* CTA */}
      <section className="px-8 py-20 border-t border-border/50">
        <div
          className="max-w-2xl mx-auto rounded-3xl px-8 py-14 text-center"
          style={{ backgroundColor: "hsl(var(--navbar))" }}
        >
          <h2 className="text-3xl font-bold text-white mb-3">Ready to find your flow?</h2>
          <p className="text-white/70 mb-8 text-base">Join for free and start studying smarter today.</p>
          <Button asChild size="lg" className="bg-white text-foreground hover:bg-white/90">
            <Link href="/signup">Get started free</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6 text-center text-sm text-muted-foreground">
        PharmFlow, built for pharmacy students
      </footer>
    </div>
  );
}
