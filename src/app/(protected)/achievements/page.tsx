import { Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { syncAchievements } from "@/lib/actions/achievements";
import { ACHIEVEMENTS } from "@/data/achievements";
import { cn } from "@/lib/utils";

export const metadata = { title: "Achievements | PharmFlow" };

export default async function AchievementsPage() {
  await syncAchievements();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: unlocked } = await supabase
    .from("user_achievements")
    .select("achievement_id, unlocked_at")
    .eq("user_id", user!.id);

  const unlockedMap = new Map((unlocked ?? []).map((r) => [r.achievement_id, r.unlocked_at]));

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Trophy className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Achievements</h1>
          <p className="text-sm text-muted-foreground">
            {unlockedMap.size} of {ACHIEVEMENTS.length} unlocked
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {ACHIEVEMENTS.map((a) => {
          const unlockedAt = unlockedMap.get(a.id);
          const isUnlocked = !!unlockedAt;
          return (
            <div
              key={a.id}
              className={cn(
                "flex flex-col items-center gap-2 rounded-2xl border bg-card p-5 text-center shadow-sm",
                !isUnlocked && "opacity-40"
              )}
            >
              <span className={cn("text-4xl", !isUnlocked && "grayscale")}>{a.icon}</span>
              <p className="text-sm font-semibold leading-snug">{a.title}</p>
              <p className="text-xs text-muted-foreground leading-snug">{a.description}</p>
              {isUnlocked && (
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(unlockedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
