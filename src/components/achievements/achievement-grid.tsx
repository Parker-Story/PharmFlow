"use client";

import { useState } from "react";
import { toast } from "sonner";
import { claimAchievement } from "@/lib/actions/achievements";
import { ACHIEVEMENTS } from "@/data/achievements";
import type { AchievementDef } from "@/data/achievements";
import type { AchievementCounts } from "@/lib/actions/achievements";
import { cn } from "@/lib/utils";

interface AchievementGridProps {
  initialClaimedIds: string[];
  claimableIds: string[];
  counts: AchievementCounts;
  initialTotalPoints: number;
}

export function AchievementGrid({
  initialClaimedIds,
  claimableIds: initialClaimableIds,
  counts,
  initialTotalPoints,
}: AchievementGridProps) {
  const [claimedSet, setClaimedSet] = useState(new Set(initialClaimedIds));
  const [claimableSet, setClaimableSet] = useState(new Set(initialClaimableIds));
  const [totalPoints, setTotalPoints] = useState(initialTotalPoints);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [justClaimedId, setJustClaimedId] = useState<string | null>(null);

  const metricMap: Record<string, number> = {
    quizCount: counts.quizCount, attemptCount: counts.attemptCount, perfectCount: counts.perfectCount,
    notecardCount: counts.notecardCount, summaryCount: counts.summaryCount,
    rxCorrectCount: counts.rxCorrectCount, drugLookupCount: counts.drugLookupCount,
    mnemonicCount: counts.mnemonicCount, folderCount: counts.folderCount, breakVisits: counts.breakVisits,
  };

  async function handleClaim(a: AchievementDef) {
    if (claimingId || !claimableSet.has(a.id)) return;
    setClaimingId(a.id);

    const result = await claimAchievement(a.id);

    if (result.success) {
      setClaimedSet((prev) => new Set([...prev, a.id]));
      setClaimableSet((prev) => { const next = new Set(prev); next.delete(a.id); return next; });
      setTotalPoints(result.totalPoints);
      setJustClaimedId(a.id);
      toast(`${a.icon} +${a.points} pts!`, { description: `${a.title} claimed!`, duration: 3000 });
      setTimeout(() => setJustClaimedId(null), 700);
    }

    setClaimingId(null);
  }

  // Build active card list:
  // For each chain: show all claimable tiers + the first in-progress tier
  // For one-offs: show if claimable or not yet claimed
  const chains = Array.from(new Set(ACHIEVEMENTS.filter((a) => a.chain).map((a) => a.chain!)));

  const activeCards: AchievementDef[] = [];

  for (const chainId of chains) {
    const chainAchs = ACHIEVEMENTS.filter((a) => a.chain === chainId);
    for (const a of chainAchs) {
      if (claimedSet.has(a.id)) continue;
      if (claimableSet.has(a.id)) {
        activeCards.push(a);
      } else {
        // first in-progress (not earned yet) — show once then stop
        activeCards.push(a);
        break;
      }
    }
  }

  // One-offs
  const oneOffs = ACHIEVEMENTS.filter((a) => a.chain === null && !claimedSet.has(a.id));
  activeCards.push(...oneOffs);

  // Sort: claimable first, then in-progress
  activeCards.sort((a, b) => {
    const ac = claimableSet.has(a.id) ? 0 : 1;
    const bc = claimableSet.has(b.id) ? 0 : 1;
    return ac - bc;
  });

  // Completed: claimed, sorted newest-claimed first (we don't have timestamps client-side so keep original order)
  const completedCards = ACHIEVEMENTS.filter((a) => claimedSet.has(a.id));

  return (
    <div className="space-y-8">
      {/* Active / claimable */}
      {activeCards.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">In Progress</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {activeCards.map((a) => {
              const isClaimable = claimableSet.has(a.id);
              const isClaiming = claimingId === a.id;
              const justClaimed = justClaimedId === a.id;
              const metricValue = a.metric ? (metricMap[a.metric] ?? 0) : 0;
              const hasProgress = a.threshold !== null && a.metric;

              return (
                <div
                  key={a.id}
                  onClick={() => isClaimable && handleClaim(a)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-3 rounded-2xl border-2 bg-card p-5 text-center shadow-sm transition-all duration-300",
                    isClaimable && "border-green-400 shadow-green-100 dark:shadow-green-900/20 cursor-pointer hover:scale-105 hover:shadow-md",
                    isClaimable && !isClaiming && "animate-pulse-slow",
                    justClaimed && "scale-110 shadow-lg",
                    !isClaimable && "cursor-default",
                    isClaiming && "opacity-70 scale-95"
                  )}
                >
                  <span className="text-4xl">{a.icon}</span>
                  <div>
                    <p className="text-sm font-semibold leading-snug">{a.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground leading-snug">{a.description}</p>
                  </div>
                  {isClaimable ? (
                    <span className="text-xs font-semibold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 rounded-full px-3 py-1">
                      {isClaiming ? "Claiming..." : `Tap to claim +${a.points} pts`}
                    </span>
                  ) : hasProgress ? (
                    <div className="w-full space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{metricValue} / {a.threshold}</span>
                        <span>+{a.points} pts</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary/60 rounded-full"
                          style={{ width: `${Math.min(100, (metricValue / a.threshold!) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">+{a.points} pts</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed */}
      {completedCards.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Completed</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {completedCards.map((a) => (
              <div
                key={a.id}
                className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-green-200 dark:border-green-900/40 bg-green-50/50 dark:bg-green-950/10 p-5 text-center"
              >
                <span className="text-4xl">{a.icon}</span>
                <div>
                  <p className="text-sm font-semibold leading-snug">{a.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground leading-snug">{a.description}</p>
                </div>
                <span className="text-xs font-semibold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 rounded-full px-2 py-0.5">
                  +{a.points} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeCards.length === 0 && completedCards.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-12">
          Start studying to earn achievements!
        </p>
      )}
    </div>
  );
}
