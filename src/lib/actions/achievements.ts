"use server";

import { createClient } from "@/lib/supabase/server";
import { ACHIEVEMENTS, getTier, getNextTier } from "@/data/achievements";
import type { Tier } from "@/data/achievements";

export async function logEvent(eventType: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("user_events").insert({ user_id: user.id, event_type: eventType });
}

export interface AchievementCounts {
  quizCount: number;
  attemptCount: number;
  perfectCount: number;
  notecardCount: number;
  summaryCount: number;
  rxCorrectCount: number;
  drugLookupCount: number;
  mnemonicCount: number;
  folderCount: number;
  breakVisits: number;
}

export interface SyncResult {
  unlockedIds: string[];
  newlyEarned: string[];
  totalPoints: number;
  counts: AchievementCounts;
}

export async function syncAchievements(): Promise<SyncResult> {
  const empty: SyncResult = {
    unlockedIds: [],
    newlyEarned: [],
    totalPoints: 0,
    counts: {
      quizCount: 0, attemptCount: 0, perfectCount: 0, notecardCount: 0,
      summaryCount: 0, rxCorrectCount: 0, drugLookupCount: 0,
      mnemonicCount: 0, folderCount: 0, breakVisits: 0,
    },
  };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return empty;

  const { data: existing } = await supabase
    .from("user_achievements")
    .select("achievement_id")
    .eq("user_id", user.id);

  const alreadyUnlocked = new Set((existing ?? []).map((r) => r.achievement_id));

  const [
    { count: quizCount },
    { data: attempts },
    { count: notecardCount },
    { count: summaryCount },
    { count: folderCount },
    { data: events },
  ] = await Promise.all([
    supabase.from("quizzes").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "ready"),
    supabase.from("quiz_attempts").select("score, total_questions").eq("user_id", user.id).not("completed_at", "is", null),
    supabase.from("notecard_sets").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "ready"),
    supabase.from("summaries").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("folders").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("user_events").select("event_type").eq("user_id", user.id),
  ]);

  const attemptList = attempts ?? [];
  const attemptCount = attemptList.length;
  const perfectCount = attemptList.filter((a) => a.score !== null && a.score === a.total_questions).length;

  const eventList = events ?? [];
  const rxCorrectCount  = eventList.filter((e) => e.event_type === "rx_correct").length;
  const drugLookupCount = eventList.filter((e) => e.event_type === "drug_lookup").length;
  const mnemonicCount   = eventList.filter((e) => e.event_type === "group_mnemonic" || e.event_type === "card_mnemonic").length;
  const breakVisits     = eventList.filter((e) => e.event_type === "break_visit").length;

  const qCount  = quizCount ?? 0;
  const ncCount = notecardCount ?? 0;
  const sumCount = summaryCount ?? 0;
  const fCount  = folderCount ?? 0;

  const counts: AchievementCounts = {
    quizCount: qCount, attemptCount, perfectCount,
    notecardCount: ncCount, summaryCount: sumCount,
    rxCorrectCount, drugLookupCount, mnemonicCount,
    folderCount: fCount, breakVisits,
  };

  const metricMap: Record<string, number> = {
    quizCount: qCount, attemptCount, perfectCount,
    notecardCount: ncCount, summaryCount: sumCount,
    rxCorrectCount, drugLookupCount, mnemonicCount,
    folderCount: fCount, breakVisits,
  };

  const specialConditions: Record<string, boolean> = {
    all_three: qCount >= 1 && ncCount >= 1 && sumCount >= 1,
    first_folder: fCount >= 1,
    take_a_break: breakVisits >= 1,
  };

  const newlyEarned: string[] = [];
  for (const achievement of ACHIEVEMENTS) {
    if (alreadyUnlocked.has(achievement.id)) continue;
    let met = false;
    if (achievement.metric && achievement.threshold !== null) {
      met = (metricMap[achievement.metric] ?? 0) >= achievement.threshold;
    } else if (achievement.id in specialConditions) {
      met = specialConditions[achievement.id];
    }
    if (met) newlyEarned.push(achievement.id);
  }

  if (newlyEarned.length > 0) {
    await supabase
      .from("user_achievements")
      .insert(newlyEarned.map((achievement_id) => ({ user_id: user.id, achievement_id })));
  }

  const allUnlocked = [...alreadyUnlocked, ...newlyEarned];
  const totalPoints = allUnlocked.reduce((sum, id) => {
    const def = ACHIEVEMENTS.find((a) => a.id === id);
    return sum + (def?.points ?? 0);
  }, 0);

  return { unlockedIds: allUnlocked, newlyEarned, totalPoints, counts };
}

export async function getUserPointsAndTier(userId: string): Promise<{
  totalPoints: number;
  tier: Tier;
  nextTier: Tier | null;
}> {
  const supabase = await createClient();
  const { data: unlocked } = await supabase
    .from("user_achievements")
    .select("achievement_id")
    .eq("user_id", userId);

  const totalPoints = (unlocked ?? []).reduce((sum, row) => {
    const def = ACHIEVEMENTS.find((a) => a.id === row.achievement_id);
    return sum + (def?.points ?? 0);
  }, 0);

  return {
    totalPoints,
    tier: getTier(totalPoints),
    nextTier: getNextTier(totalPoints),
  };
}
