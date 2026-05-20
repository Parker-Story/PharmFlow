import Link from "next/link";
import { FileText, Clock } from "lucide-react";
import { formatDistanceToNow } from "@/lib/utils/date";
import type { Quiz } from "@/types/database";

interface ExamRowProps {
  exam: Quiz;
}

export function ExamRow({ exam }: ExamRowProps) {
  const content = (
    <div className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3 hover:shadow-sm transition-shadow">
      <FileText className="h-4 w-4 shrink-0 text-primary/70" />
      <span className="flex-1 text-sm font-medium truncate">{exam.title}</span>
      <span className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
        <Clock className="h-3 w-3" />
        {formatDistanceToNow(exam.created_at)}
      </span>
      {exam.status !== "ready" && (
        <span className="text-xs text-muted-foreground capitalize">{exam.status}</span>
      )}
    </div>
  );

  if (exam.status !== "ready") return <div className="opacity-60 cursor-not-allowed">{content}</div>;

  return <Link href={`/quiz/${exam.id}`}>{content}</Link>;
}
