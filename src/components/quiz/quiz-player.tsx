"use client";

import { useState } from "react";
import { CheckCircle, XCircle, ChevronRight, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { QuizWithQuestions, QuizAttemptAnswer } from "@/types/quiz";

interface QuizPlayerProps {
  quiz: QuizWithQuestions;
}

type Phase = "question" | "answer" | "results";

export function QuizPlayer({ quiz }: QuizPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("question");
  const [selected, setSelected] = useState<string | null>(null);
  const [answers, setAnswers] = useState<QuizAttemptAnswer[]>([]);

  const question = quiz.questions[currentIndex];
  const isLast = currentIndex === quiz.questions.length - 1;
  const score = answers.filter((a) => a.isCorrect).length;
  const percent = Math.round((currentIndex / quiz.questions.length) * 100);

  function handleSelect(option: string) {
    if (phase !== "question") return;
    setSelected(option);
    setPhase("answer");

    setAnswers((prev) => [
      ...prev,
      {
        questionId: question.id,
        selectedAnswer: option,
        isCorrect: option === question.correctAnswer,
      },
    ]);
  }

  function handleNext() {
    if (isLast) {
      setPhase("results");
    } else {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
      setPhase("question");
    }
  }

  function handleRestart() {
    setCurrentIndex(0);
    setPhase("question");
    setSelected(null);
    setAnswers([]);
  }

  if (phase === "results") {
    const finalScore = answers.filter((a) => a.isCorrect).length;
    const finalPercent = Math.round((finalScore / quiz.questions.length) * 100);

    return (
      <div className="flex flex-col items-center gap-6 py-8 text-center">
        <Trophy className="h-16 w-16 text-yellow-400" />
        <div>
          <h2 className="text-3xl font-bold">{finalPercent}%</h2>
          <p className="text-muted-foreground">
            {finalScore} / {quiz.questions.length} correct
          </p>
        </div>

        <div className="w-full max-w-xs">
          <Progress value={finalPercent} className="h-3" />
        </div>

        <p className="text-lg font-medium">
          {finalPercent >= 80
            ? "Excellent work! 🎉"
            : finalPercent >= 60
            ? "Good effort — keep studying!"
            : "Keep practicing, you'll get there!"}
        </p>

        <Button onClick={handleRestart} size="lg">
          Try Again
        </Button>
      </div>
    );
  }

  const options = question.options ??
    (question.questionType === "true_false" ? ["True", "False"] : []);

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            Question {currentIndex + 1} of {quiz.questions.length}
          </span>
          {phase === "answer" && (
            <span className="font-medium">
              {score} correct so far
            </span>
          )}
        </div>
        <Progress value={percent} className="h-2" />
      </div>

      {/* Question */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium leading-relaxed">
            {question.questionText}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {options.map((option) => {
            const isSelected = selected === option;
            const isCorrect = option === question.correctAnswer;
            const showResult = phase === "answer";

            return (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                disabled={phase === "answer"}
                className={cn(
                  "w-full rounded-lg border p-3 text-left text-sm transition-all",
                  "hover:border-primary/50 hover:bg-primary/5",
                  "disabled:cursor-default",
                  showResult && isCorrect && "border-green-500 bg-green-50 text-green-800",
                  showResult && isSelected && !isCorrect && "border-red-400 bg-red-50 text-red-800",
                  !showResult && "border-border"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span>{option}</span>
                  {showResult && isCorrect && (
                    <CheckCircle className="h-4 w-4 shrink-0 text-green-600" />
                  )}
                  {showResult && isSelected && !isCorrect && (
                    <XCircle className="h-4 w-4 shrink-0 text-red-500" />
                  )}
                </div>
              </button>
            );
          })}

          {phase === "answer" && question.explanation && (
            <div className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
              <span className="font-medium">Explanation: </span>
              {question.explanation}
            </div>
          )}
        </CardContent>
      </Card>

      {phase === "answer" && (
        <Button onClick={handleNext} className="w-full" size="lg">
          {isLast ? "See Results" : "Next Question"}
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
