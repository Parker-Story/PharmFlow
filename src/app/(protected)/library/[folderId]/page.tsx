import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { NewFolderForm } from "@/components/library/new-folder-form";
import { LibraryGrid } from "@/components/library/library-grid";
import { Button } from "@/components/ui/button";
import type { Quiz, Folder, NotecardSet, Summary } from "@/types/database";

interface PageProps {
  params: Promise<{ folderId: string }>;
}

export default async function FolderPage({ params }: PageProps) {
  const { folderId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: rawFolder }, { data: rawSubfolders }, { data: rawExams }, { data: rawNotecardSets }, { data: rawSummaries }] = await Promise.all([
    supabase.from("folders").select("*").eq("id", folderId).eq("user_id", user!.id).single(),
    supabase.from("folders").select("*").eq("user_id", user!.id).eq("parent_id", folderId).order("created_at"),
    supabase.from("quizzes").select("*").eq("folder_id", folderId).eq("user_id", user!.id).order("created_at", { ascending: false }),
    supabase.from("notecard_sets").select("*").eq("folder_id", folderId).eq("user_id", user!.id).order("created_at", { ascending: false }),
    supabase.from("summaries").select("*").eq("folder_id", folderId).eq("user_id", user!.id).order("created_at", { ascending: false }),
  ]);

  if (!rawFolder) notFound();

  const folder = rawFolder as Folder;
  const subfolders = (rawSubfolders ?? []) as Folder[];
  const exams = (rawExams ?? []) as Quiz[];
  const notecardSets = (rawNotecardSets ?? []) as NotecardSet[];
  const summaries = (rawSummaries ?? []) as Summary[];

  const quizIds = exams.map((e) => e.id);
  const { data: rawAttempts } = quizIds.length > 0
    ? await supabase
        .from("quiz_attempts")
        .select("quiz_id, score, total_questions, completed_at")
        .eq("user_id", user!.id)
        .in("quiz_id", quizIds)
        .order("completed_at", { ascending: false })
    : { data: [] };

  const latestScores = new Map<string, { score: number; total: number }>();
  for (const a of (rawAttempts ?? []) as { quiz_id: string; score: number | null; total_questions: number }[]) {
    if (!latestScores.has(a.quiz_id) && a.score !== null) {
      latestScores.set(a.quiz_id, { score: a.score, total: a.total_questions });
    }
  }

  const latestScoresObj: Record<string, { score: number; total: number }> = {};
  for (const [k, v] of latestScores) latestScoresObj[k] = v;

  const parentHref = folder.parent_id ? `/library/${folder.parent_id}` : "/library";

  return (
    <div className="space-y-8">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
          <Link href={parentHref}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            {folder.parent_id ? "Back" : "All Files"}
          </Link>
        </Button>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{folder.name}</h1>
          <NewFolderForm parentId={folderId} />
        </div>
      </div>
      <LibraryGrid
        folders={subfolders}
        exams={exams}
        notecardSets={notecardSets}
        summaries={summaries}
        latestScores={latestScoresObj}
        currentFolderId={folderId}
      />
    </div>
  );
}
