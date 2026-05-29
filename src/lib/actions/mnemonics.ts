"use server";

import { generateMnemonic, generateCardMnemonic } from "@/lib/ai/generate";

export async function generateMnemonicAction(
  drugs: string[],
  focus: "mechanism" | "side_effects" | "interactions"
): Promise<{ mnemonic: string; explanation: string } | { error: string }> {
  if (drugs.length === 0) return { error: "Enter at least one drug." };
  try {
    return await generateMnemonic(drugs, focus);
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Generation failed. Please try again." };
  }
}

export async function generateCardMnemonicAction(
  drugName: string,
  context: string
): Promise<{ mnemonic: string; explanation: string } | { error: string }> {
  try {
    return await generateCardMnemonic(drugName, context);
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Generation failed. Please try again." };
  }
}
