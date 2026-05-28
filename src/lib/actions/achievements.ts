"use server";

import { createClient } from "@/lib/supabase/server";

export async function logEvent(eventType: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("user_events").insert({ user_id: user.id, event_type: eventType });
}

export async function syncAchievements(): Promise<{ unlockedIds: string[]; newlyEarned: string[] }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { unlockedIds: [], newlyEarned: [] };

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
    supabase
      .from("quizzes")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "ready"),
    supabase
      .from("quiz_attempts")
      .select("score, total_questions")
      .eq("user_id", user.id)
      .not("completed_at", "is", null),
    supabase
      .from("notecard_sets")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "ready"),
    supabase
      .from("summaries")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("folders")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("user_events")
      .select("event_type")
      .eq("user_id", user.id),
  ]);

  const attemptList = attempts ?? [];
  const perfectCount = attemptList.filter((a) => a.score !== null && a.score === a.total_questions).length;
  const eventList = events ?? [];
  const breakVisits = eventList.filter((e) => e.event_type === "break_visit").length;
  const drugLookups = eventList.filter((e) => e.event_type === "drug_lookup").length;

  const qCount = quizCount ?? 0;
  const ncCount = notecardCount ?? 0;
  const sumCount = summaryCount ?? 0;
  const fCount = folderCount ?? 0;

  const conditions: Record<string, boolean> = {
    first_exam: qCount >= 1,
    five_exams: qCount >= 5,
    ten_exams: qCount >= 10,
    perfect_score: perfectCount >= 1,
    first_notecard: ncCount >= 1,
    five_notecards: ncCount >= 5,
    first_summary: sumCount >= 1,
    all_three: qCount >= 1 && ncCount >= 1 && sumCount >= 1,
    first_folder: fCount >= 1,
    take_a_break: breakVisits >= 1,
    first_drug_lookup: drugLookups >= 1,
  };

  const newlyEarned: string[] = [];
  for (const [id, met] of Object.entries(conditions)) {
    if (met && !alreadyUnlocked.has(id)) {
      newlyEarned.push(id);
    }
  }

  if (newlyEarned.length > 0) {
    await supabase
      .from("user_achievements")
      .insert(newlyEarned.map((achievement_id) => ({ user_id: user.id, achievement_id })));
  }

  return { unlockedIds: [...alreadyUnlocked, ...newlyEarned], newlyEarned };
}
