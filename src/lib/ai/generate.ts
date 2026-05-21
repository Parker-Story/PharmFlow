import Groq from "groq-sdk";
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

export interface FlashcardResult {
  cards: { front: string; back: string }[];
}

const MAX_TEXT_LENGTH = 50000;

const difficultyGuide = {
  easy: "straightforward recall questions testing basic definitions and facts",
  medium: "application questions requiring understanding of concepts and mechanisms",
  hard: "complex questions involving clinical reasoning, drug interactions, or calculations",
};

export async function generateQuestionsFromChunks(
  chunks: TextChunk[],
  options: GenerationOptions
): Promise<GenerationResult> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not set.");

  const groq = new Groq({ apiKey });

  const text = chunks.map((c) => c.text).join("\n\n").slice(0, MAX_TEXT_LENGTH);
  const { questionCount, questionTypes, difficulty } = options;

  const hasMultipleChoice = questionTypes.includes("multiple_choice");
  const hasTrueFalse = questionTypes.includes("true_false");
  const typeDescription =
    hasMultipleChoice && hasTrueFalse
      ? "a mix of multiple choice (4 options) and true/false questions"
      : hasMultipleChoice
      ? "multiple choice questions with 4 answer options each"
      : "true/false questions";

  const prompt = `You are a pharmacy professor writing a practice exam. Generate exactly ${questionCount} ${difficulty}-difficulty questions from the lecture content below.

Difficulty: ${difficultyGuide[difficulty]}
Format: ${typeDescription}

Return ONLY a valid JSON array — no markdown, no code fences, no explanation outside the JSON. Each element must have:
- "questionText": string
- "questionType": "multiple_choice" or "true_false"
- "options": string[] with exactly 4 options (multiple_choice only — omit this key for true_false)
- "correctAnswer": string that exactly matches one of the options (or "True" / "False")
- "explanation": string, 1–2 sentences explaining why the answer is correct

Lecture content:
${text}`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });
  const raw = (completion.choices[0].message.content ?? "").trim();

  // Strip markdown code fences if the model wraps the output anyway
  const json = raw.startsWith("```")
    ? raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim()
    : raw;

  let parsed: unknown[];
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error("AI returned malformed JSON. Please try again.");
  }

  if (!Array.isArray(parsed)) {
    throw new Error("AI response was not a valid question array.");
  }

  const questions = (parsed as Record<string, unknown>[])
    .filter((q) => q.questionText && q.questionType && q.correctAnswer)
    .map((q, i) => ({
      questionText: String(q.questionText),
      questionType: (q.questionType === "true_false" ? "true_false" : "multiple_choice") as
        | "multiple_choice"
        | "true_false",
      options: Array.isArray(q.options) ? (q.options as unknown[]).map(String) : undefined,
      correctAnswer: String(q.correctAnswer),
      explanation: q.explanation ? String(q.explanation) : undefined,
      orderIndex: i,
    }));

  return { questions };
}

export async function generateFlashcardsFromChunks(
  chunks: TextChunk[],
  options: { cardCount: number }
): Promise<FlashcardResult> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not set.");

  const groq = new Groq({ apiKey });
  const text = chunks.map((c) => c.text).join("\n\n").slice(0, MAX_TEXT_LENGTH);
  const { cardCount } = options;

  const prompt = `You are a pharmacy professor creating study flashcards. Generate exactly ${cardCount} flashcards from the lecture content below.

Return ONLY a valid JSON array — no markdown, no code fences, no explanation outside the JSON. Each element must have:
- "front": string — a key term, drug name, concept, or short question (concise, ideally 1–8 words)
- "back": string — the definition, mechanism of action, or explanation (1–3 sentences)

Lecture content:
${text}`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });
  const raw = (completion.choices[0].message.content ?? "").trim();

  const json = raw.startsWith("```")
    ? raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim()
    : raw;

  let parsed: unknown[];
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error("AI returned malformed JSON. Please try again.");
  }

  if (!Array.isArray(parsed)) {
    throw new Error("AI response was not a valid card array.");
  }

  const cards = (parsed as Record<string, unknown>[])
    .filter((c) => c.front && c.back)
    .map((c) => ({ front: String(c.front), back: String(c.back) }));

  return { cards };
}
