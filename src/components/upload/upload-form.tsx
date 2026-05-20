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

export function UploadForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    setError(null);
    if (file.type !== "application/pdf") {
      setError("Please select a PDF file.");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError(`File must be under ${MAX_SIZE_MB} MB.`);
      return;
    }
    setSelectedFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedFile) return;
    setError(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      // Fake progress animation while server processes
      const interval = setInterval(
        () => setProgress((p) => Math.min(p + 8, 85)),
        400
      );

      const result = await processUploadedPdf(formData);
      clearInterval(interval);

      if (result.success) {
        setProgress(100);
        setDone(true);
        setTimeout(
          () => router.push(result.quizId ? `/quiz/${result.quizId}` : "/quizzes"),
          1200
        );
      } else {
        setProgress(0);
        setError(result.error ?? "Something went wrong.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1.5">
        <Label htmlFor="title">Quiz title</Label>
        <Input
          id="title"
          name="title"
          placeholder="e.g. Pharmacokinetics Week 4"
          required
        />
      </div>

      {/* Drop zone */}
      <div
        className={cn(
          "relative rounded-xl border-2 border-dashed p-8 text-center transition-colors",
          dragActive
            ? "border-primary bg-primary/5"
            : selectedFile
            ? "border-green-400 bg-green-50"
            : "border-muted-foreground/25 hover:border-primary/50"
        )}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => !selectedFile && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          name="file"
          accept="application/pdf"
          className="sr-only"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />

        {selectedFile ? (
          <div className="flex items-center justify-center gap-3">
            <FileText className="h-8 w-8 text-green-600 shrink-0" />
            <div className="text-left min-w-0">
              <p className="font-medium truncate">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setError(null); }}
              className="ml-auto text-muted-foreground hover:text-destructive"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <div className="cursor-pointer">
            <Upload className="mx-auto h-10 w-10 text-muted-foreground/50" />
            <p className="mt-3 font-medium">Drop your PDF here</p>
            <p className="mt-1 text-sm text-muted-foreground">
              or click to browse — max {MAX_SIZE_MB} MB
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

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
                Extracting text and generating questions — this takes ~15–30 seconds
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {done && (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="h-5 w-5" />
          <span className="font-medium">Quiz created! Redirecting…</span>
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={!selectedFile || isPending}
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
            Generate Quiz
          </>
        )}
      </Button>
    </form>
  );
}
