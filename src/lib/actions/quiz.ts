"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { extractTextFromPdf, chunkText } from "@/lib/pdf/extract";
import { generateQuestionsFromChunks, generateFlashcardsFromChunks } from "@/lib/ai/generate";
import { formatTitleDate } from "@/lib/utils/date";
import type { ProcessingResult, QuizQuestion, QuizAttemptAnswer } from "@/types/quiz";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function processUploadedPdf(
  formData: FormData
): Promise<ProcessingResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const files = (formData.getAll("file") as File[]).filter((f) => f && f.size > 0);
  const title = (formData.get("title") as string) || "Untitled Quiz";
  const questionCount = Math.min(50, Math.max(5, Number(formData.get("question_count")) || 20));
  const difficulty = (formData.get("difficulty") as "easy" | "medium" | "hard") || "medium";
  const questionType = (formData.get("question_type") as "multiple_choice" | "true_false" | "mix") || "mix";
  const saveExam = formData.get("save_exam") !== "false";
  const folderId = (formData.get("folder_id") as string) || null;
  const createNotecardSet = formData.get("create_notecard_set") === "true";

  if (files.length === 0) return { success: false, error: "Please upload at least one PDF file." };
  for (const file of files) {
    if (file.type !== "application/pdf") return { success: false, error: `${file.name} is not a PDF.` };
    if (file.size > MAX_FILE_SIZE) return { success: false, error: `${file.name} must be under 10 MB.` };
  }

  const sourceFilename = files.length === 1 ? files[0].name : `${files.length} files`;

  const questionTypes =
    questionType === "multiple_choice" ? (["multiple_choice"] as const) :
    questionType === "true_false" ? (["true_false"] as const) :
    (["multiple_choice", "true_false"] as const);

  let questions: QuizQuestion[] = [];
  let notecardCards: { front: string; back: string }[] = [];
  try {
    const texts = await Promise.all(
      files.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        const extracted = await extractTextFromPdf(buffer, file.name);
        return extracted.text;
      })
    );
    const chunks = chunkText(texts.join("\n\n"));

    if (saveExam && createNotecardSet) {
      const [quizResult, flashResult] = await Promise.all([
        generateQuestionsFromChunks(chunks, { questionCount, questionTypes: [...questionTypes], difficulty }),
        generateFlashcardsFromChunks(chunks, { cardCount: 20 }),
      ]);
      questions = quizResult.questions.map((q, i) => ({
        id: `q-${i}`,
        questionText: q.questionText,
        questionType: q.questionType,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        orderIndex: i,
      }));
      notecardCards = flashResult.cards;
    } else {
      const result = await generateQuestionsFromChunks(chunks, {
        questionCount,
        questionTypes: [...questionTypes],
        difficulty,
      });
      questions = result.questions.map((q, i) => ({
        id: `q-${i}`,
        questionText: q.questionText,
        questionType: q.questionType,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        orderIndex: i,
      }));
    }
  } catch (err) {
    console.error("PDF processing error:", err);
    return { success: false, error: "Processing failed. Please try again." };
  }

  // One-off: return questions without touching the DB
  if (!saveExam) {
    return { success: true, isOneOff: true, questions };
  }

  // Stored: persist quiz + questions
  const { data: quiz, error: insertError } = await supabase
    .from("quizzes")
    .insert({
      user_id: user.id,
      title,
      source_filename: sourceFilename,
      status: "processing",
      folder_id: folderId,
    })
    .select()
    .single();

  if (insertError || !quiz) {
    return { success: false, error: "Failed to create quiz record." };
  }

  try {
    if (questions.length > 0) {
      await supabase.from("questions").insert(
        questions.map((q) => ({
          quiz_id: quiz.id,
          question_text: q.questionText,
          question_type: q.questionType,
          options: q.options ?? null,
          correct_answer: q.correctAnswer,
          explanation: q.explanation ?? null,
          order_index: q.orderIndex,
        }))
      );
    }

    await supabase
      .from("quizzes")
      .update({ status: "ready", question_count: questions.length })
      .eq("id", quiz.id);

    if (createNotecardSet && notecardCards.length > 0) {
      const notecardTitle = `Notecard Set: ${formatTitleDate(new Date())}`;
      const { data: set } = await supabase
        .from("notecard_sets")
        .insert({
          user_id: user.id,
          title: notecardTitle,
          source_filename: sourceFilename,
          status: "processing",
          folder_id: folderId,
        })
        .select()
        .single();

      if (set) {
        await supabase.from("notecards").insert(
          notecardCards.map((c, i) => ({
            set_id: set.id,
            front: c.front,
            back: c.back,
            order_index: i,
          }))
        );
        await supabase
          .from("notecard_sets")
          .update({ status: "ready", card_count: notecardCards.length })
          .eq("id", set.id);
      }
    }

    revalidatePath("/library", "layout");
    revalidatePath("/dashboard");
    return { success: true, quizId: quiz.id };
  } catch (err) {
    console.error("Quiz save error:", err);
    await supabase.from("quizzes").update({ status: "failed" }).eq("id", quiz.id);
    return { success: false, error: "Processing failed. Please try again." };
  }
}

export async function saveQuizAttempt(
  quizId: string,
  score: number,
  totalQuestions: number,
  answers: QuizAttemptAnswer[]
): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("quiz_attempts").insert({
    quiz_id: quizId,
    user_id: user.id,
    score,
    total_questions: totalQuestions,
    answers,
    completed_at: new Date().toISOString(),
  });
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
  revalidatePath("/library", "layout");
  return {};
}
