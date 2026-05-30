"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { syncAchievements } from "@/lib/actions/achievements";

export function AchievementNotifier() {
  const pathname = usePathname();

  useEffect(() => {
    syncAchievements().then(({ claimableIds }) => {
      if (claimableIds.length === 0) return;
      toast(`🎯 ${claimableIds.length} achievement${claimableIds.length > 1 ? "s" : ""} ready to claim!`, {
        id: "claimable-achievements",
        description: "Visit your achievements page to collect your rewards.",
        duration: 5000,
      });
    });
  }, [pathname]);

  return null;
}
