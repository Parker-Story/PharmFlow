"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { syncAchievements } from "@/lib/actions/achievements";
import { ACHIEVEMENTS } from "@/data/achievements";

export function AchievementNotifier() {
  const pathname = usePathname();

  useEffect(() => {
    syncAchievements().then(({ newlyEarned }) => {
      for (const id of newlyEarned) {
        const def = ACHIEVEMENTS.find((a) => a.id === id);
        if (!def) continue;
        toast(`${def.icon} Achievement Unlocked! +${def.points} pts`, {
          description: `${def.title}: ${def.description}`,
          duration: 5000,
        });
      }
    });
  }, [pathname]);

  return null;
}
