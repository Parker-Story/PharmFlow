export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type QuizStatus = "processing" | "ready" | "failed";
export type QuestionType = "multiple_choice" | "true_false" | "short_answer";
export type NotecardStatus = "processing" | "ready" | "failed";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      folders: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          parent_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          parent_id?: string | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          parent_id?: string | null;
        };
        Relationships: [];
      };
      quizzes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          source_filename: string;
          question_count: number;
          status: QuizStatus;
          folder_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          source_filename: string;
          question_count?: number;
          status?: QuizStatus;
          folder_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          question_count?: number;
          status?: QuizStatus;
          folder_id?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      questions: {
        Row: {
          id: string;
          quiz_id: string;
          question_text: string;
          question_type: QuestionType;
          options: Json | null;
          correct_answer: string;
          explanation: string | null;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          quiz_id: string;
          question_text: string;
          question_type: QuestionType;
          options?: Json | null;
          correct_answer: string;
          explanation?: string | null;
          order_index: number;
          created_at?: string;
        };
        Update: {
          question_text?: string;
          options?: Json | null;
          correct_answer?: string;
          explanation?: string | null;
          order_index?: number;
        };
        Relationships: [];
      };
      notecard_sets: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          source_filename: string;
          card_count: number;
          status: NotecardStatus;
          folder_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          source_filename: string;
          card_count?: number;
          status?: NotecardStatus;
          folder_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          card_count?: number;
          status?: NotecardStatus;
          folder_id?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      notecards: {
        Row: {
          id: string;
          set_id: string;
          front: string;
          back: string;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          set_id: string;
          front: string;
          back: string;
          order_index: number;
          created_at?: string;
        };
        Update: {
          front?: string;
          back?: string;
          order_index?: number;
        };
        Relationships: [];
      };
      quiz_attempts: {
        Row: {
          id: string;
          quiz_id: string;
          user_id: string;
          score: number | null;
          total_questions: number;
          answers: Json;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          quiz_id: string;
          user_id: string;
          score?: number | null;
          total_questions: number;
          answers?: Json;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          score?: number | null;
          answers?: Json;
          completed_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      question_type: QuestionType;
      quiz_status: QuizStatus;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Folder = Database["public"]["Tables"]["folders"]["Row"];
export type Quiz = Database["public"]["Tables"]["quizzes"]["Row"];
export type Question = Database["public"]["Tables"]["questions"]["Row"];
export type QuizAttempt = Database["public"]["Tables"]["quiz_attempts"]["Row"];
export type NotecardSet = Database["public"]["Tables"]["notecard_sets"]["Row"];
export type Notecard = Database["public"]["Tables"]["notecards"]["Row"];
