"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { extractTextFromPdf, chunkText } from "@/lib/pdf/extract";
import { generateFlashcardsFromChunks, generateQuestionsFromChunks } from "@/lib/ai/generate";
import { formatTitleDate } from "@/lib/utils/date";
import type { NotecardProcessingResult } from "@/types/notecards";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function processNotecardPdf(formData: FormData): Promise<NotecardProcessingResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const files = (formData.getAll("file") as File[]).filter((f) => f && f.size > 0);
  const title = (formData.get("title") as string) || "Untitled Notecard Set";
  const cardCount = Math.min(60, Math.max(10, Number(formData.get("card_count")) || 20));
  const folderId = (formData.get("folder_id") as string) || null;
  const createExam = formData.get("create_exam") === "true";

  if (files.length === 0) return { success: false, error: "Please upload at least one PDF file." };
  for (const file of files) {
    if (file.type !== "application/pdf") return { success: false, error: `${file.name} is not a PDF.` };
    if (file.size > MAX_FILE_SIZE) return { success: false, error: `${file.name} must be under 10 MB.` };
  }

  const sourceFilename = files.length === 1 ? files[0].name : `${files.length} files`;

  let combinedText: string;
  try {
    const texts = await Promise.all(
      files.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        const extracted = await extractTextFromPdf(buffer, file.name);
        return extracted.text;
      })
    );
    combinedText = texts.join("\n\n");
  } catch {
    return { success: false, error: "Could not read file." };
  }

  const chunks = chunkText(combinedText);

  let cards: { front: string; back: string }[] = [];
  try {
    if (createExam) {
      const [flashResult, quizResult] = await Promise.all([
        generateFlashcardsFromChunks(chunks, { cardCount }),
        generateQuestionsFromChunks(chunks, {
          questionCount: 20,
          questionTypes: ["multiple_choice", "true_false"],
          difficulty: "medium",
        }),
      ]);
      cards = flashResult.cards;

      const examTitle = `Practice Exam — ${formatTitleDate(new Date())}`;
      const { data: quiz } = await supabase
        .from("quizzes")
        .insert({
          user_id: user.id,
          title: examTitle,
          source_filename: sourceFilename,
          status: "processing",
          folder_id: folderId,
        })
        .select()
        .single();

      if (quiz) {
        const questions = quizResult.questions;
        if (questions.length > 0) {
          await supabase.from("questions").insert(
            questions.map((q, i) => ({
              quiz_id: quiz.id,
              question_text: q.questionText,
              question_type: q.questionType,
              options: q.options ?? null,
              correct_answer: q.correctAnswer,
              explanation: q.explanation ?? null,
              order_index: i,
            }))
          );
        }
        await supabase
          .from("quizzes")
          .update({ status: "ready", question_count: questions.length })
          .eq("id", quiz.id);
      }
    } else {
      const flashResult = await generateFlashcardsFromChunks(chunks, { cardCount });
      cards = flashResult.cards;
    }
  } catch (err) {
    console.error("Generation error:", err);
    return { success: false, error: "Generation failed. Please try again." };
  }

  const { data: set, error: insertError } = await supabase
    .from("notecard_sets")
    .insert({
      user_id: user.id,
      title,
      source_filename: sourceFilename,
      status: "processing",
      folder_id: folderId,
    })
    .select()
    .single();

  if (insertError || !set) {
    return { success: false, error: "Failed to create notecard set." };
  }

  try {
    if (cards.length > 0) {
      await supabase.from("notecards").insert(
        cards.map((c, i) => ({
          set_id: set.id,
          front: c.front,
          back: c.back,
          order_index: i,
        }))
      );
    }
    await supabase
      .from("notecard_sets")
      .update({ status: "ready", card_count: cards.length })
      .eq("id", set.id);

    revalidatePath("/library", "layout");
    revalidatePath("/dashboard");
    return { success: true, setId: set.id };
  } catch (err) {
    console.error("Save error:", err);
    await supabase.from("notecard_sets").update({ status: "failed" }).eq("id", set.id);
    return { success: false, error: "Failed to save notecard set." };
  }
}

export async function deleteNotecardSet(setId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("notecard_sets")
    .delete()
    .eq("id", setId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/library", "layout");
  return {};
}

export async function updateNotecardSetTitle(setId: string, title: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("notecard_sets")
    .update({ title, updated_at: new Date().toISOString() })
    .eq("id", setId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath(`/notecards/${setId}`);
  revalidatePath(`/notecards/${setId}/edit`);
  return {};
}

export async function updateCard(cardId: string, front: string, back: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: card } = await supabase
    .from("notecards")
    .select("set_id")
    .eq("id", cardId)
    .single();
  if (!card) return { error: "Card not found" };

  const { data: set } = await supabase
    .from("notecard_sets")
    .select("id")
    .eq("id", card.set_id)
    .eq("user_id", user.id)
    .single();
  if (!set) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("notecards")
    .update({ front, back })
    .eq("id", cardId);

  if (error) return { error: error.message };
  return {};
}

export async function deleteCard(cardId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: card } = await supabase
    .from("notecards")
    .select("set_id")
    .eq("id", cardId)
    .single();
  if (!card) return { error: "Card not found" };

  const { data: set } = await supabase
    .from("notecard_sets")
    .select("id, card_count")
    .eq("id", card.set_id)
    .eq("user_id", user.id)
    .single();
  if (!set) return { error: "Unauthorized" };

  const { error } = await supabase.from("notecards").delete().eq("id", cardId);
  if (error) return { error: error.message };

  await supabase
    .from("notecard_sets")
    .update({ card_count: Math.max(0, set.card_count - 1) })
    .eq("id", set.id);

  return {};
}

export async function addCard(
  setId: string,
  front: string,
  back: string
): Promise<{ error?: string; cardId?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: set } = await supabase
    .from("notecard_sets")
    .select("id, card_count")
    .eq("id", setId)
    .eq("user_id", user.id)
    .single();
  if (!set) return { error: "Unauthorized" };

  const { data: lastCards } = await supabase
    .from("notecards")
    .select("order_index")
    .eq("set_id", setId)
    .order("order_index", { ascending: false })
    .limit(1);

  const nextIndex = lastCards && lastCards.length > 0 ? lastCards[0].order_index + 1 : 0;

  const { data: newCard, error } = await supabase
    .from("notecards")
    .insert({ set_id: setId, front, back, order_index: nextIndex })
    .select()
    .single();

  if (error) return { error: error.message };

  await supabase
    .from("notecard_sets")
    .update({ card_count: set.card_count + 1 })
    .eq("id", setId);

  return { cardId: newCard.id };
}
