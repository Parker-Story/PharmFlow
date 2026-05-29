"use client";

import { useState } from "react";
import { Bug, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitBugReport } from "@/lib/actions/bug-reports";

export default function ReportBugPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await submitBugReport(title, description);
    setLoading(false);
    if (res.success) {
      setSubmitted(true);
    } else {
      setError(res.error ?? "Something went wrong.");
    }
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto py-24 flex flex-col items-center gap-4 text-center">
        <CheckCircle className="h-12 w-12 text-green-600" />
        <h1 className="text-2xl font-bold">Report submitted</h1>
        <p className="text-muted-foreground">Thanks for letting us know. We'll look into it.</p>
        <Button variant="outline" onClick={() => { setSubmitted(false); setTitle(""); setDescription(""); }}>
          Submit another
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Bug className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Report a Bug</h1>
          <p className="text-sm text-muted-foreground">Describe what happened and we'll take a look.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Title <span className="text-muted-foreground font-normal">(optional)</span></label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Exam generation freezes on upload"
            className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Description <span className="text-red-500">*</span></label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What were you doing when it happened? What did you expect vs. what occurred?"
            rows={6}
            required
            className="w-full rounded-xl border bg-background px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" disabled={loading || !description.trim()} className="w-full">
          {loading ? "Submitting..." : "Submit Report"}
        </Button>
      </form>
    </div>
  );
}
