import { createClient } from "@/lib/supabase/server";
import { NewFolderForm } from "@/components/library/new-folder-form";
import { LibraryGrid } from "@/components/library/library-grid";
import type { Quiz, Folder as FolderType, NotecardSet, Summary } from "@/types/database";

export const metadata = { title: "Library | PharmFlow" };

export default async function LibraryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: rawFolders }, { data: rawExams }, { data: rawNotecardSets }, { data: rawSummaries }] = await Promise.all([
    supabase.from("folders").select("*").eq("user_id", user!.id).is("parent_id", null).order("created_at"),
    supabase.from("quizzes").select("*").eq("user_id", user!.id).is("folder_id", null).order("created_at", { ascending: false }),
    supabase.from("notecard_sets").select("*").eq("user_id", user!.id).is("folder_id", null).order("created_at", { ascending: false }),
    supabase.from("summaries").select("*").eq("user_id", user!.id).is("folder_id", null).order("created_at", { ascending: false }),
  ]);

  const folders = (rawFolders ?? []) as FolderType[];
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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">All Files</h1>
        <NewFolderForm />
      </div>
      <LibraryGrid
        folders={folders}
        exams={exams}
        notecardSets={notecardSets}
        summaries={summaries}
        latestScores={latestScoresObj}
      />
    </div>
  );
}
