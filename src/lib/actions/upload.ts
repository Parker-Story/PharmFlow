"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { extractTextFromPdf, chunkText } from "@/lib/pdf/extract";
import {
  generateQuestionsFromChunks,
  generateFlashcardsFromChunks,
  generateSummaryFromChunks,
} from "@/lib/ai/generate";
import { checkDbLimit, DAILY_LIMITS } from "@/lib/actions/limits";
import type { QuizQuestion } from "@/types/quiz";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export interface UnifiedUploadResult {
  success: boolean;
  error?: string;
  examId?: string;
  notecardSetId?: string;
  summaryId?: string;
}

export async function processUnifiedUpload(
  formData: FormData
): Promise<UnifiedUploadResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const files = (formData.getAll("file") as File[]).filter((f) => f && f.size > 0);
  const baseTitle = (formData.get("title") as string)?.trim() || "";
  const examFolderId      = (formData.get("exam_folder_id") as string) || null;
  const notecardsFolderId = (formData.get("notecards_folder_id") as string) || null;
  const summaryFolderId   = (formData.get("summary_folder_id") as string) || null;

  const generateExam = formData.get("generate_exam") === "true";
  const generateNotecards = formData.get("generate_notecards") === "true";
  const generateSummary = formData.get("generate_summary") === "true";

  const multipleOutputs = [generateExam, generateNotecards, generateSummary].filter(Boolean).length > 1;
  const examTitle      = multipleOutputs ? `${baseTitle} (Exam)` : baseTitle;
  const notecardsTitle = multipleOutputs ? `${baseTitle} (Notecards)` : baseTitle;
  const summaryTitle   = multipleOutputs ? `${baseTitle} (Summary)` : baseTitle;

  const questionCount = Math.min(50, Math.max(5, Number(formData.get("question_count")) || 20));
  const difficulty = (formData.get("difficulty") as "easy" | "medium" | "hard") || "medium";
  const questionType = (formData.get("question_type") as "multiple_choice" | "true_false" | "mix") || "mix";
  const cardCount = Math.min(60, Math.max(10, Number(formData.get("card_count")) || 20));

  if (!generateExam && !generateNotecards && !generateSummary) {
    return { success: false, error: "Select at least one item to generate." };
  }

  const [examErr, notecardErr, summaryErr] = await Promise.all([
    generateExam ? checkDbLimit("quizzes", user.id, DAILY_LIMITS.exams, "practice exams") : null,
    generateNotecards ? checkDbLimit("notecard_sets", user.id, DAILY_LIMITS.notecard_sets, "notecard sets") : null,
    generateSummary ? checkDbLimit("summaries", user.id, DAILY_LIMITS.summaries, "summaries") : null,
  ]);
  const limitError = examErr ?? notecardErr ?? summaryErr;
  if (limitError) return { success: false, error: limitError };
  if (!baseTitle) return { success: false, error: "Please enter a title." };
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

  const questionTypes =
    questionType === "multiple_choice" ? (["multiple_choice"] as const) :
    questionType === "true_false" ? (["true_false"] as const) :
    (["multiple_choice", "true_false"] as const);

  let examQuestions: QuizQuestion[] = [];
  let notecardCards: { front: string; back: string }[] = [];
  let summaryText = "";

  try {
    const [examResult, notecardResult, summaryResult] = await Promise.all([
      generateExam
        ? generateQuestionsFromChunks(chunks, { questionCount, questionTypes: [...questionTypes], difficulty })
        : null,
      generateNotecards
        ? generateFlashcardsFromChunks(chunks, { cardCount })
        : null,
      generateSummary
        ? generateSummaryFromChunks(chunks)
        : null,
    ]);

    if (examResult) {
      examQuestions = examResult.questions.map((q, i) => ({
        id: `q-${i}`,
        questionText: q.questionText,
        questionType: q.questionType,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        orderIndex: i,
      }));
    }
    if (notecardResult) notecardCards = notecardResult.cards;
    if (summaryResult) summaryText = summaryResult.summary;
  } catch (err) {
    console.error("Generation error:", err);
    const msg = err instanceof Error ? err.message : "Generation failed. Please try again.";
    return { success: false, error: msg };
  }

  let examId: string | undefined;
  let notecardSetId: string | undefined;
  let summaryId: string | undefined;

  if (generateExam && examQuestions.length > 0) {
    const { data: quiz } = await supabase
      .from("quizzes")
      .insert({ user_id: user.id, title: examTitle, source_filename: sourceFilename, status: "processing", folder_id: examFolderId })
      .select()
      .single();
    if (quiz) {
      await supabase.from("questions").insert(
        examQuestions.map((q) => ({
          quiz_id: quiz.id,
          question_text: q.questionText,
          question_type: q.questionType,
          options: q.options ?? null,
          correct_answer: q.correctAnswer,
          explanation: q.explanation ?? null,
          order_index: q.orderIndex,
        }))
      );
      await supabase.from("quizzes").update({ status: "ready", question_count: examQuestions.length }).eq("id", quiz.id);
      examId = quiz.id;
    }
  }

  if (generateNotecards && notecardCards.length > 0) {
    const { data: set } = await supabase
      .from("notecard_sets")
      .insert({ user_id: user.id, title: notecardsTitle, source_filename: sourceFilename, status: "processing", folder_id: notecardsFolderId })
      .select()
      .single();
    if (set) {
      await supabase.from("notecards").insert(
        notecardCards.map((c, i) => ({ set_id: set.id, front: c.front, back: c.back, order_index: i }))
      );
      await supabase.from("notecard_sets").update({ status: "ready", card_count: notecardCards.length }).eq("id", set.id);
      notecardSetId = set.id;
    }
  }

  if (generateSummary && summaryText) {
    const { data: summary } = await supabase
      .from("summaries")
      .insert({ user_id: user.id, title: summaryTitle, source_filename: sourceFilename, content: summaryText, folder_id: summaryFolderId })
      .select()
      .single();
    if (summary) summaryId = summary.id;
  }

  revalidatePath("/library", "layout");
  revalidatePath("/dashboard");
  return { success: true, examId, notecardSetId, summaryId };
}
