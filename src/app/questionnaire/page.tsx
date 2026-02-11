"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Home } from "lucide-react";

import { useQuestionnaireStore } from "@/lib/store/questionnaire-store";
import { getAllQuestions, getSectionForQuestion } from "@/config/questions";

import ProgressBar from "@/components/ui/ProgressBar";
import QuestionCard from "@/components/questionnaire/QuestionCard";
import QuestionFeedbackPanel from "@/components/questionnaire/QuestionFeedbackPanel";

export default function QuestionnairePage() {
  const router = useRouter();

  const allQuestions = useMemo(() => getAllQuestions(), []);

  const {
    currentQuestionIndex,
    answers,
    questionFeedback,
    completedQuestionIds,
    setAnswer,
    setCurrentQuestion,
    markQuestionComplete,
    setQuestionFeedback,
  } = useQuestionnaireStore();

  const [validationError, setValidationError] = useState<string | null>(null);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [answerEditedSinceFeedback, setAnswerEditedSinceFeedback] = useState(false);

  const currentQuestion = allQuestions[currentQuestionIndex];
  const currentSection = currentQuestion
    ? getSectionForQuestion(currentQuestion.id)
    : null;
  const currentAnswer = currentQuestion
    ? answers[currentQuestion.id] || ""
    : "";
  const currentFeedback = currentQuestion
    ? questionFeedback[currentQuestion.id] || null
    : null;

  // Determine if this is the first question in a new section
  const isFirstQuestionInSection = useMemo(() => {
    if (!currentQuestion || !currentSection) return false;
    return currentSection.questions[0]?.id === currentQuestion.id;
  }, [currentQuestion, currentSection]);

  // Validate current question
  const validateCurrent = (): boolean => {
    if (!currentQuestion) return false;
    const value = answers[currentQuestion.id] || "";
    const stringValue = Array.isArray(value) ? value.join("") : value;

    if (currentQuestion.required && (!stringValue || stringValue.trim() === "")) {
      setValidationError("This field is required");
      return false;
    }

    if (currentQuestion.validation?.minLength && stringValue.length < currentQuestion.validation.minLength) {
      setValidationError(`Minimum ${currentQuestion.validation.minLength} characters required`);
      return false;
    }

    if (currentQuestion.validation?.maxLength && stringValue.length > currentQuestion.validation.maxLength) {
      setValidationError(`Maximum ${currentQuestion.validation.maxLength} characters allowed`);
      return false;
    }

    if (currentQuestion.type === "multiselect" && currentQuestion.required) {
      if (!Array.isArray(value) || value.length === 0) {
        setValidationError("Please select at least one option");
        return false;
      }
    }

    if (currentQuestion.type === "number" && currentQuestion.validation) {
      const numVal = Number(stringValue);
      if (currentQuestion.validation.min !== undefined && numVal < currentQuestion.validation.min) {
        setValidationError(`Minimum value is ${currentQuestion.validation.min}`);
        return false;
      }
      if (currentQuestion.validation.max !== undefined && numVal > currentQuestion.validation.max) {
        setValidationError(`Maximum value is ${currentQuestion.validation.max}`);
        return false;
      }
    }

    setValidationError(null);
    return true;
  };

  // Handle answer change
  const handleAnswerChange = (value: string | string[]) => {
    setAnswer(currentQuestion.id, value);
    setAnswerEditedSinceFeedback(true);
    if (validationError) setValidationError(null);
  };

  // Request LLM feedback
  const handleRequestFeedback = async () => {
    if (!currentQuestion?.feedbackEnabled || !currentQuestion?.feedbackInstructions) return;
    if (!validateCurrent()) return;

    setIsFeedbackLoading(true);
    setFeedbackError(null);

    try {
      // Build context from previously answered questions
      const contextAnswers: Record<string, string | string[]> = {};
      for (let i = 0; i < currentQuestionIndex; i++) {
        const q = allQuestions[i];
        if (answers[q.id]) {
          contextAnswers[q.label] = answers[q.id];
        }
      }

      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          questionLabel: currentQuestion.label,
          answer: Array.isArray(currentAnswer) ? currentAnswer.join(", ") : currentAnswer,
          feedbackInstructions: currentQuestion.feedbackInstructions,
          contextAnswers,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Feedback request failed");
      }

      const data = await response.json();
      setQuestionFeedback(currentQuestion.id, data.feedback);
      setAnswerEditedSinceFeedback(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Feedback request failed";
      setFeedbackError(message);
    } finally {
      setIsFeedbackLoading(false);
    }
  };

  // Navigate forward
  const handleNext = () => {
    if (!validateCurrent()) return;
    markQuestionComplete(currentQuestion.id);

    if (currentQuestionIndex < allQuestions.length - 1) {
      setCurrentQuestion(currentQuestionIndex + 1);
      setAnswerEditedSinceFeedback(false);
      setValidationError(null);
      setFeedbackError(null);
    } else {
      router.push("/review");
    }
  };

  // Navigate backward
  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestion(currentQuestionIndex - 1);
      setValidationError(null);
      setFeedbackError(null);
      setAnswerEditedSinceFeedback(false);
    }
  };

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <div className="text-sm text-slate-500">
              Question {currentQuestionIndex + 1} of {allQuestions.length}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Progress bar */}
        <ProgressBar
          currentIndex={currentQuestionIndex}
          totalQuestions={allQuestions.length}
          currentSectionTitle={currentSection?.title}
          completedCount={completedQuestionIds.length}
        />

        {/* Section header — show when entering a new section */}
        {isFirstQuestionInSection && currentSection && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">
              {currentSection.title}
            </h1>
            <p className="text-slate-600 mt-2">{currentSection.description}</p>
          </div>
        )}

        {/* Question card */}
        <div className="card">
          <QuestionCard
            question={currentQuestion}
            value={currentAnswer}
            onChange={handleAnswerChange}
            error={validationError || undefined}
            standalone
          />

          {/* Feedback panel — only for feedback-enabled questions */}
          {currentQuestion.feedbackEnabled && (
            <QuestionFeedbackPanel
              questionId={currentQuestion.id}
              feedback={currentFeedback}
              isLoading={isFeedbackLoading}
              error={feedbackError}
              onRequestFeedback={handleRequestFeedback}
              hasBeenEdited={answerEditedSinceFeedback}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={handleBack}
            disabled={currentQuestionIndex === 0}
            className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <button
            onClick={handleNext}
            className="btn-primary flex items-center gap-2"
          >
            {currentQuestionIndex === allQuestions.length - 1
              ? "Review & Generate"
              : "Next"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </main>
    </div>
  );
}
