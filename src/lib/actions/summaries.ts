"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function deleteSummary(summaryId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("summaries")
    .delete()
    .eq("id", summaryId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/library", "layout");
  return {};
}
