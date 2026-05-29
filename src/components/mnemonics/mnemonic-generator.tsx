"use client";

import { useState } from "react";
import { Sparkles, Copy, Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { generateMnemonicAction } from "@/lib/actions/mnemonics";

type Focus = "list" | "mechanism" | "side_effects";

const FOCUS_OPTIONS: { value: Focus; label: string; description: string }[] = [
  { value: "list", label: "Remember the List", description: "Mnemonic for memorizing the group of drugs" },
  { value: "mechanism", label: "Mechanism of Action", description: "Mnemonic for how these drugs work" },
  { value: "side_effects", label: "Side Effects", description: "Mnemonic for key adverse effects" },
];

export function MnemonicGenerator() {
  const [input, setInput] = useState("");
  const [focus, setFocus] = useState<Focus>("list");
  const [result, setResult] = useState<{ mnemonic: string; explanation: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    const drugs = input
      .split(/[\n,]+/)
      .map((d) => d.trim())
      .filter(Boolean);

    if (drugs.length === 0) {
      setError("Enter at least one drug name.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const res = await generateMnemonicAction(drugs, focus);
    setLoading(false);

    if ("error" in res) {
      setError(res.error);
    } else {
      setResult(res);
    }
  }

  async function handleCopy() {
    if (!result) return;
    await navigator.clipboard.writeText(`${result.mnemonic}\n\n${result.explanation}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Mnemonic Generator</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Enter a group of drugs and get a quirky, memorable mnemonic to make them stick.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1.5 block">Drug Names</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={"Enter drug names, one per line or comma-separated:\nMetformin\nGlipizide\nSitagliptin"}
            rows={5}
            className="w-full rounded-xl border bg-background px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Focus</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {FOCUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFocus(opt.value)}
                className={cn(
                  "rounded-xl border px-4 py-3 text-left text-sm transition-colors",
                  focus === opt.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:bg-muted/60"
                )}
              >
                <p className="font-medium">{opt.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <Button onClick={handleGenerate} disabled={loading} size="lg" className="w-full">
          <Sparkles className="mr-2 h-4 w-4" />
          {loading ? "Generating..." : "Generate Mnemonic"}
        </Button>
      </div>

      {result && (
        <div className="rounded-2xl border bg-card shadow-sm p-6 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <p className="text-lg font-semibold leading-snug whitespace-pre-wrap">{result.mnemonic}</p>
            <button
              onClick={handleCopy}
              className="shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Copy"
            >
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <div className="border-t pt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">How it maps</p>
            <p className="text-sm text-muted-foreground">{result.explanation}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerate}
            disabled={loading}
            className="w-full"
          >
            <RotateCcw className="mr-2 h-3.5 w-3.5" />
            Regenerate
          </Button>
        </div>
      )}
    </div>
  );
}
