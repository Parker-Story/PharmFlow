"use client";

import { useTransition } from "react";
import Link from "next/link";
import { FileText, Clock, CheckCircle, AlertCircle, Loader2, Folder } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { moveExamToFolder } from "@/lib/actions/library";
import { formatDistanceToNow } from "@/lib/utils/date";
import type { Quiz, Folder as FolderType } from "@/types/database";

interface ExamCardProps {
  exam: Quiz;
  folders: FolderType[];
}

const statusConfig = {
  ready: { icon: CheckCircle, label: "Ready", className: "bg-green-100 text-green-700" },
  processing: { icon: Loader2, label: "Processing", className: "bg-yellow-100 text-yellow-700" },
  failed: { icon: AlertCircle, label: "Failed", className: "bg-red-100 text-red-700" },
};

export function ExamCard({ exam, folders }: ExamCardProps) {
  const [isPending, startTransition] = useTransition();
  const status = statusConfig[exam.status];
  const StatusIcon = status.icon;

  function handleFolderChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const folderId = e.target.value || null;
    startTransition(async () => {
      await moveExamToFolder(exam.id, folderId);
    });
  }

  return (
    <Card className="flex flex-col transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <FileText className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <CardTitle className="flex-1 text-base leading-snug">{exam.title}</CardTitle>
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}>
            <StatusIcon className={`h-3 w-3 ${exam.status === "processing" ? "animate-spin" : ""}`} />
            {status.label}
          </span>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-3 space-y-2">
        <p className="text-sm text-muted-foreground truncate">{exam.source_filename}</p>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>{exam.question_count} questions</span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDistanceToNow(exam.created_at)}
          </span>
        </div>

        {folders.length > 0 && (
          <div className="flex items-center gap-1.5">
            <Folder className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <select
              value={exam.folder_id ?? ""}
              onChange={handleFolderChange}
              disabled={isPending}
              className="flex-1 text-xs bg-transparent text-muted-foreground border-0 outline-none cursor-pointer hover:text-foreground disabled:opacity-50"
            >
              <option value="">No folder</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
        )}
      </CardContent>

      <CardFooter>
        {exam.status === "ready" ? (
          <Button asChild className="w-full" size="sm">
            <Link href={`/quiz/${exam.id}`}>Start Exam</Link>
          </Button>
        ) : (
          <Button variant="outline" className="w-full" size="sm" disabled>
            {exam.status === "processing" ? "Generating…" : "Unavailable"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
