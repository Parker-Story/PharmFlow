import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { NewFolderForm } from "@/components/library/new-folder-form";
import { FolderCard } from "@/components/library/folder-card";
import { ExamRow } from "@/components/library/exam-row";
import { Button } from "@/components/ui/button";
import type { Quiz, Folder } from "@/types/database";

interface PageProps {
  params: Promise<{ folderId: string }>;
}

export default async function FolderPage({ params }: PageProps) {
  const { folderId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: rawFolder }, { data: rawSubfolders }, { data: rawExams }] = await Promise.all([
    supabase.from("folders").select("*").eq("id", folderId).eq("user_id", user!.id).single(),
    supabase.from("folders").select("*").eq("user_id", user!.id).eq("parent_id", folderId).order("created_at"),
    supabase.from("quizzes").select("*").eq("folder_id", folderId).eq("user_id", user!.id).order("created_at", { ascending: false }),
  ]);

  if (!rawFolder) notFound();

  const folder = rawFolder as Folder;
  const subfolders = (rawSubfolders ?? []) as Folder[];
  const exams = (rawExams ?? []) as Quiz[];

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

      {subfolders.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-primary">Folders</h2>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {subfolders.map((sub) => (
              <FolderCard key={sub.id} folder={sub} />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-primary">Files</h2>
        {exams.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No files in this folder yet.
          </p>
        ) : (
          <div className="space-y-2">
            {exams.map((exam) => (
              <ExamRow key={exam.id} exam={exam} lastScore={latestScores.get(exam.id)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
