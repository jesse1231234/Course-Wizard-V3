// Question types
export type QuestionType = "text" | "textarea" | "select" | "multiselect" | "number";

export interface QuestionOption {
  value: string;
  label: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  label: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  options?: QuestionOption[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
  feedbackEnabled?: boolean;
  feedbackInstructions?: string;
}

export interface Section {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

// Per-question LLM feedback
export interface QuestionFeedback {
  questionId: string;
  feedback: string;
  suggestions?: string[];
  timestamp: string;
}

// Canvas generation types
export interface CanvasModule {
  id: string;
  name: string;
  position: number;
  items: CanvasModuleItem[];
}

export interface CanvasModuleItem {
  id: string;
  type: "page" | "assignment" | "discussion" | "quiz" | "file" | "header";
  title: string;
  content?: string;
  position: number;
  // Assignment-specific
  points?: number;
  dueDate?: string;
  rubric?: CanvasRubric;
  // Quiz-specific
  questions?: QuizQuestion[];
  // Discussion-specific
  prompt?: string;
}

export interface CanvasRubric {
  title: string;
  criteria: CanvasRubricCriterion[];
}

export interface CanvasRubricCriterion {
  description: string;
  points: number;
  ratings: {
    description: string;
    points: number;
  }[];
}

export interface QuizQuestion {
  type: "multiple_choice" | "short_answer" | "essay";
  text: string;
  points: number;
  answers?: {
    text: string;
    correct: boolean;
  }[];
}

export interface GeneratedCourse {
  title: string;
  description: string;
  welcomeMessage: string;
  modules: CanvasModule[];
}

// Store types
export interface QuestionnaireState {
  currentQuestionIndex: number;
  answers: Record<string, string | string[]>;
  questionFeedback: Record<string, QuestionFeedback>;
  completedQuestionIds: string[];
  generatedCourse: GeneratedCourse | null;
}

export interface QuestionnaireActions {
  setAnswer: (questionId: string, value: string | string[]) => void;
  setCurrentQuestion: (index: number) => void;
  markQuestionComplete: (questionId: string) => void;
  setQuestionFeedback: (questionId: string, feedback: QuestionFeedback) => void;
  setGeneratedCourse: (course: GeneratedCourse) => void;
  reset: () => void;
}

// API types
export interface GenerateCanvasRequest {
  answers: Record<string, string | string[]>;
}

export interface GenerateCanvasResponse {
  course: GeneratedCourse;
}
