import Link from "next/link";
import { FileText, StickyNote, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Dashboard — PharmFlow" };

const tools = [
  {
    title: "Practice Exam Generator",
    description: "Upload a lecture PDF and generate a practice exam",
    icon: FileText,
    href: "/upload",
    available: true,
  },
  {
    title: "Notecard Generator",
    description: "Upload a lecture PDF and generate flashcards to study",
    icon: StickyNote,
    href: "/notecards/create",
    available: true,
  },
  ...Array.from({ length: 7 }, () => ({
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
