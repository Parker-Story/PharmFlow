import { Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { syncAchievements } from "@/lib/actions/achievements";
import { ACHIEVEMENTS, getTier, getNextTier } from "@/data/achievements";
import { TierBrowser } from "@/components/achievements/tier-browser";
import { cn } from "@/lib/utils";

export const metadata = { title: "Achievements | PharmFlow" };

export default async function AchievementsPage() {
  const { unlockedIds, totalPoints, counts } = await syncAchievements();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: unlocked } = await supabase
    .from("user_achievements")
    .select("achievement_id, unlocked_at")
    .eq("user_id", user!.id);

  const unlockedMap = new Map((unlocked ?? []).map((r) => [r.achievement_id, r.unlocked_at]));
  const unlockedSet = new Set(unlockedIds);

  const tier = getTier(totalPoints);
  const nextTier = getNextTier(totalPoints);
  const progressPct = nextTier
    ? Math.min(100, ((totalPoints - tier.minPoints) / (nextTier.minPoints - tier.minPoints)) * 100)
    : 100;

  // For each chain, find the first not-yet-unlocked achievement (the active one)
  const chains = Array.from(new Set(ACHIEVEMENTS.filter((a) => a.chain).map((a) => a.chain!)));
  const activeCards = chains
    .map((chainId) => {
      const chainAchievements = ACHIEVEMENTS.filter((a) => a.chain === chainId);
      return chainAchievements.find((a) => !unlockedSet.has(a.id)) ?? null;
    })
    .filter(Boolean);

  // Incomplete one-offs
  const oneOffs = ACHIEVEMENTS.filter((a) => a.chain === null && !unlockedSet.has(a.id));
  const allActive = [...activeCards, ...oneOffs];

  // All completed achievements (by unlock date, newest first)
  const completedList = [...unlockedMap.entries()]
    .sort((a, b) => new Date(b[1]).getTime() - new Date(a[1]).getTime())
    .map(([id, unlockedAt]) => ({ achievement: ACHIEVEMENTS.find((a) => a.id === id)!, unlockedAt }))
    .filter((r) => r.achievement);

  const metricMap: Record<string, number> = {
    quizCount: counts.quizCount, attemptCount: counts.attemptCount, perfectCount: counts.perfectCount,
    notecardCount: counts.notecardCount, summaryCount: counts.summaryCount,
    rxCorrectCount: counts.rxCorrectCount, drugLookupCount: counts.drugLookupCount,
    mnemonicCount: counts.mnemonicCount, folderCount: counts.folderCount, breakVisits: counts.breakVisits,
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Trophy className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Achievements</h1>
          <p className="text-sm text-muted-foreground">
            {completedList.length} of {ACHIEVEMENTS.length} unlocked
          </p>
        </div>
      </div>

      {/* Tier card with browser */}
      <TierBrowser
        currentTier={tier}
        totalPoints={totalPoints}
        nextTier={nextTier}
        progressPct={progressPct}
      />

      {/* Active / in-progress achievements */}
      {allActive.length > 0 && (
        <div>
          <p className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider text-xs">In Progress</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {allActive.map((a) => {
              const metricValue = a!.metric ? (metricMap[a!.metric] ?? 0) : 0;
              const hasProgress = a!.threshold !== null && a!.metric;
              return (
                <div
                  key={a!.id}
                  className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 bg-card p-5 text-center shadow-sm"
                >
                  <span className="text-4xl">{a!.icon}</span>
                  <div>
                    <p className="text-sm font-semibold leading-snug">{a!.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground leading-snug">{a!.description}</p>
                  </div>
                  {hasProgress && (
                    <div className="w-full space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{metricValue} / {a!.threshold}</span>
                        <span>+{a!.points} pts</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary/60 rounded-full"
                          style={{ width: `${Math.min(100, (metricValue / a!.threshold!) * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {!hasProgress && (
                    <span className="text-xs text-muted-foreground">+{a!.points} pts</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed achievements */}
      {completedList.length > 0 && (
        <div>
          <p className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider text-xs">Completed</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {completedList.map(({ achievement: a, unlockedAt }) => (
              <div
                key={a.id}
                className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-green-200 bg-green-50/50 dark:bg-green-950/10 dark:border-green-900/40 p-5 text-center"
              >
                <span className="text-4xl">{a.icon}</span>
                <div>
                  <p className="text-sm font-semibold leading-snug">{a.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground leading-snug">{a.description}</p>
                </div>
                <span className="text-xs font-semibold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 rounded-full px-2 py-0.5">
                  +{a.points} pts
                </span>
                <p className="text-xs text-muted-foreground">{new Date(unlockedAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {completedList.length === 0 && allActive.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-12">No achievements yet. Start studying to earn some!</p>
      )}
    </div>
  );
}
