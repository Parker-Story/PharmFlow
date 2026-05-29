"use server";

import { createClient } from "@/lib/supabase/server";
import { generateRxScenario } from "@/lib/ai/generate";
import { checkEventLimit, logLimitEvent, DAILY_LIMITS } from "@/lib/actions/limits";
import type { RxScenario } from "@/lib/ai/generate";

export async function generateRxScenarioAction(): Promise<RxScenario | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const limitError = await checkEventLimit(user.id, "rx_verification", DAILY_LIMITS.rx_verification, "Rx verification scenarios");
  if (limitError) return { error: limitError };

  try {
    const result = await generateRxScenario();
    await logLimitEvent(user.id, "rx_verification");
    return result;
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Generation failed. Please try again." };
  }
}
