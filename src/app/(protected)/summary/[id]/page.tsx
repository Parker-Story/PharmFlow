import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "@/lib/utils/date";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SummaryPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: summary } = await supabase
    .from("summaries")
    .select("*")
    .eq("id", id)
    .eq("user_id", user!.id)
    .single();

  if (!summary) notFound();

  const backHref = summary.folder_id ? `/library/${summary.folder_id}` : "/library";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href={backHref}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            Library
          </Link>
        </Button>
      </div>

      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 mt-1">
          <BookText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{summary.title}</h1>
          <p className="text-sm text-muted-foreground">
            {summary.source_filename} · {formatDistanceToNow(summary.created_at)}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-6">
        <p className="text-base leading-relaxed">{summary.content}</p>
      </div>
    </div>
  );
}
