import { createClient } from "@/lib/supabase/server";

export const DAILY_LIMITS = {
  exams: 5,
  notecard_sets: 5,
  summaries: 10,
  rx_verification: 15,
  group_mnemonic: 10,
  card_mnemonic: 30,
} as const;

function startOfToday(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export async function checkDbLimit(
  table: "quizzes" | "notecard_sets" | "summaries",
  userId: string,
  limit: number,
  label: string
): Promise<string | null> {
  const supabase = await createClient();
  const { count } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", startOfToday());
  return (count ?? 0) >= limit
    ? `You've reached today's limit of ${limit} ${label}. Try again tomorrow.`
    : null;
}

export async function checkEventLimit(
  userId: string,
  eventType: string,
  limit: number,
  label: string
): Promise<string | null> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("user_events")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("event_type", eventType)
    .gte("created_at", startOfToday());
  return (count ?? 0) >= limit
    ? `You've reached today's limit of ${limit} ${label}. Try again tomorrow.`
    : null;
}

export async function logLimitEvent(userId: string, eventType: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("user_events").insert({ user_id: userId, event_type: eventType });
}
