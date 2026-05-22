"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { RotateCcw, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TOP_200 } from "@/data/top200";

const LS_KEY = "pf_top200";

interface PersistedState {
  selectedIds: number[];
  studyMode: boolean;
  studyQueue: number[];
  studyKnown: number[];
}

export function Top200Study() {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [studyMode, setStudyMode] = useState(false);
  const [studyQueue, setStudyQueue] = useState<number[]>([]);
  const [studyKnown, setStudyKnown] = useState<Set<number>>(new Set());
  const [isFlipped, setIsFlipped] = useState(false);
  const [animState, setAnimState] = useState<"idle" | "out" | "in">("idle");

  const pendingAction = useRef<"know" | "dontknow" | null>(null);
  const loaded = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const data: PersistedState = JSON.parse(raw);
        setSelectedIds(new Set(data.selectedIds ?? []));
        setStudyMode(data.studyMode ?? false);
        setStudyQueue(data.studyQueue ?? []);
        setStudyKnown(new Set(data.studyKnown ?? []));
      }
    } catch {}
    loaded.current = true;
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    const data: PersistedState = {
      selectedIds: [...selectedIds],
      studyMode,
      studyQueue,
      studyKnown: [...studyKnown],
    };
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  }, [selectedIds, studyMode, studyQueue, studyKnown]);

  useEffect(() => {
    if (!studyMode || studyQueue.length === 0) return;
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement) return;
      if (e.code === "Space") {
        e.preventDefault();
        if (animState === "idle") setIsFlipped((v) => !v);
      } else if (e.code === "ArrowRight" && isFlipped && animState === "idle") {
        handleCardAction("know");
      } else if (e.code === "ArrowLeft" && isFlipped && animState === "idle") {
        handleCardAction("dontknow");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [studyMode, studyQueue.length, animState, isFlipped]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredDrugs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return TOP_200;
    return TOP_200.filter(
      (d) =>
        d.generic.toLowerCase().includes(q) ||
        d.brand.toLowerCase().includes(q) ||
        d.drugClass.toLowerCase().includes(q) ||
        d.use.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  function toggleSelect(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectShown() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      filteredDrugs.forEach((d) => next.add(d.id));
      return next;
    });
  }

  function deselectShown() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      filteredDrugs.forEach((d) => next.delete(d.id));
      return next;
    });
  }

  function startStudy() {
    const ids = TOP_200.filter((d) => selectedIds.has(d.id) && d.generic).map((d) => d.id);
    setStudyQueue(ids);
    setStudyKnown(new Set());
    setIsFlipped(false);
    setAnimState("idle");
    setStudyMode(true);
  }

  function handleCardAction(action: "know" | "dontknow") {
    if (animState !== "idle") return;
    pendingAction.current = action;
    setAnimState("out");
  }

  function handleAnimationEnd() {
    if (animState === "out") {
      const action = pendingAction.current;
      const [head, ...rest] = studyQueue;
      if (action === "know") {
        setStudyKnown((k) => new Set([...k, head]));
        setStudyQueue(rest);
      } else {
        setStudyQueue([...rest, head]);
      }
      pendingAction.current = null;
      setIsFlipped(false);
      setAnimState("in");
    } else if (animState === "in") {
      setAnimState("idle");
    }
  }

  function restartStudy(ids: number[]) {
    setStudyQueue([...ids]);
    setStudyKnown(new Set());
    setIsFlipped(false);
    setAnimState("idle");
    pendingAction.current = null;
  }

  function exitStudy() {
    setStudyMode(false);
    setStudyQueue([]);
    setStudyKnown(new Set());
  }

  // ── Study mode ──────────────────────────────────────────────────────────────
  if (studyMode) {
    const allIds = TOP_200.filter((d) => selectedIds.has(d.id) && d.generic).map((d) => d.id);
    const total = allIds.length;

    if (studyQueue.length === 0) {
      const missedIds = allIds.filter((id) => !studyKnown.has(id));
      return (
        <div className="flex flex-col items-center justify-center py-16 gap-6 text-center">
          <div className="text-6xl font-bold">{studyKnown.size} / {total}</div>
          <p className="text-muted-foreground text-lg">cards known this round</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {missedIds.length > 0 && (
              <Button onClick={() => restartStudy(missedIds)} variant="outline" size="lg">
                <RotateCcw className="mr-2 h-4 w-4" />
                Study Missed ({missedIds.length})
              </Button>
            )}
            <Button onClick={() => restartStudy(allIds)} size="lg">
              <RotateCcw className="mr-2 h-4 w-4" />
              Start Over
            </Button>
            <Button onClick={exitStudy} variant="ghost" size="lg">
              Back to List
            </Button>
          </div>
        </div>
      );
    }

    const currentId = studyQueue[0];
    const drug = TOP_200.find((d) => d.id === currentId)!;
    const done = total - studyQueue.length;

    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <button
            onClick={exitStudy}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to list
          </button>
          <span className="text-sm text-muted-foreground">
            {done + 1} / {total}
          </span>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          {studyQueue.length} remaining · {studyKnown.size} known
        </div>

        <div
          className={cn(
            "cursor-pointer select-none rounded-2xl border bg-card shadow-md min-h-[300px] flex flex-col items-center justify-center p-8",
            animState === "out" && "flip-out",
            animState === "in" && "flip-in",
            animState === "idle" && "hover:shadow-lg transition-all hover:-translate-y-0.5"
          )}
          onClick={() => {
            if (animState === "idle") setIsFlipped((v) => !v);
          }}
          onAnimationEnd={handleAnimationEnd}
        >
          {!isFlipped ? (
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                #{drug.id}
              </p>
              <p className="text-2xl font-bold leading-snug">{drug.generic}</p>
              <p className="text-base text-muted-foreground mt-2">{drug.brand}</p>
              <p className="mt-8 text-xs text-muted-foreground">Click or press Space to flip</p>
            </div>
          ) : (
            <div className="w-full max-w-sm space-y-4">
              {drug.drugClass && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-0.5">Class</p>
                  <p className="text-sm">{drug.drugClass}</p>
                </div>
              )}
              {drug.forms && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-0.5">Dosage Forms</p>
                  <p className="text-sm">{drug.forms}</p>
                </div>
              )}
              {drug.use && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-0.5">Use</p>
                  <p className="text-sm">{drug.use}</p>
                </div>
              )}
              {drug.facts && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-0.5">Key Facts</p>
                  <p className="text-sm">{drug.facts}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {isFlipped && animState === "idle" && (
          <div className="space-y-2">
            <div className="flex gap-3 justify-center">
              <Button
                size="lg"
                variant="outline"
                onClick={() => handleCardAction("dontknow")}
                className="flex-1 max-w-[200px] border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Don&apos;t Know
              </Button>
              <Button
                size="lg"
                onClick={() => handleCardAction("know")}
                className="flex-1 max-w-[200px] bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Know It
              </Button>
            </div>
            <p className="text-center text-xs text-muted-foreground">← Don&apos;t Know · Know It →</p>
          </div>
        )}
      </div>
    );
  }

  // ── Selection mode ───────────────────────────────────────────────────────────
  const isSearching = searchQuery.trim().length > 0;
  const selectBtnLabel = isSearching ? `Select Shown (${filteredDrugs.length})` : "Select All";

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Top 200 Drugs</h1>
          <p className="text-sm text-muted-foreground">{selectedIds.size} of 200 selected</p>
        </div>
        <Button disabled={selectedIds.size === 0} onClick={startStudy} size="lg">
          Study Selected ({selectedIds.size})
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          placeholder="Search by name, brand, class, or use..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 rounded-xl border bg-background px-4 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={selectShown}>
            {selectBtnLabel}
          </Button>
          <Button variant="outline" size="sm" onClick={deselectShown}>
            {isSearching ? "Deselect Shown" : "Deselect All"}
          </Button>
        </div>
      </div>

      <div className="space-y-1">
        {filteredDrugs.length === 0 && (
          <p className="text-sm text-muted-foreground py-8 text-center">No drugs match your search.</p>
        )}
        {filteredDrugs.map((drug) => (
          <label
            key={drug.id}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-3 cursor-pointer transition-colors border",
              selectedIds.has(drug.id)
                ? "bg-primary/10 border-primary/20"
                : "hover:bg-muted/60 border-transparent"
            )}
          >
            <input
              type="checkbox"
              checked={selectedIds.has(drug.id)}
              onChange={() => toggleSelect(drug.id)}
              className="h-4 w-4 rounded accent-primary shrink-0"
            />
            <span className="text-xs text-muted-foreground w-7 shrink-0 font-mono text-right">
              {drug.id}
            </span>
            <div className="flex flex-1 min-w-0 items-baseline gap-3">
              <span className="text-sm font-medium shrink-0">{drug.generic}</span>
              <span className="text-xs text-muted-foreground truncate">{drug.brand}</span>
            </div>
            <span className="text-xs text-muted-foreground truncate hidden lg:block max-w-[220px] shrink-0">
              {drug.drugClass}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
