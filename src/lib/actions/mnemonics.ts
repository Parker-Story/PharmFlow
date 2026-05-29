"use server";

import { generateMnemonic } from "@/lib/ai/generate";

export async function generateMnemonicAction(
  drugs: string[],
  focus: "list" | "mechanism" | "side_effects"
): Promise<{ mnemonic: string; explanation: string } | { error: string }> {
  if (drugs.length === 0) return { error: "Enter at least one drug." };
  try {
    return await generateMnemonic(drugs, focus);
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Generation failed. Please try again." };
  }
}
