"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { ACHIEVEMENTS } from "@/data/achievements";

export function AchievementNotifier({ newlyEarned }: { newlyEarned: string[] }) {
  useEffect(() => {
    for (const id of newlyEarned) {
      const def = ACHIEVEMENTS.find((a) => a.id === id);
      if (!def) continue;
      toast(`${def.icon} Achievement Unlocked!`, {
        description: `${def.title} — ${def.description}`,
        duration: 5000,
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
