"use server";

import { createClient } from "@/lib/supabase/server";

export async function submitBugReport(
  title: string,
  description: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  if (!description.trim()) return { success: false, error: "Please describe the bug." };

  const { error } = await supabase.from("bug_reports").insert({
    user_id: user.id,
    title: title.trim(),
    description: description.trim(),
  });

  if (error) return { success: false, error: "Failed to submit report. Please try again." };
  return { success: true };
}
