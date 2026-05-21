import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PrintControls } from "./auto-print";
import type { Quiz, Question } from "@/types/database";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mode?: string }>;
}

const LETTERS = ["A", "B", "C", "D", "E"];

function getAnswerLabel(questionType: string, correctAnswer: string, options: string[] | null): string {
  if (questionType === "true_false") return correctAnswer;
  const idx = (options ?? []).indexOf(correctAnswer);
  return idx >= 0 ? LETTERS[idx] : correctAnswer;
}

export default async function PrintPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { mode } = await searchParams;
  const isAnswerKey = mode === "answers";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: rawQuiz } = await supabase
    .from("quizzes")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  const quiz = rawQuiz as Quiz | null;
  if (!quiz) notFound();

  const { data: rawQuestions } = await supabase
    .from("questions")
    .select("*")
    .eq("quiz_id", id)
    .order("order_index");
  const questions = (rawQuestions ?? []) as Question[];

  return (
    <div className="min-h-screen bg-white">
      <PrintControls />

      <div className="max-w-2xl mx-auto px-8 py-10">
        {/* Header */}
        <div className="mb-8 pb-4 border-b border-gray-300">
          <h1 className="text-xl font-bold text-gray-900">{quiz.title}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {isAnswerKey ? "Answer Key" : quiz.source_filename} · {questions.length} questions
          </p>
        </div>

        {isAnswerKey ? (
          <>
            {/* Compact answer grid */}
            <div className="mb-8">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">Answers</h2>
              <div className="flex flex-wrap gap-x-6 gap-y-1">
                {questions.map((q, i) => {
                  const options = Array.isArray(q.options) ? (q.options as string[]) : null;
                  const label = getAnswerLabel(q.question_type, q.correct_answer, options);
                  return (
                    <span key={q.id} className="text-sm font-mono">
                      {i + 1}. {label}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Explanations */}
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">Explanations</h2>
              <div className="space-y-4">
                {questions.map((q, i) => {
                  const options = Array.isArray(q.options) ? (q.options as string[]) : null;
                  const label = getAnswerLabel(q.question_type, q.correct_answer, options);
                  return (
                    <div key={q.id} className="text-sm">
                      <span className="font-semibold text-gray-900">
                        {i + 1}. ({label})
                      </span>{" "}
                      <span className="text-gray-700">{q.question_text}</span>
                      {q.explanation && (
                        <p className="mt-1 text-gray-500 pl-5">{q.explanation}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-7">
            {questions.map((q, i) => {
              const options: string[] = Array.isArray(q.options)
                ? (q.options as string[])
                : q.question_type === "true_false"
                ? ["True", "False"]
                : [];
              return (
                <div key={q.id}>
                  <p className="text-sm font-semibold text-gray-900 mb-2">
                    {i + 1}. {q.question_text}
                  </p>
                  <div className="space-y-1 pl-4">
                    {options.map((opt, j) => (
                      <p key={opt} className="text-sm text-gray-700">
                        {LETTERS[j]}. {opt}
                      </p>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
