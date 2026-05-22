import Link from "next/link";
import { FileQuestion, StickyNote, BookText, Pill, List, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Dashboard — PharmFlow" };

const tools = [
  {
    title: "Practice Exam",
    description: "Generate multiple choice and true/false questions from your lecture notes",
    icon: FileQuestion,
    href: "/upload?generate=exam",
    available: true,
  },
  {
    title: "Notecards",
    description: "Generate flashcards and study with a Know It / Don't Know flow",
    icon: StickyNote,
    href: "/upload?generate=notecards",
    available: true,
  },
  {
    title: "Summary",
    description: "Get a concise 5-sentence overview of the key concepts from your notes",
    icon: BookText,
    href: "/upload?generate=summary",
    available: true,
  },
  {
    title: "Drug Lookup",
    description: "Search FDA-approved prescribing information for any drug",
    icon: Pill,
    href: "/drug-lookup",
    available: true,
  },
  {
    title: "Top 200 Drugs",
    description: "Select drugs from the top 200 list and drill with flashcards",
    icon: List,
    href: "/top200",
    available: true,
  },
  ...Array.from({ length: 4 }, () => ({
    title: "Coming Soon",
    description: "A new study tool is on the way",
    icon: Lock,
    href: null,
    available: false,
  })),
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] ?? "there";

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Hey, {firstName} 👋</h1>
        <p className="text-muted-foreground">What do you want to study today?</p>
      </div>

      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-3xl mx-auto w-full">
        {tools.map((tool, i) => {
          const Icon = tool.icon;

          if (!tool.available) {
            return (
              <div
                key={i}
                className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed bg-card p-4 text-center aspect-square opacity-40 cursor-not-allowed"
              >
                <Icon className="h-7 w-7 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">{tool.title}</span>
              </div>
            );
          }

          return (
            <Link
              key={i}
              href={tool.href!}
              className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 bg-card p-4 text-center aspect-square shadow-md transition-all hover:shadow-lg hover:border-primary/60 hover:-translate-y-0.5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold leading-snug">{tool.title}</p>
                <p className="mt-1 text-xs text-muted-foreground leading-snug">{tool.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
