import { createClient } from "@/lib/supabase/server";
import { NewFolderForm } from "@/components/library/new-folder-form";
import { FolderCard } from "@/components/library/folder-card";
import { ExamRow } from "@/components/library/exam-row";
import type { Quiz, Folder as FolderType } from "@/types/database";

export const metadata = { title: "Library — PharmFlow" };

export default async function LibraryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: rawFolders }, { data: rawExams }] = await Promise.all([
    supabase.from("folders").select("*").eq("user_id", user!.id).is("parent_id", null).order("created_at"),
    supabase.from("quizzes").select("*").eq("user_id", user!.id).is("folder_id", null).order("created_at", { ascending: false }),
  ]);

  const folders = (rawFolders ?? []) as FolderType[];
  const exams = (rawExams ?? []) as Quiz[];

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

      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-primary">Files</h2>
        {exams.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No files here yet. Generate an exam from the Practice Exam Generator and save it.
          </p>
        ) : (
          <div className="space-y-2">
            {exams.map((exam) => (
              <ExamRow key={exam.id} exam={exam} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
