"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createFolder(
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "Folder name cannot be empty." };

  const parentId = (formData.get("parent_id") as string) || null;

  const { error } = await supabase
    .from("folders")
    .insert({ user_id: user.id, name, parent_id: parentId });

  if (error) return { error: error.message };

  revalidatePath("/library", "layout");
  return {};
}

export async function deleteFolder(
  folderId: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("folders")
    .delete()
    .eq("id", folderId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/library", "layout");
  return {};
}

export async function moveItem(
  itemId: string,
  itemType: "quiz" | "notecard_set" | "summary" | "folder",
  targetFolderId: string | null
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  let error;
  if (itemType === "quiz") {
    ({ error } = await supabase.from("quizzes").update({ folder_id: targetFolderId }).eq("id", itemId).eq("user_id", user.id));
  } else if (itemType === "notecard_set") {
    ({ error } = await supabase.from("notecard_sets").update({ folder_id: targetFolderId }).eq("id", itemId).eq("user_id", user.id));
  } else if (itemType === "summary") {
    ({ error } = await supabase.from("summaries").update({ folder_id: targetFolderId }).eq("id", itemId).eq("user_id", user.id));
  } else {
    ({ error } = await supabase.from("folders").update({ parent_id: targetFolderId }).eq("id", itemId).eq("user_id", user.id));
  }

  if (error) return { error: error.message };
  revalidatePath("/library", "layout");
  return {};
}

export async function moveExamToFolder(
  examId: string,
  folderId: string | null
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("quizzes")
    .update({ folder_id: folderId })
    .eq("id", examId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/library", "layout");
  return {};
}
