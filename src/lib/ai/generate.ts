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

Return ONLY a valid JSON array. No markdown, no code fences, no explanation outside the JSON. Each element must have:
- "questionText": string
- "questionType": "multiple_choice" or "true_false"
- "options": string[] with exactly 4 options (multiple_choice only; omit this key for true_false)
- "correctAnswer": string that exactly matches one of the options (or "True" / "False")
- "explanation": string, 1–2 sentences explaining why the answer is correct

Lecture content:
${text}`;

  let completion;
  try {
    completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });
  } catch (err: unknown) {
    if ((err as { status?: number }).status === 429) {
      throw new Error("AI quota reached for today. Try again later.");
    }
    throw err;
  }
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

export async function generateSummaryFromChunks(
  chunks: TextChunk[]
): Promise<{ summary: string }> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not set.");

  const groq = new Groq({ apiKey });
  const text = chunks.map((c) => c.text).join("\n\n").slice(0, MAX_TEXT_LENGTH);

  const prompt = `You are a pharmacy professor. Read the following lecture notes and write a concise summary of the key points in exactly 5 sentences. Each sentence should cover a distinct important concept. Be specific. Include drug names, mechanisms, and clinical points where relevant.

Return ONLY the 5 sentences as a plain paragraph. No bullet points, no headers, no intro phrase like "Here is a summary."

Lecture content:
${text}`;

  let completion;
  try {
    completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });
  } catch (err: unknown) {
    if ((err as { status?: number }).status === 429) {
      throw new Error("AI quota reached for today. Try again later.");
    }
    throw err;
  }

  const summary = (completion.choices[0].message.content ?? "").trim();
  return { summary };
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

Return ONLY a valid JSON array. No markdown, no code fences, no explanation outside the JSON. Each element must have:
- "front": string: a key term, drug name, concept, or short question (concise, ideally 1–8 words)
- "back": string: the definition, mechanism of action, or explanation (1–3 sentences)

Lecture content:
${text}`;

  let completion;
  try {
    completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });
  } catch (err: unknown) {
    if ((err as { status?: number }).status === 429) {
      throw new Error("AI quota reached for today. Try again later.");
    }
    throw err;
  }
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

export async function generateMnemonic(
  drugs: string[],
  focus: "list" | "mechanism" | "side_effects"
): Promise<{ mnemonic: string; explanation: string }> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not set.");

  const groq = new Groq({ apiKey });

  const focusDescriptions = {
    list: "remembering the names of all the drugs in this group",
    mechanism: "remembering the mechanism of action for these drugs",
    side_effects: "remembering the key side effects of these drugs",
  };

  const prompt = `You are a creative pharmacy tutor famous for wild, memorable mnemonics. Generate a mnemonic or short story to help a pharmacy student remember ${focusDescriptions[focus]}.

Drugs: ${drugs.join(", ")}

Be creative. Use acronyms, rhymes, ridiculous stories, visual imagery, or word associations. The weirder and more memorable, the better.

Return ONLY a valid JSON object with:
- "mnemonic": string: the mnemonic itself (the acronym, rhyme, story, etc.)
- "explanation": string: how it maps back to the drugs or concepts (1–3 sentences)`;

  let completion;
  try {
    completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.9,
    });
  } catch (err: unknown) {
    if ((err as { status?: number }).status === 429) {
      throw new Error("AI quota reached for today. Try again later.");
    }
    throw err;
  }

  const raw = (completion.choices[0].message.content ?? "").trim();
  const json = raw.startsWith("```")
    ? raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim()
    : raw;

  try {
    const parsed = JSON.parse(json) as { mnemonic: string; explanation: string };
    if (!parsed.mnemonic || !parsed.explanation) throw new Error();
    return { mnemonic: String(parsed.mnemonic), explanation: String(parsed.explanation) };
  } catch {
    throw new Error("AI returned malformed response. Please try again.");
  }
}

export interface RxLab {
  name: string;
  value: string;
  normal: string;
}

export interface RxScenario {
  patientProfile: {
    age: number;
    weight: string;
    conditions: string[];
    allergies: string[];
    currentMeds: string[];
    labs: RxLab[];
  };
  prescription: {
    drug: string;
    dose: string;
    route: string;
    frequency: string;
    indication: string;
  };
  hasError: boolean;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export async function generateRxScenario(): Promise<RxScenario> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not set.");

  const groq = new Groq({ apiKey });

  const prompt = `You are a pharmacy professor creating a prescription verification exam question. Generate a realistic clinical scenario for a student to review.

Return ONLY a valid JSON object with these exact fields:
- "patientProfile": {
    "age": number,
    "weight": string (e.g. "72 kg"),
    "conditions": string[] (2–4 diagnoses),
    "allergies": string[] (0–2 drug allergies, use [] if none),
    "currentMeds": string[] (1–3 medications with doses),
    "labs": [{ "name": string, "value": string, "normal": string }] (1–3 relevant labs)
  }
- "prescription": {
    "drug": string,
    "dose": string,
    "route": string,
    "frequency": string,
    "indication": string
  }
- "hasError": boolean
- "options": string[] exactly 4 answer choices. Always include "This prescription is correct. No changes needed." as one option. If hasError is false, that is the correct answer. If hasError is true, one option must correctly and specifically identify the error; the rest are plausible distractors.
- "correctAnswer": string that must exactly match one of the options strings
- "explanation": string with 2-3 sentences explaining why the prescription is or is not appropriate

Rules:
- Errors must be clinically meaningful (e.g., metformin with severe renal impairment, NSAID with active peptic ulcer, drug given to allergic patient, renally-dosed drug not adjusted for low eGFR, dangerous drug-drug interaction)
- Use realistic drug names, doses, and frequencies
- Approximately 70% of scenarios should have an error, 30% should be valid
- Labs should be directly relevant to the prescription decision`;

  let completion;
  try {
    completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
    });
  } catch (err: unknown) {
    if ((err as { status?: number }).status === 429) {
      throw new Error("AI quota reached for today. Try again later.");
    }
    throw err;
  }

  const raw = (completion.choices[0].message.content ?? "").trim();
  const json = raw.startsWith("```")
    ? raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim()
    : raw;

  try {
    const parsed = JSON.parse(json) as RxScenario;
    if (!parsed.patientProfile || !parsed.prescription || !parsed.options || !parsed.correctAnswer) {
      throw new Error();
    }
    return parsed;
  } catch {
    throw new Error("AI returned malformed response. Please try again.");
  }
}
