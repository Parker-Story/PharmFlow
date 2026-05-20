import type { TextChunk } from "@/lib/pdf/extract";
import type { QuizQuestion } from "@/types/quiz";

export interface GenerationOptions {
  questionCount: number;
  questionTypes: Array<"multiple_choice" | "true_false" | "short_answer">;
  difficulty: "easy" | "medium" | "hard";
}

export interface GenerationResult {
  questions: Omit<QuizQuestion, "id">[];
}

/**
 * Stub — replace the body with a real LLM call (OpenAI, Anthropic, etc.)
 * The interface is intentionally stable so swapping providers requires
 * only changes inside this file.
 */
export async function generateQuestionsFromChunks(
  chunks: TextChunk[],
  options: GenerationOptions
): Promise<GenerationResult> {
  // TODO: implement AI generation
  // Suggested implementation:
  //   1. Select the most content-rich chunks (avoid boilerplate)
  //   2. Build a system prompt describing pharmacy-exam style questions
  //   3. Send chunks + options to your LLM provider
  //   4. Parse and validate the structured JSON response
  //   5. Return questions in the QuizQuestion shape

  void chunks;
  void options;

  // Placeholder — returns empty until AI is wired up
  return { questions: [] };
}
