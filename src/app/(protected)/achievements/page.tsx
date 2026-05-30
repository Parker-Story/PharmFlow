import { Trophy } from "lucide-react";
import { syncAchievements } from "@/lib/actions/achievements";
import { ACHIEVEMENTS, getTier, getNextTier } from "@/data/achievements";
import { TierBrowser } from "@/components/achievements/tier-browser";
import { AchievementGrid } from "@/components/achievements/achievement-grid";

export const metadata = { title: "Achievements | PharmFlow" };

export default async function AchievementsPage() {
  const { claimedIds, claimableIds, totalPoints, counts } = await syncAchievements();

  const tier = getTier(totalPoints);
  const nextTier = getNextTier(totalPoints);
  const progressPct = nextTier
    ? Math.min(100, ((totalPoints - tier.minPoints) / (nextTier.minPoints - tier.minPoints)) * 100)
    : 100;

  const completedCount = claimedIds.length;
  const total = ACHIEVEMENTS.length;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Trophy className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Achievements</h1>
          <p className="text-sm text-muted-foreground">
            {completedCount} of {total} claimed
          </p>
        </div>
      </div>

      <TierBrowser
        currentTier={tier}
        totalPoints={totalPoints}
        nextTier={nextTier}
        progressPct={progressPct}
      />

      <AchievementGrid
        initialClaimedIds={claimedIds}
        claimableIds={claimableIds}
        counts={counts}
        initialTotalPoints={totalPoints}
      />
    </div>
  );
}
