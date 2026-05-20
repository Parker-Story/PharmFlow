"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { extractTextFromPdf, chunkText } from "@/lib/pdf/extract";
import { generateQuestionsFromChunks } from "@/lib/ai/generate";
import type { ProcessingResult } from "@/types/quiz";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function processUploadedPdf(
  formData: FormData
): Promise<ProcessingResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const file = formData.get("file") as File | null;
  const title = (formData.get("title") as string) || "Untitled Quiz";

  if (!file || file.type !== "application/pdf") {
    return { success: false, error: "Please upload a valid PDF file." };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: "File must be under 10 MB." };
  }

  // Create quiz row in "processing" state immediately
  const { data: quiz, error: insertError } = await supabase
    .from("quizzes")
    .insert({
      user_id: user.id,
      title,
      source_filename: file.name,
      status: "processing",
    })
    .select()
    .single();

  if (insertError || !quiz) {
    return { success: false, error: "Failed to create quiz record." };
  }

  try {
    // Convert File → Buffer (held only in server memory, never written to disk)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text — PDF is discarded after this point
    const extracted = await extractTextFromPdf(buffer, file.name);
    const chunks = chunkText(extracted.text);

    // Generate questions (stub until AI is wired up)
    const { questions } = await generateQuestionsFromChunks(chunks, {
      questionCount: 20,
      questionTypes: ["multiple_choice", "true_false"],
      difficulty: "medium",
    });

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

    // Mark quiz ready
    await supabase
      .from("quizzes")
      .update({ status: "ready", question_count: questions.length })
      .eq("id", quiz.id);

    revalidatePath("/dashboard");
    return { success: true, quizId: quiz.id };
  } catch (err) {
    console.error("PDF processing error:", err);

    await supabase
      .from("quizzes")
      .update({ status: "failed" })
      .eq("id", quiz.id);

    return { success: false, error: "Processing failed. Please try again." };
  }
}

export async function deleteQuiz(quizId: string): Promise<{ error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("quizzes")
    .delete()
    .eq("id", quizId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return {};
}
