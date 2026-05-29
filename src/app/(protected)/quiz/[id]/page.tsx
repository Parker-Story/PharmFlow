import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { QuizPlayer } from "@/components/quiz/quiz-player";
import { Button } from "@/components/ui/button";
import type { Quiz, Question } from "@/types/database";
import type { QuizWithQuestions } from "@/types/quiz";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("quizzes")
    .select("title")
    .eq("id", id)
    .single();
  const row = data as { title: string } | null;
  return { title: row ? `${row.title} | PharmFlow` : "Quiz | PharmFlow" };
}

export default async function QuizPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: rawQuiz } = await supabase
    .from("quizzes")
    .select("*")
    .eq("id", id)
    .eq("user_id", user!.id)
    .single();
  const quiz = rawQuiz as Quiz | null;

  if (!quiz) notFound();

  const { data: rawQuestions } = await supabase
    .from("questions")
    .select("*")
    .eq("quiz_id", id)
    .order("order_index");
  const questions = rawQuestions as Question[] | null;

  const quizWithQuestions: QuizWithQuestions = {
    id: quiz.id,
    title: quiz.title,
    sourceFilename: quiz.source_filename,
    questionCount: quiz.question_count,
    status: quiz.status,
    createdAt: quiz.created_at,
    questions: (questions ?? []).map((q) => ({
      id: q.id,
      questionText: q.question_text,
      questionType: q.question_type,
      options: Array.isArray(q.options) ? (q.options as string[]) : undefined,
      correctAnswer: q.correct_answer,
      explanation: q.explanation ?? undefined,
      orderIndex: q.order_index,
    })),
  };

  if (quiz.status === "processing") {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <div className="mb-4 text-4xl">⏳</div>
        <h1 className="text-xl font-bold">{quiz.title}</h1>
        <p className="mt-2 text-muted-foreground">
          This quiz is still being generated. Check back in a moment.
        </p>
        <Button asChild variant="outline" className="mt-6">
          <Link href="/library">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Library
          </Link>
        </Button>
      </div>
    );
  }

  if (quiz.status === "failed") {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <div className="mb-4 text-4xl">😔</div>
        <h1 className="text-xl font-bold">Generation Failed</h1>
        <p className="mt-2 text-muted-foreground">
          Something went wrong processing this quiz. Try uploading again.
        </p>
        <Button asChild className="mt-6">
          <Link href="/upload">Upload Again</Link>
        </Button>
      </div>
    );
  }

  const { data: rawAttempts } = await supabase
    .from("quiz_attempts")
    .select("answers")
    .eq("quiz_id", id)
    .eq("user_id", user!.id)
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false })
    .limit(1);

  const initialAnswers: Record<string, string> = {};
  const latestAttempt = (rawAttempts ?? [])[0] ?? null;
  if (latestAttempt?.answers && Array.isArray(latestAttempt.answers)) {
    for (const a of latestAttempt.answers as { questionId: string; selectedAnswer: string }[]) {
      if (a.selectedAnswer) initialAnswers[a.questionId] = a.selectedAnswer;
    }
  }
  const hasInitialAnswers = Object.keys(initialAnswers).length > 0;

  if (quizWithQuestions.questions.length === 0) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <div className="mb-4 text-4xl">📭</div>
        <h1 className="text-xl font-bold">No questions yet</h1>
        <p className="mt-2 text-muted-foreground">
          AI generation is not yet configured. Wire up an LLM provider in{" "}
          <code className="text-primary">src/lib/ai/generate.ts</code> to
          generate real questions.
        </p>
        <Button asChild variant="outline" className="mt-6">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Dashboard
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <Button asChild variant="ghost" size="sm" className="-ml-2">
            <Link href="/library">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Library
            </Link>
          </Button>
          <a href={`/quiz/${quiz.id}/print?mode=exam`} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">
              <Download className="mr-1.5 h-4 w-4" />
              Download Exam
            </Button>
          </a>
        </div>
        <h1 className="text-2xl font-bold">{quiz.title}</h1>
        <p className="text-sm text-muted-foreground">{quiz.source_filename}</p>
      </div>

      <QuizPlayer quiz={quizWithQuestions} initialAnswers={initialAnswers} initialSubmitted={hasInitialAnswers} />
    </div>
  );
}
