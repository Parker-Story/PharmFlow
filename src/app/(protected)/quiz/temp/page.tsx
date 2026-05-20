"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { QuizPlayer } from "@/components/quiz/quiz-player";
import { Button } from "@/components/ui/button";
import type { QuizWithQuestions } from "@/types/quiz";

export default function TempQuizPage() {
  const router = useRouter();
  const [quiz, setQuiz] = useState<QuizWithQuestions | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("pharmflow_temp_quiz");
    if (!raw) {
      router.replace("/dashboard");
      return;
    }
    const data = JSON.parse(raw) as { title: string; questions: QuizWithQuestions["questions"] };
    sessionStorage.removeItem("pharmflow_temp_quiz");
    setQuiz({
      id: "temp",
      title: data.title,
      sourceFilename: "",
      questionCount: data.questions.length,
      status: "ready",
      createdAt: new Date().toISOString(),
      questions: data.questions,
    });
    setReady(true);
  }, [router]);

  if (!ready) return null;

  if (!quiz || quiz.questions.length === 0) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center space-y-4">
        <div className="text-4xl">📭</div>
        <p className="font-medium">No questions generated yet</p>
        <p className="text-sm text-muted-foreground">
          AI generation is not yet configured. Wire up an LLM provider in{" "}
          <code className="text-primary">src/lib/ai/generate.ts</code> to generate real questions.
        </p>
        <Button asChild variant="outline">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Dashboard
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
          <Link href="/dashboard">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Dashboard
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">{quiz.title}</h1>
        <p className="text-sm text-muted-foreground">
          {quiz.questionCount} questions · One-off exam
        </p>
      </div>
      <QuizPlayer quiz={quiz} />
    </div>
  );
}
