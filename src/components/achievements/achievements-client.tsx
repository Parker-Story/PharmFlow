"use client";

import { useState } from "react";
import { TierBrowser } from "./tier-browser";
import { AchievementGrid } from "./achievement-grid";
import { getTier, getNextTier } from "@/data/achievements";
import type { AchievementCounts } from "@/lib/actions/achievements";

interface AchievementsClientProps {
  initialClaimedIds: string[];
  claimableIds: string[];
  counts: AchievementCounts;
  initialTotalPoints: number;
}

export function AchievementsClient({
  initialClaimedIds,
  claimableIds,
  counts,
  initialTotalPoints,
}: AchievementsClientProps) {
  const [totalPoints, setTotalPoints] = useState(initialTotalPoints);

  const tier = getTier(totalPoints);
  const nextTier = getNextTier(totalPoints);
  const progressPct = nextTier
    ? Math.min(100, ((totalPoints - tier.minPoints) / (nextTier.minPoints - tier.minPoints)) * 100)
    : 100;

  return (
    <>
      <TierBrowser
        currentTier={tier}
        totalPoints={totalPoints}
        nextTier={nextTier}
        progressPct={progressPct}
      />
      <AchievementGrid
        initialClaimedIds={initialClaimedIds}
        claimableIds={claimableIds}
        counts={counts}
        initialTotalPoints={totalPoints}
        onPointsChange={setTotalPoints}
      />
    </>
  );
}
