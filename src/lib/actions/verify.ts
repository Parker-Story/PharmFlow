"use server";

import { generateRxScenario } from "@/lib/ai/generate";
import type { RxScenario } from "@/lib/ai/generate";

export async function generateRxScenarioAction(): Promise<RxScenario | { error: string }> {
  try {
    return await generateRxScenario();
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Generation failed. Please try again." };
  }
}
