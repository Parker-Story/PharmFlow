"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Trophy, Shuffle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { saveQuizAttempt } from "@/lib/actions/quiz";
import type { QuizWithQuestions, QuizQuestion } from "@/types/quiz";

interface QuizPlayerProps {
  quiz: QuizWithQuestions;
  initialAnswers?: Record<string, string>;
  initialSubmitted?: boolean;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function QuizPlayer({ quiz, initialAnswers = {}, initialSubmitted = false }: QuizPlayerProps) {
  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers);
  const [submitted, setSubmitted] = useState(initialSubmitted);
  const [isShuffled, setIsShuffled] = useState(false);
  const [displayQuestions, setDisplayQuestions] = useState<QuizQuestion[]>(quiz.questions);

  function handleToggleShuffle() {
    if (isShuffled) {
      setIsShuffled(false);
      setDisplayQuestions(quiz.questions);
    } else {
      setIsShuffled(true);
      setDisplayQuestions(shuffleArray(quiz.questions));
    }
  }

  async function handleSubmit() {
    const score = displayQuestions.filter((q) => answers[q.id] === q.correctAnswer).length;
    const answersArray = displayQuestions.map((q) => ({
      questionId: q.id,
      selectedAnswer: answers[q.id] ?? "",
      isCorrect: answers[q.id] === q.correctAnswer,
    }));

    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });

    saveQuizAttempt(quiz.id, score, displayQuestions.length, answersArray).catch(console.error);
  }

  function handleRestart() {
    setAnswers({});
    setSubmitted(false);
    setDisplayQuestions(isShuffled ? shuffleArray(quiz.questions) : quiz.questions);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleSelect(questionId: string, option: string) {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  }

  const score = displayQuestions.filter((q) => answers[q.id] === q.correctAnswer).length;
  const percent = Math.round((score / displayQuestions.length) * 100);

  return (
    <div className="space-y-5">
      {!submitted && (
        <div className="flex justify-end">
          <Button
            variant={isShuffled ? "default" : "outline"}
            size="sm"
            onClick={handleToggleShuffle}
          >
            <Shuffle className="mr-2 h-4 w-4" />
            {isShuffled ? "Shuffled" : "Shuffle"}
          </Button>
        </div>
      )}

      {submitted && (
        <div className="rounded-xl border bg-card p-6 text-center">
          <Trophy className="mx-auto mb-3 h-10 w-10 text-yellow-400" />
          <h2 className="text-3xl font-bold">{percent}%</h2>
          <p className="text-muted-foreground">
            {score} / {displayQuestions.length} correct
          </p>
          <p className="mt-2 text-sm font-medium">
            {percent >= 80
              ? "Excellent work!"
              : percent >= 60
              ? "Good effort. Keep studying!"
              : "Keep practicing, you'll get there!"}
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <Button onClick={handleRestart} size="sm" variant="outline">
              Retake
            </Button>
            <a href={`/quiz/${quiz.id}/print?mode=answers`} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Answer Key PDF
              </Button>
            </a>
          </div>
        </div>
      )}

      {displayQuestions.map((question, i) => {
        const options =
          question.options ??
          (question.questionType === "true_false" ? ["True", "False"] : []);
        const selected = answers[question.id];
        const isCorrect = submitted && selected === question.correctAnswer;
        const isUnanswered = submitted && !selected;

        return (
          <div key={question.id} className="rounded-xl border bg-card p-5">
            <div className="mb-4 flex items-start gap-3">
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  !submitted && "bg-primary/10 text-primary",
                  submitted && isCorrect && "bg-green-100 text-green-700",
                  submitted && !isCorrect && "bg-red-100 text-red-700"
                )}
              >
                {i + 1}
              </span>
              <p className="text-sm font-medium leading-relaxed">
                {question.questionText}
              </p>
            </div>

            <div className="space-y-2 pl-9">
              {options.map((option) => {
                const isSelected = selected === option;
                const isCorrectOption = option === question.correctAnswer;

                return (
                  <button
                    key={option}
                    onClick={() => handleSelect(question.id, option)}
                    disabled={submitted}
                    className={cn(
                      "w-full rounded-lg border p-3 text-left text-sm transition-all disabled:cursor-default",
                      !submitted && !isSelected && "border-border hover:border-primary/50 hover:bg-primary/5",
                      !submitted && isSelected && "border-primary bg-primary/5",
                      submitted && isCorrectOption && "border-green-500 bg-green-50 text-green-800",
                      submitted && isSelected && !isCorrectOption && "border-red-400 bg-red-50 text-red-800",
                      submitted && !isSelected && !isCorrectOption && "border-border opacity-50"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span>{option}</span>
                      {submitted && isCorrectOption && (
                        <CheckCircle className="h-4 w-4 shrink-0 text-green-600" />
                      )}
                      {submitted && isSelected && !isCorrectOption && (
                        <XCircle className="h-4 w-4 shrink-0 text-red-500" />
                      )}
                    </div>
                  </button>
                );
              })}

              {submitted && (
                <div
                  className={cn(
                    "mt-1 rounded-lg p-3 text-sm",
                    isCorrect ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                  )}
                >
                  {isUnanswered && (
                    <span className="font-medium">
                      Not answered. Correct answer: {question.correctAnswer}.{" "}
                    </span>
                  )}
                  {!isUnanswered && !isCorrect && (
                    <span className="font-medium">
                      Correct answer: {question.correctAnswer}.{" "}
                    </span>
                  )}
                  {question.explanation && (
                    <>
                      {(isUnanswered || !isCorrect) && " "}
                      {question.explanation}
                    </>
                  )}
                  {isCorrect && !question.explanation && (
                    <span className="font-medium">Correct!</span>
                  )}
                  {isCorrect && question.explanation && question.explanation}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {!submitted ? (
        <Button onClick={handleSubmit} className="w-full" size="lg">
          Check Answers
        </Button>
      ) : (
        <Button onClick={handleRestart} variant="outline" className="w-full" size="lg">
          Retake
        </Button>
      )}
    </div>
  );
}
