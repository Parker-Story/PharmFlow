"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FolderOpen } from "lucide-react";
import { FolderCard } from "./folder-card";
import { ExamRow } from "./exam-row";
import { NotecardSetRow } from "./notecard-set-row";
import { SummaryRow } from "./summary-row";
import { moveItem } from "@/lib/actions/library";
import { cn } from "@/lib/utils";
import type { Quiz, Folder as FolderType, NotecardSet, Summary } from "@/types/database";

type ItemType = "quiz" | "notecard_set" | "summary" | "folder";
type DragItem = { id: string; type: ItemType };

interface LibraryGridProps {
  folders: FolderType[];
  exams: Quiz[];
  notecardSets: NotecardSet[];
  summaries: Summary[];
  latestScores: Record<string, { score: number; total: number }>;
  currentFolderId?: string | null;
}

export function LibraryGrid({
  folders,
  exams,
  notecardSets,
  summaries,
  latestScores,
  currentFolderId,
}: LibraryGridProps) {
  const [dragging, setDragging] = useState<DragItem | null>(null);
  const [overFolderId, setOverFolderId] = useState<string | null>(null);
  const [overRoot, setOverRoot] = useState(false);
  const [, startTransition] = useTransition();
  const router = useRouter();

  function drop(targetFolderId: string | null) {
    if (!dragging) return;
    if (dragging.type === "folder" && dragging.id === targetFolderId) return;
    const item = dragging;
    setDragging(null);
    setOverFolderId(null);
    setOverRoot(false);
    startTransition(async () => {
      await moveItem(item.id, item.type, targetFolderId);
      router.refresh();
    });
  }

  const hasContent = folders.length > 0 || exams.length > 0 || notecardSets.length > 0 || summaries.length > 0;

  return (
    <div>
      {/* Root drop zone — only visible inside a subfolder when dragging */}
      {dragging && currentFolderId && (
        <div
          onDragOver={(e) => { e.preventDefault(); setOverRoot(true); }}
          onDragLeave={() => setOverRoot(false)}
          onDrop={(e) => { e.preventDefault(); drop(null); }}
          className={cn(
            "mb-6 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed p-4 text-sm transition-colors",
            overRoot
              ? "border-primary bg-primary/5 text-primary"
              : "border-muted-foreground/30 text-muted-foreground"
          )}
        >
          <FolderOpen className="h-4 w-4" />
          Move to library root
        </div>
      )}

      {folders.length > 0 && (
        <section className="space-y-3 mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-primary">Folders</h2>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {folders.map((folder) => (
              <div
                key={folder.id}
                draggable
                onDragStart={(e) => { e.stopPropagation(); setDragging({ id: folder.id, type: "folder" }); }}
                onDragEnd={() => { setDragging(null); setOverFolderId(null); }}
                onDragOver={(e) => { e.preventDefault(); if (dragging?.id !== folder.id) setOverFolderId(folder.id); }}
                onDragLeave={() => setOverFolderId(null)}
                onDrop={(e) => { e.preventDefault(); if (dragging?.id !== folder.id) drop(folder.id); }}
                className={cn(
                  "rounded-xl transition-all",
                  dragging?.id === folder.id && "opacity-40",
                  overFolderId === folder.id && "ring-2 ring-primary ring-offset-1"
                )}
              >
                <FolderCard folder={folder} />
              </div>
            ))}
          </div>
        </section>
      )}

      {exams.length > 0 && (
        <section className="space-y-3 mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-primary">Practice Exams</h2>
          <div className="space-y-2">
            {exams.map((exam) => (
              <div
                key={exam.id}
                draggable
                onDragStart={() => setDragging({ id: exam.id, type: "quiz" })}
                onDragEnd={() => setDragging(null)}
                className={cn("cursor-grab active:cursor-grabbing", dragging?.id === exam.id && "opacity-40")}
              >
                <ExamRow exam={exam} lastScore={latestScores[exam.id]} />
              </div>
            ))}
          </div>
        </section>
      )}

      {notecardSets.length > 0 && (
        <section className="space-y-3 mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-primary">Notecard Sets</h2>
          <div className="space-y-2">
            {notecardSets.map((set) => (
              <div
                key={set.id}
                draggable
                onDragStart={() => setDragging({ id: set.id, type: "notecard_set" })}
                onDragEnd={() => setDragging(null)}
                className={cn("cursor-grab active:cursor-grabbing", dragging?.id === set.id && "opacity-40")}
              >
                <NotecardSetRow set={set} />
              </div>
            ))}
          </div>
        </section>
      )}

      {summaries.length > 0 && (
        <section className="space-y-3 mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-primary">Summaries</h2>
          <div className="space-y-2">
            {summaries.map((s) => (
              <div
                key={s.id}
                draggable
                onDragStart={() => setDragging({ id: s.id, type: "summary" })}
                onDragEnd={() => setDragging(null)}
                className={cn("cursor-grab active:cursor-grabbing", dragging?.id === s.id && "opacity-40")}
              >
                <SummaryRow summary={s} />
              </div>
            ))}
          </div>
        </section>
      )}

      {!hasContent && (
        <p className="text-sm text-muted-foreground py-8 text-center">
          {currentFolderId
            ? "No files in this folder yet."
            : "No files here yet. Generate an exam or notecard set and save it to the library."}
        </p>
      )}
    </div>
  );
}
