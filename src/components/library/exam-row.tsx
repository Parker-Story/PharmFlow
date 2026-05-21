"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { FileText, Clock, MoreHorizontal } from "lucide-react";
import { formatDistanceToNow } from "@/lib/utils/date";
import { deleteQuiz } from "@/lib/actions/quiz";
import { Button } from "@/components/ui/button";
import type { Quiz } from "@/types/database";

interface ExamRowProps {
  exam: Quiz;
  lastScore?: { score: number; total: number };
}

export function ExamRow({ exam, lastScore }: ExamRowProps) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const lastPercent = lastScore ? Math.round((lastScore.score / lastScore.total) * 100) : null;

  function handleDelete() {
    startTransition(async () => {
      await deleteQuiz(exam.id);
    });
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
        <FileText className="h-4 w-4 shrink-0 text-red-400" />
        <span className="flex-1 text-sm font-medium text-red-800 truncate">
          Delete &ldquo;{exam.title}&rdquo;?
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setConfirming(false)}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleDelete}
          disabled={isPending}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          {isPending ? "Deleting…" : "Delete"}
        </Button>
      </div>
    );
  }

  return (
    <div className={`group relative flex items-center gap-3 rounded-xl border bg-card px-4 py-3 transition-shadow ${exam.status !== "ready" ? "opacity-60 cursor-not-allowed" : "hover:shadow-sm"}`}>
      {exam.status === "ready" && (
        <Link href={`/quiz/${exam.id}`} className="absolute inset-0 rounded-xl" />
      )}
      <FileText className="relative z-10 h-4 w-4 shrink-0 text-primary/70" />
      <span className="relative z-10 flex-1 text-sm font-medium truncate">{exam.title}</span>
      {lastPercent !== null && (
        <span className="relative z-10 text-xs font-medium text-muted-foreground whitespace-nowrap">
          Last: {lastPercent}%
        </span>
      )}
      <span className="relative z-10 text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
        <Clock className="h-3 w-3" />
        {formatDistanceToNow(exam.created_at)}
      </span>
      {exam.status !== "ready" && (
        <span className="relative z-10 text-xs text-muted-foreground capitalize">{exam.status}</span>
      )}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setConfirming(true);
        }}
        className="relative z-10 ml-1 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-50 hover:text-red-600"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
    </div>
  );
}
