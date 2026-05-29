"use server";

import { createClient } from "@/lib/supabase/server";
import { generateMnemonic, generateCardMnemonic } from "@/lib/ai/generate";
import { checkEventLimit, logLimitEvent, DAILY_LIMITS } from "@/lib/actions/limits";

export async function generateMnemonicAction(
  drugs: string[],
  focus: "mechanism" | "side_effects" | "interactions"
): Promise<{ mnemonic: string; explanation: string } | { error: string }> {
  if (drugs.length === 0) return { error: "Enter at least one drug." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const limitError = await checkEventLimit(user.id, "group_mnemonic", DAILY_LIMITS.group_mnemonic, "group mnemonics");
  if (limitError) return { error: limitError };

  try {
    const result = await generateMnemonic(drugs, focus);
    await logLimitEvent(user.id, "group_mnemonic");
    return result;
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Generation failed. Please try again." };
  }
}

export async function generateCardMnemonicAction(
  drugName: string,
  context: string
): Promise<{ mnemonic: string; explanation: string } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const limitError = await checkEventLimit(user.id, "card_mnemonic", DAILY_LIMITS.card_mnemonic, "card mnemonics");
  if (limitError) return { error: limitError };

  try {
    const result = await generateCardMnemonic(drugName, context);
    await logLimitEvent(user.id, "card_mnemonic");
    return result;
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Generation failed. Please try again." };
  }
}
