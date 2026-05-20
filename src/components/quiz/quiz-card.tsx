import Link from "next/link";
import { FileText, Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Quiz } from "@/types/database";
import { formatDistanceToNow } from "@/lib/utils/date";

interface QuizCardProps {
  quiz: Quiz;
}

const statusConfig = {
  ready: { icon: CheckCircle, label: "Ready", className: "bg-green-100 text-green-700" },
  processing: { icon: Loader2, label: "Processing", className: "bg-yellow-100 text-yellow-700" },
  failed: { icon: AlertCircle, label: "Failed", className: "bg-red-100 text-red-700" },
};

export function QuizCard({ quiz }: QuizCardProps) {
  const status = statusConfig[quiz.status];
  const StatusIcon = status.icon;

  return (
    <Card className="flex flex-col transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <FileText className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <CardTitle className="flex-1 text-base leading-snug">
            {quiz.title}
          </CardTitle>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}
          >
            <StatusIcon className={`h-3 w-3 ${quiz.status === "processing" ? "animate-spin" : ""}`} />
            {status.label}
          </span>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        <p className="text-sm text-muted-foreground truncate">
          {quiz.source_filename}
        </p>
        <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
          <span>{quiz.question_count} questions</span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDistanceToNow(quiz.created_at)}
          </span>
        </div>
      </CardContent>

      <CardFooter>
        {quiz.status === "ready" ? (
          <Button asChild className="w-full" size="sm">
            <Link href={`/quiz/${quiz.id}`}>Start Quiz</Link>
          </Button>
        ) : (
          <Button variant="outline" className="w-full" size="sm" disabled>
            {quiz.status === "processing" ? "Generating…" : "Unavailable"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
