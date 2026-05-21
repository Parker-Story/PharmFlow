"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Shuffle, BookOpen, Edit, RotateCcw, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { NotecardItem } from "@/types/notecards";

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

interface NotecardPlayerProps {
  setId: string;
  cards: NotecardItem[];
}

export function NotecardPlayer({ setId, cards }: NotecardPlayerProps) {
  const [queue, setQueue] = useState<NotecardItem[]>(cards);
  const [known, setKnown] = useState<Set<string>>(new Set());
  const [isFlipped, setIsFlipped] = useState(false);
  const [animState, setAnimState] = useState<"idle" | "out" | "in">("idle");
  const [isShuffled, setIsShuffled] = useState(false);
  const [showBackFirst, setShowBackFirst] = useState(false);

  const pendingAction = useRef<"know" | "dontknow" | null>(null);

  const isDone = queue.length === 0;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (isDone) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
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
  }, [isDone, animState, isFlipped]); // eslint-disable-line react-hooks/exhaustive-deps

  function toggleShuffle() {
    if (!isShuffled) {
      setQueue((q) => shuffleArray(q));
    } else {
      setQueue((q) => {
        const remaining = new Set(q.map((c) => c.id));
        return cards.filter((c) => remaining.has(c.id));
      });
    }
    setIsShuffled((v) => !v);
  }

  function handleCardAction(action: "know" | "dontknow") {
    if (animState !== "idle") return;
    pendingAction.current = action;
    setAnimState("out");
  }

  function handleAnimationEnd() {
    if (animState === "out") {
      const action = pendingAction.current;
      const [head, ...rest] = queue;
      if (action === "know") {
        setKnown((k) => new Set([...k, head.id]));
        setQueue(rest);
      } else {
        setQueue([...rest, head]);
      }
      pendingAction.current = null;
      setIsFlipped(false);
      setAnimState("in");
    } else if (animState === "in") {
      setAnimState("idle");
    }
  }

  function restart(withCards: NotecardItem[]) {
    const ordered = [...withCards].sort((a, b) => a.orderIndex - b.orderIndex);
    setQueue(isShuffled ? shuffleArray(ordered) : ordered);
    setKnown(new Set());
    setIsFlipped(false);
    setAnimState("idle");
    pendingAction.current = null;
  }

  if (isDone) {
    const missedCards = cards.filter((c) => !known.has(c.id));

    return (
      <div className="flex flex-col items-center justify-center py-16 gap-6 text-center">
        <div className="text-6xl font-bold">{known.size} / {cards.length}</div>
        <p className="text-muted-foreground text-lg">cards known this round</p>
        <div className="flex flex-wrap gap-3 justify-center">
          {missedCards.length > 0 && (
            <Button onClick={() => restart(missedCards)} variant="outline" size="lg">
              <RotateCcw className="mr-2 h-4 w-4" />
              Study Missed ({missedCards.length})
            </Button>
          )}
          <Button onClick={() => restart(cards)} size="lg">
            <RotateCcw className="mr-2 h-4 w-4" />
            Start Over
          </Button>
        </div>
      </div>
    );
  }

  const card = queue[0];
  const displayFront = showBackFirst ? card.back : card.front;
  const displayBack = showBackFirst ? card.front : card.back;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleShuffle}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              isShuffled
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            <Shuffle className="h-3.5 w-3.5" />
            Shuffle
          </button>
          <button
            type="button"
            onClick={() => setShowBackFirst((v) => !v)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              showBackFirst
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            <BookOpen className="h-3.5 w-3.5" />
            Definition First
          </button>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/notecards/${setId}/edit`}>
            <Edit className="mr-1 h-3.5 w-3.5" />
            Edit Set
          </Link>
        </Button>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        {queue.length} remaining · {known.size} known
      </div>

      <div
        className={cn(
          "cursor-pointer select-none rounded-2xl border bg-card shadow-md min-h-[280px] flex flex-col items-center justify-center p-8 text-center",
          animState === "out" && "flip-out",
          animState === "in" && "flip-in",
          animState === "idle" && "hover:shadow-lg transition-all hover:-translate-y-0.5"
        )}
        onClick={() => {
          if (animState === "idle") setIsFlipped((v) => !v);
        }}
        onAnimationEnd={handleAnimationEnd}
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
          {isFlipped
            ? (showBackFirst ? "Term" : "Definition")
            : (showBackFirst ? "Definition" : "Term")}
        </p>
        <p className="text-xl font-medium leading-relaxed max-w-prose">
          {isFlipped ? displayBack : displayFront}
        </p>
        {!isFlipped && (
          <p className="mt-6 text-xs text-muted-foreground">Click or press Space to flip</p>
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
