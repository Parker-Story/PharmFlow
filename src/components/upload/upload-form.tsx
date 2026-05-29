"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, X, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { processUploadedPdf } from "@/lib/actions/quiz";
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

interface UploadFormProps {
  folders: { id: string; name: string }[];
}

export function UploadForm({ folders }: UploadFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [questionCount, setQuestionCount] = useState(20);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [questionType, setQuestionType] = useState<QuestionType>("mix");
  const [saveExam, setSaveExam] = useState(true);
  const [folderId, setFolderId] = useState("");
  const [createNotecardSet, setCreateNotecardSet] = useState(false);

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

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    addFiles(e.dataTransfer.files);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (selectedFiles.length === 0) return;
    setError(null);

    const formData = new FormData(e.currentTarget);
    selectedFiles.forEach((f) => formData.append("file", f));
    formData.set("question_count", String(questionCount));
    formData.set("difficulty", difficulty);
    formData.set("question_type", questionType);
    formData.set("save_exam", saveExam ? "true" : "false");
    if (saveExam && folderId) formData.set("folder_id", folderId);
    if (saveExam) formData.set("create_notecard_set", createNotecardSet ? "true" : "false");

    const title = (formData.get("title") as string) || "Practice Exam";

    startTransition(async () => {
      const interval = setInterval(
        () => setProgress((p) => Math.min(p + 8, 85)),
        400
      );

      const result = await processUploadedPdf(formData);
      clearInterval(interval);

      if (result.success) {
        setProgress(100);
        setDone(true);
        if (result.isOneOff) {
          sessionStorage.setItem(
            "pharmflow_temp_quiz",
            JSON.stringify({ title, questions: result.questions ?? [] })
          );
          setTimeout(() => router.push("/quiz/temp"), 1200);
        } else {
          setTimeout(
            () => router.push(result.quizId ? `/quiz/${result.quizId}` : "/quizzes"),
            1200
          );
        }
      } else {
        setProgress(0);
        setError(result.error ?? "Something went wrong.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1.5">
        <Label htmlFor="title">Exam title</Label>
        <Input
          id="title"
          name="title"
          placeholder="e.g. Pharmacokinetics Week 4"
          required
        />
      </div>

      {/* Options */}
      <div className="rounded-xl bg-muted/40 p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Questions</Label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQuestionCount((c) => Math.max(5, c - 5))}
                className="flex h-8 w-8 items-center justify-center rounded-md border bg-background text-lg font-medium hover:bg-accent disabled:opacity-40"
                disabled={questionCount <= 5}
              >
                −
              </button>
              <span className="w-8 text-center text-sm font-semibold">{questionCount}</span>
              <button
                type="button"
                onClick={() => setQuestionCount((c) => Math.min(50, c + 5))}
                className="flex h-8 w-8 items-center justify-center rounded-md border bg-background text-lg font-medium hover:bg-accent disabled:opacity-40"
                disabled={questionCount >= 50}
              >
                +
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Difficulty</Label>
            <SegmentedControl
              options={[
                { label: "Easy", value: "easy" },
                { label: "Medium", value: "medium" },
                { label: "Hard", value: "hard" },
              ]}
              value={difficulty}
              onChange={(v) => setDifficulty(v as Difficulty)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Question type</Label>
          <SegmentedControl
            options={[
              { label: "Multiple Choice", value: "multiple_choice" },
              { label: "True / False", value: "true_false" },
              { label: "Mix", value: "mix" },
            ]}
            value={questionType}
            onChange={(v) => setQuestionType(v as QuestionType)}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Results</Label>
          <SegmentedControl
            options={[
              { label: "Save to Library", value: "true" },
              { label: "One-off", value: "false" },
            ]}
            value={saveExam ? "true" : "false"}
            onChange={(v) => setSaveExam(v === "true")}
          />
          <p className="text-xs text-muted-foreground">
            {saveExam
              ? "Exam will be saved so you can retake it later."
              : "Exam runs once and is not stored."}
          </p>
        </div>

        {saveExam && (
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
        )}

        {saveExam && (
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Also create a Notecard Set?</p>
              <p className="text-xs text-muted-foreground">Auto-named, 20 cards from the same PDF</p>
            </div>
            <button
              type="button"
              onClick={() => setCreateNotecardSet((v) => !v)}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                createNotecardSet ? "bg-primary" : "bg-muted-foreground/30"
              )}
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 rounded-full bg-white shadow transition-transform",
                  createNotecardSet ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
          </div>
        )}
      </div>

      {/* Drop zone */}
      <div
        className={cn(
          "relative rounded-xl border-2 border-dashed p-6 text-center transition-colors",
          dragActive
            ? "border-primary bg-primary/5"
            : selectedFiles.length > 0
            ? "border-green-400 bg-green-50"
            : "border-muted-foreground/25 hover:border-primary/50"
        )}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          name="file"
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
                <span className="text-xs text-muted-foreground shrink-0">
                  {(file.size / 1024 / 1024).toFixed(1)} MB
                </span>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeFile(file.name); }}
                  className="text-muted-foreground hover:text-destructive"
                >
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
          <CardContent className="pt-4 pb-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {done ? "Done!" : "Processing lecture…"}
                </span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Extracting text and generating questions. This takes about 15-30 seconds.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {done && (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="h-5 w-5" />
          <span className="font-medium">
            {saveExam ? "Exam saved! Redirecting…" : "Exam ready! Redirecting…"}
          </span>
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={selectedFiles.length === 0 || isPending}
        size="lg"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing…
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Generate Exam
          </>
        )}
      </Button>
    </form>
  );
}
