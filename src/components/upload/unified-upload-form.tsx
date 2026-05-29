"use client";

import { useState, useTransition, useRef } from "react";
import Link from "next/link";
import {
  Upload, FileText, X, Loader2, CheckCircle,
  FileQuestion, StickyNote, BookText, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { processUnifiedUpload, type UnifiedUploadResult } from "@/lib/actions/upload";
import { cn } from "@/lib/utils";

const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

type Difficulty = "easy" | "medium" | "hard";
type QuestionType = "multiple_choice" | "true_false" | "mix";

function SegmentedControl({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-1 rounded-lg bg-muted p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
            value === opt.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        checked ? "bg-primary" : "bg-muted-foreground/30"
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}

interface UnifiedUploadFormProps {
  folders: { id: string; name: string }[];
  initialGenerate?: string;
}

export function UnifiedUploadForm({ folders, initialGenerate }: UnifiedUploadFormProps) {
  const [isPending, startTransition] = useTransition();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<UnifiedUploadResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Generator toggles — pre-select based on query param, or all three if none
  const initial = initialGenerate ?? "all";
  const [genExam, setGenExam] = useState(initial === "all" || initial === "exam");
  const [genNotecards, setGenNotecards] = useState(initial === "all" || initial === "notecards");
  const [genSummary, setGenSummary] = useState(initial === "all" || initial === "summary");

  // Exam options
  const [questionCount, setQuestionCount] = useState(20);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [questionType, setQuestionType] = useState<QuestionType>("mix");

  // Notecard options
  const [cardCount, setCardCount] = useState(20);

  // Shared
  const [folderId, setFolderId] = useState("");

  function addFiles(incoming: FileList | File[]) {
    setError(null);
    const toAdd: File[] = [];
    for (const file of Array.from(incoming)) {
      if (file.type !== "application/pdf") { setError(`${file.name} is not a PDF.`); continue; }
      if (file.size > MAX_SIZE_BYTES) { setError(`${file.name} must be under ${MAX_SIZE_MB} MB.`); continue; }
      toAdd.push(file);
    }
    setSelectedFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name));
      return [...prev, ...toAdd.filter((f) => !existing.has(f.name))];
    });
  }

  function removeFile(name: string) {
    setSelectedFiles((prev) => prev.filter((f) => f.name !== name));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (selectedFiles.length === 0) return;
    setError(null);

    const formData = new FormData(e.currentTarget);
    selectedFiles.forEach((f) => formData.append("file", f));
    formData.set("generate_exam", genExam ? "true" : "false");
    formData.set("generate_notecards", genNotecards ? "true" : "false");
    formData.set("generate_summary", genSummary ? "true" : "false");
    formData.set("question_count", String(questionCount));
    formData.set("difficulty", difficulty);
    formData.set("question_type", questionType);
    formData.set("card_count", String(cardCount));
    if (folderId) formData.set("folder_id", folderId);

    startTransition(async () => {
      const interval = setInterval(() => setProgress((p) => Math.min(p + 6, 85)), 500);
      const res = await processUnifiedUpload(formData);
      clearInterval(interval);

      if (res.success) {
        setProgress(100);
        setResult(res);
      } else {
        setProgress(0);
        setError(res.error ?? "Something went wrong.");
      }
    });
  }

  if (result) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="h-6 w-6" />
          <span className="text-lg font-semibold">All done!</span>
        </div>
        <div className="space-y-3">
          {result.examId && (
            <Link
              href={`/quiz/${result.examId}`}
              className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3 hover:shadow-sm transition-shadow"
            >
              <FileQuestion className="h-5 w-5 text-primary/70 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">Practice Exam ready</p>
                <p className="text-xs text-muted-foreground">Take your exam →</p>
              </div>
            </Link>
          )}
          {result.notecardSetId && (
            <Link
              href={`/notecards/${result.notecardSetId}`}
              className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3 hover:shadow-sm transition-shadow"
            >
              <StickyNote className="h-5 w-5 text-primary/70 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">Notecards ready</p>
                <p className="text-xs text-muted-foreground">Start studying →</p>
              </div>
            </Link>
          )}
          {result.summaryId && (
            <Link
              href={`/summary/${result.summaryId}`}
              className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3 hover:shadow-sm transition-shadow"
            >
              <BookText className="h-5 w-5 text-primary/70 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">Summary ready</p>
                <p className="text-xs text-muted-foreground">Read your summary →</p>
              </div>
            </Link>
          )}
        </div>
        <Button variant="outline" asChild className="w-full">
          <Link href="/library">Go to Library</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" placeholder="e.g. Pharmacokinetics Week 4" required />
      </div>

      {/* Generator sections */}
      <div className="space-y-3">
        <Label className="text-xs text-muted-foreground">Generate</Label>

        {/* Exam */}
        <div className={cn("rounded-xl border transition-colors", genExam ? "border-primary/40 bg-primary/5" : "bg-muted/20")}>
          <div className="flex items-center gap-3 px-4 py-3">
            <FileQuestion className="h-4 w-4 text-primary/70 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">Practice Exam</p>
              <p className="text-xs text-muted-foreground">Multiple choice &amp; true/false questions</p>
            </div>
            <Toggle checked={genExam} onChange={() => setGenExam((v) => !v)} />
          </div>
          {genExam && (
            <div className="border-t px-4 pb-4 pt-3 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Questions</Label>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setQuestionCount((c) => Math.max(5, c - 5))}
                      className="flex h-8 w-8 items-center justify-center rounded-md border bg-background text-lg font-medium hover:bg-accent disabled:opacity-40"
                      disabled={questionCount <= 5}>−</button>
                    <span className="w-8 text-center text-sm font-semibold">{questionCount}</span>
                    <button type="button" onClick={() => setQuestionCount((c) => Math.min(50, c + 5))}
                      className="flex h-8 w-8 items-center justify-center rounded-md border bg-background text-lg font-medium hover:bg-accent disabled:opacity-40"
                      disabled={questionCount >= 50}>+</button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Difficulty</Label>
                  <SegmentedControl
                    options={[{ label: "Easy", value: "easy" }, { label: "Med", value: "medium" }, { label: "Hard", value: "hard" }]}
                    value={difficulty}
                    onChange={(v) => setDifficulty(v as Difficulty)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Question type</Label>
                <SegmentedControl
                  options={[{ label: "Multiple Choice", value: "multiple_choice" }, { label: "True / False", value: "true_false" }, { label: "Mix", value: "mix" }]}
                  value={questionType}
                  onChange={(v) => setQuestionType(v as QuestionType)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Notecards */}
        <div className={cn("rounded-xl border transition-colors", genNotecards ? "border-primary/40 bg-primary/5" : "bg-muted/20")}>
          <div className="flex items-center gap-3 px-4 py-3">
            <StickyNote className="h-4 w-4 text-primary/70 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">Notecards</p>
              <p className="text-xs text-muted-foreground">Flashcards with Know It / Don&apos;t Know flow</p>
            </div>
            <Toggle checked={genNotecards} onChange={() => setGenNotecards((v) => !v)} />
          </div>
          {genNotecards && (
            <div className="border-t px-4 pb-4 pt-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Cards</Label>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setCardCount((c) => Math.max(10, c - 5))}
                    className="flex h-8 w-8 items-center justify-center rounded-md border bg-background text-lg font-medium hover:bg-accent disabled:opacity-40"
                    disabled={cardCount <= 10}>−</button>
                  <span className="w-8 text-center text-sm font-semibold">{cardCount}</span>
                  <button type="button" onClick={() => setCardCount((c) => Math.min(60, c + 5))}
                    className="flex h-8 w-8 items-center justify-center rounded-md border bg-background text-lg font-medium hover:bg-accent disabled:opacity-40"
                    disabled={cardCount >= 60}>+</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className={cn("rounded-xl border transition-colors", genSummary ? "border-primary/40 bg-primary/5" : "bg-muted/20")}>
          <div className="flex items-center gap-3 px-4 py-3">
            <BookText className="h-4 w-4 text-primary/70 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">Summary</p>
              <p className="text-xs text-muted-foreground">5-sentence overview of key concepts</p>
            </div>
            <Toggle checked={genSummary} onChange={() => setGenSummary((v) => !v)} />
          </div>
        </div>
      </div>

      {/* Folder */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Save to folder</Label>
        <select
          value={folderId}
          onChange={(e) => setFolderId(e.target.value)}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Library root</option>
          {folders.map((f) => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>
      </div>

      {/* Drop zone */}
      <div
        className={cn(
          "rounded-xl border-2 border-dashed p-6 text-center transition-colors",
          dragActive ? "border-primary bg-primary/5"
            : selectedFiles.length > 0 ? "border-green-400 bg-green-50"
            : "border-muted-foreground/25 hover:border-primary/50"
        )}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => { e.preventDefault(); setDragActive(false); addFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          multiple
          className="sr-only"
          onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ""; }}
        />
        {selectedFiles.length > 0 ? (
          <div className="space-y-2">
            {selectedFiles.map((file) => (
              <div key={file.name} className="flex items-center gap-3 rounded-lg bg-white/70 px-3 py-2 text-left">
                <FileText className="h-4 w-4 text-green-600 shrink-0" />
                <span className="flex-1 text-sm font-medium truncate">{file.name}</span>
                <span className="text-xs text-muted-foreground shrink-0">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                <button type="button" onClick={(e) => { e.stopPropagation(); removeFile(file.name); }}
                  className="text-muted-foreground hover:text-destructive">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <p className="pt-1 text-xs text-muted-foreground">Click or drop to add more PDFs</p>
          </div>
        ) : (
          <div className="cursor-pointer py-2">
            <Upload className="mx-auto h-10 w-10 text-muted-foreground/50" />
            <p className="mt-3 font-medium">Drop your PDFs here</p>
            <p className="mt-1 text-sm text-muted-foreground">
              or click to browse. Multiple files supported, max {MAX_SIZE_MB} MB each
            </p>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {isPending && (
        <Card className="border-0 bg-primary/5">
          <CardContent className="pt-4 pb-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Processing lecture…</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Extracting text and running AI. This takes about 20-40 seconds.
            </p>
          </CardContent>
        </Card>
      )}

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={selectedFiles.length === 0 || (!genExam && !genNotecards && !genSummary) || isPending}
      >
        {isPending ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing…</>
        ) : (
          <><Upload className="mr-2 h-4 w-4" />Generate</>
        )}
      </Button>
    </form>
  );
}
