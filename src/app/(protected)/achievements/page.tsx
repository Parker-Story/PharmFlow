import { Trophy } from "lucide-react";
import { syncAchievements } from "@/lib/actions/achievements";
import { ACHIEVEMENTS } from "@/data/achievements";
import { AchievementsClient } from "@/components/achievements/achievements-client";

export const metadata = { title: "Achievements | PharmFlow" };

export default async function AchievementsPage() {
  const { claimedIds, claimableIds, totalPoints, counts } = await syncAchievements();

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

      <AchievementsClient
        initialClaimedIds={claimedIds}
        claimableIds={claimableIds}
        counts={counts}
        initialTotalPoints={totalPoints}
      />
    </div>
  );
}
