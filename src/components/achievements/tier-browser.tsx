"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TIERS } from "@/data/achievements";
import type { Tier } from "@/data/achievements";
import { cn } from "@/lib/utils";

interface TierBrowserProps {
  currentTier: Tier;
  totalPoints: number;
  nextTier: Tier | null;
  progressPct: number;
}

export function TierBrowser({ currentTier, totalPoints, nextTier, progressPct }: TierBrowserProps) {
  const [open, setOpen] = useState(false);
  const [viewIndex, setViewIndex] = useState(TIERS.findIndex((t) => t.name === currentTier.name));
  const viewing = TIERS[viewIndex];
  const isCurrentTier = viewing.name === currentTier.name;
  const isUnlocked = totalPoints >= viewing.minPoints;

  return (
    <div className="rounded-2xl border bg-card p-6 space-y-4">
      {/* Current rank row */}
      <div className="flex items-center gap-5">
        <span className="text-5xl">{currentTier.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">Current Rank</p>
          <p className="text-2xl font-bold">{currentTier.name}</p>
          <div className="mt-2 flex items-center gap-3">
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progressPct}%` }} />
            </div>
            <span className="text-sm text-muted-foreground shrink-0">
              {nextTier ? `${totalPoints} / ${nextTier.minPoints} pts` : `${totalPoints} pts`}
            </span>
          </div>
          {nextTier ? (
            <p className="text-xs text-muted-foreground mt-1">
              Next: {nextTier.icon} {nextTier.name} ({nextTier.minPoints - totalPoints} pts away)
            </p>
          ) : (
            <p className="text-xs text-muted-foreground mt-1">Maximum rank reached!</p>
          )}
        </div>
      </div>

      {/* Browse toggle */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-xs text-primary hover:underline underline-offset-2"
      >
        {open ? "Hide all ranks" : "Browse all ranks"}
      </button>

      {/* Tier browser */}
      {open && (
        <div className="rounded-xl border bg-muted/30 p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewIndex((i) => Math.max(0, i - 1))}
              disabled={viewIndex === 0}
              className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex-1 text-center space-y-1">
              <p className={cn("text-xs font-semibold uppercase tracking-wider",
                isCurrentTier ? "text-primary" : isUnlocked ? "text-green-600" : "text-muted-foreground"
              )}>
                {isCurrentTier ? "Your Current Rank" : isUnlocked ? "Unlocked" : "Locked"}
              </p>
              <span className={cn("text-5xl block", !isUnlocked && "grayscale opacity-50")}>
                {viewing.icon}
              </span>
              <p className="font-bold text-lg">{viewing.name}</p>
              <p className="text-sm text-muted-foreground">{viewing.minPoints}+ pts</p>
              {!isUnlocked && (
                <p className="text-xs text-muted-foreground">
                  {viewing.minPoints - totalPoints} pts needed
                </p>
              )}
            </div>

            <button
              onClick={() => setViewIndex((i) => Math.min(TIERS.length - 1, i + 1))}
              disabled={viewIndex === TIERS.length - 1}
              className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Dot indicators */}
          <div className="flex justify-center gap-1.5 mt-4">
            {TIERS.map((t, i) => (
              <button
                key={t.name}
                onClick={() => setViewIndex(i)}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  i === viewIndex ? "bg-primary" : "bg-muted-foreground/30 hover:bg-muted-foreground/60"
                )}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
