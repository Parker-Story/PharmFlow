import { createClient } from "@/lib/supabase/server";
import { NewFolderForm } from "@/components/library/new-folder-form";
import { FolderCard } from "@/components/library/folder-card";
import { ExamRow } from "@/components/library/exam-row";
import { NotecardSetRow } from "@/components/library/notecard-set-row";
import { SummaryRow } from "@/components/library/summary-row";
import type { Quiz, Folder as FolderType, NotecardSet, Summary } from "@/types/database";

export const metadata = { title: "Library — PharmFlow" };

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

  const hasFiles = exams.length > 0 || notecardSets.length > 0 || summaries.length > 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">All Files</h1>
        <NewFolderForm />
      </div>

      {folders.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-primary">Folders</h2>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {folders.map((folder) => (
              <FolderCard key={folder.id} folder={folder} />
            ))}
          </div>
        </section>
      )}

      {exams.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-primary">Practice Exams</h2>
          <div className="space-y-2">
            {exams.map((exam) => (
              <ExamRow key={exam.id} exam={exam} lastScore={latestScores.get(exam.id)} />
            ))}
          </div>
        </section>
      )}

      {notecardSets.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-primary">Notecard Sets</h2>
          <div className="space-y-2">
            {notecardSets.map((set) => (
              <NotecardSetRow key={set.id} set={set} />
            ))}
          </div>
        </section>
      )}

      {summaries.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-primary">Summaries</h2>
          <div className="space-y-2">
            {summaries.map((s) => (
              <SummaryRow key={s.id} summary={s} />
            ))}
          </div>
        </section>
      )}

      {!hasFiles && folders.length === 0 && (
        <p className="text-sm text-muted-foreground py-8 text-center">
          No files here yet. Generate an exam or notecard set and save it to the library.
        </p>
      )}
    </div>
  );
}
