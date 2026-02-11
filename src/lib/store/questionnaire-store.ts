import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  QuestionnaireState,
  QuestionnaireActions,
  QuestionFeedback,
  GeneratedCourse,
} from "@/types";

const initialState: QuestionnaireState = {
  currentQuestionIndex: 0,
  answers: {},
  questionFeedback: {},
  completedQuestionIds: [],
  generatedCourse: null,
};

export const useQuestionnaireStore = create<QuestionnaireState & QuestionnaireActions>()(
  persist(
    (set) => ({
      ...initialState,

      setAnswer: (questionId: string, value: string | string[]) => {
        set((state) => ({
          answers: {
            ...state.answers,
            [questionId]: value,
          },
        }));
      },

      setCurrentQuestion: (index: number) => {
        set({ currentQuestionIndex: index });
      },

      markQuestionComplete: (questionId: string) => {
        set((state) => ({
          completedQuestionIds: state.completedQuestionIds.includes(questionId)
            ? state.completedQuestionIds
            : [...state.completedQuestionIds, questionId],
        }));
      },

      setQuestionFeedback: (questionId: string, feedback: QuestionFeedback) => {
        set((state) => ({
          questionFeedback: {
            ...state.questionFeedback,
            [questionId]: feedback,
          },
        }));
      },

      setGeneratedCourse: (course: GeneratedCourse) => {
        set({ generatedCourse: course });
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: "canvas-course-wizard-v2-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
