export interface QuizQuestion {
  id: string;
  questionText: string;
  questionType: "multiple_choice" | "true_false" | "short_answer";
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  orderIndex: number;
}

export interface QuizWithQuestions {
  id: string;
  title: string;
  sourceFilename: string;
  questionCount: number;
  status: "processing" | "ready" | "failed";
  createdAt: string;
  questions: QuizQuestion[];
}

export interface QuizAttemptAnswer {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
}

export interface ProcessingResult {
  success: boolean;
  quizId?: string;
  questions?: QuizQuestion[];
  isOneOff?: boolean;
  error?: string;
}
