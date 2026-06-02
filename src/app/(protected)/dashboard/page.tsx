import Link from "next/link";
import { FileQuestion, StickyNote, BookText, Pill, List, Lock, Sparkles, ClipboardCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getUserPointsAndTier } from "@/lib/actions/achievements";
import { cn } from "@/lib/utils";

export const metadata = { title: "Dashboard | PharmFlow" };

const tools = [
  {
    title: "Practice Exam",
    description: "Generate multiple choice and true/false questions from your lecture notes",
    icon: FileQuestion,
    href: "/upload?generate=exam",
    available: true,
    maxPts: 220,
  },
  {
    title: "Notecards",
    description: "Generate flashcards and study with a Know It / Don't Know flow",
    icon: StickyNote,
    href: "/upload?generate=notecards",
    available: true,
    maxPts: 100,
  },
  {
    title: "Summary",
    description: "Get a concise 5-sentence overview of the key concepts from your notes",
    icon: BookText,
    href: "/upload?generate=summary",
    available: true,
    maxPts: 50,
  },
  {
    title: "Drug Lookup",
    description: "Search FDA-approved prescribing information for any drug",
    icon: Pill,
    href: "/drug-lookup",
    available: true,
    maxPts: 100,
  },
  {
    title: "Top 200 Drugs",
    description: "Select drugs from the top 200 list and drill with flashcards",
    icon: List,
    href: "/top200",
    available: true,
    maxPts: null,
  },
  {
    title: "Mnemonic Generator",
    description: "Get a quirky AI-generated mnemonic to help drug groups stick",
    icon: Sparkles,
    href: "/mnemonics",
    available: true,
    maxPts: 70,
  },
  {
    title: "Rx Verification",
    description: "Act as the pharmacist and spot errors in AI-generated prescriptions",
    icon: ClipboardCheck,
    href: "/verify",
    available: true,
    maxPts: 370,
  },
  ...Array.from({ length: 2 }, () => ({
    title: "Coming Soon",
    description: "A new study tool is on the way",
    icon: Lock,
    href: null,
    available: false,
    maxPts: null,
  })),
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] ?? "there";
  const { totalPoints, tier, nextTier } = await getUserPointsAndTier(user!.id);
  const progressPct = nextTier
    ? Math.min(100, ((totalPoints - tier.minPoints) / (nextTier.minPoints - tier.minPoints)) * 100)
    : 100;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Hey, {firstName} 👋</h1>
        <p className="text-muted-foreground">What do you want to study today?</p>
      </div>

      <Link
        href="/achievements"
        className="flex items-center gap-4 rounded-2xl border bg-card px-6 py-4 max-w-3xl mx-auto w-full shadow-sm hover:shadow-md transition-shadow"
      >
        <span className="text-3xl">{tier.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <p className="font-semibold">{tier.name}</p>
            <p className="text-sm text-muted-foreground">{totalPoints} pts</p>
          </div>
          <div className="mt-1.5 flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            {nextTier ? (
              <span className="text-xs text-muted-foreground shrink-0">
                {nextTier.minPoints - totalPoints} pts to {nextTier.icon} {nextTier.name}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground shrink-0">Max rank!</span>
            )}
          </div>
        </div>
      </Link>

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
              {tool.maxPts && (
                <span className="text-xs font-semibold rounded-full bg-primary/10 text-primary px-2.5 py-0.5">
                  up to {tool.maxPts} pts
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
