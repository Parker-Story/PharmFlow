import Link from "next/link";
import { Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { QuizCard } from "@/components/quiz/quiz-card";
import type { Quiz } from "@/types/database";

export const metadata = { title: "My Quizzes — PharmFlow" };

export default async function QuizzesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: rawQuizzes } = await supabase
    .from("quizzes")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });
  const quizzes = rawQuizzes as Quiz[] | null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Quizzes</h1>
          <p className="text-muted-foreground">
            {quizzes?.length ?? 0} quiz{quizzes?.length !== 1 ? "zes" : ""}
          </p>
        </div>
        <Button asChild>
          <Link href="/upload">
            <Upload className="mr-2 h-4 w-4" />
            New Quiz
          </Link>
        </Button>
      </div>

      {!quizzes || quizzes.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          <p>No quizzes yet — upload a PDF to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))}
        </div>
      )}
    </div>
  );
}
