"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Home } from "lucide-react";

import { useQuestionnaireStore } from "@/lib/store/questionnaire-store";
import { getAllQuestions, getSectionForQuestion } from "@/config/questions";

import ProgressBar from "@/components/ui/ProgressBar";
import QuestionCard from "@/components/questionnaire/QuestionCard";
import QuestionFeedbackPanel from "@/components/questionnaire/QuestionFeedbackPanel";
import SkillListInput from "@/components/questionnaire/SkillListInput";
import SkillDetailInput from "@/components/questionnaire/SkillDetailInput";
import type { QuestionFeedback } from "@/types";

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

  // Per-item feedback state for skill-list and skill-detail
  const [feedbackLoadingIndex, setFeedbackLoadingIndex] = useState<number | null>(null);
  const [itemEditedSinceFeedback, setItemEditedSinceFeedback] = useState<Record<number, boolean>>({});

  const currentQuestion = allQuestions[currentQuestionIndex];
  const currentSection = currentQuestion
    ? getSectionForQuestion(currentQuestion.id)
    : null;

  // Get current answer — default to array for skill types, string for others
  const currentAnswer = useMemo(() => {
    if (!currentQuestion) return "";
    const stored = answers[currentQuestion.id];
    if (currentQuestion.type === "skill-list") {
      return Array.isArray(stored) ? stored : ["", "", ""];
    }
    if (currentQuestion.type === "skill-detail") {
      const parentId = currentQuestion.parentQuestionId;
      const parentSkills = parentId ? (answers[parentId] as string[] || []) : [];
      if (Array.isArray(stored)) {
        // Ensure array length matches parent skills
        if (stored.length < parentSkills.length) {
          return [...stored, ...Array(parentSkills.length - stored.length).fill("")];
        }
        return stored.slice(0, parentSkills.length);
      }
      return Array(parentSkills.length).fill("");
    }
    return stored || "";
  }, [currentQuestion, answers]);

  const currentFeedback = currentQuestion
    ? questionFeedback[currentQuestion.id] || null
    : null;

  // Build per-item feedback map for skill-list/skill-detail questions
  const feedbackByIndex = useMemo((): Record<number, QuestionFeedback | null> => {
    if (!currentQuestion || !["skill-list", "skill-detail"].includes(currentQuestion.type)) return {};
    const result: Record<number, QuestionFeedback | null> = {};
    const arr = Array.isArray(currentAnswer) ? currentAnswer : [];
    for (let i = 0; i < arr.length; i++) {
      const key = `${currentQuestion.id}:${i}`;
      result[i] = questionFeedback[key] || null;
    }
    return result;
  }, [currentQuestion, currentAnswer, questionFeedback]);

  // Determine if this is the first question in a new section
  const isFirstQuestionInSection = useMemo(() => {
    if (!currentQuestion || !currentSection) return false;
    return currentSection.questions[0]?.id === currentQuestion.id;
  }, [currentQuestion, currentSection]);

  // Get parent skills for skill-detail questions
  const parentSkills = useMemo((): string[] => {
    if (!currentQuestion || currentQuestion.type !== "skill-detail") return [];
    const parentId = currentQuestion.parentQuestionId;
    if (!parentId) return [];
    const parentAnswer = answers[parentId];
    return Array.isArray(parentAnswer) ? parentAnswer.filter(s => s.trim()) : [];
  }, [currentQuestion, answers]);

  // Get sibling answers for skill-detail (e.g., Q10 activities shown on Q11)
  const siblingAnswers = useMemo((): Record<string, string[]> | undefined => {
    if (!currentQuestion || currentQuestion.type !== "skill-detail") return undefined;
    // For Q11 (skill-assessments), show Q10 (skill-activities) as sibling context
    if (currentQuestion.id === "skill-assessments") {
      const activities = answers["skill-activities"];
      if (Array.isArray(activities)) {
        return { "skill-activities": activities };
      }
    }
    return undefined;
  }, [currentQuestion, answers]);

  // Validate current question
  const validateCurrent = (): boolean => {
    if (!currentQuestion) return false;
    const value = answers[currentQuestion.id] || "";

    // Validation for skill-list
    if (currentQuestion.type === "skill-list") {
      const arr = Array.isArray(value) ? value : [];
      const filledItems = arr.filter(s => s.trim().length > 0);
      if (currentQuestion.required && filledItems.length < 3) {
        setValidationError("Please enter at least 3 skills");
        return false;
      }
      if (currentQuestion.validation?.minLength) {
        const tooShort = filledItems.find(s => s.trim().length < currentQuestion.validation!.minLength!);
        if (tooShort) {
          setValidationError(`Each skill must be at least ${currentQuestion.validation.minLength} characters`);
          return false;
        }
      }
      setValidationError(null);
      return true;
    }

    // Validation for skill-detail
    if (currentQuestion.type === "skill-detail") {
      const arr = Array.isArray(value) ? value : [];
      if (currentQuestion.required) {
        const emptyIndex = arr.findIndex((s, i) => i < parentSkills.length && !s.trim());
        if (emptyIndex !== -1) {
          setValidationError(`Please provide a response for Skill ${emptyIndex + 1}`);
          return false;
        }
      }
      if (currentQuestion.validation?.minLength) {
        const tooShort = arr.findIndex((s, i) => i < parentSkills.length && s.trim().length > 0 && s.trim().length < currentQuestion.validation!.minLength!);
        if (tooShort !== -1) {
          setValidationError(`Each response must be at least ${currentQuestion.validation.minLength} characters`);
          return false;
        }
      }
      setValidationError(null);
      return true;
    }

    // Standard validation
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

  // Handle answer change (standard questions)
  const handleAnswerChange = (value: string | string[]) => {
    setAnswer(currentQuestion.id, value);
    setAnswerEditedSinceFeedback(true);
    if (validationError) setValidationError(null);
  };

  // Handle answer change for skill-list/skill-detail (array of items)
  const handleSkillAnswerChange = useCallback((values: string[]) => {
    setAnswer(currentQuestion.id, values);
    if (validationError) setValidationError(null);
  }, [currentQuestion?.id, setAnswer, validationError]);

  // Handle per-item edit tracking
  const handleSkillItemChange = useCallback((values: string[]) => {
    // Find which items changed to track per-item edit state
    const oldValues = Array.isArray(answers[currentQuestion.id]) ? answers[currentQuestion.id] as string[] : [];
    const newEdited = { ...itemEditedSinceFeedback };
    for (let i = 0; i < values.length; i++) {
      if (values[i] !== (oldValues[i] || "")) {
        newEdited[i] = true;
      }
    }
    setItemEditedSinceFeedback(newEdited);
    handleSkillAnswerChange(values);
  }, [currentQuestion?.id, answers, itemEditedSinceFeedback, handleSkillAnswerChange]);

  // Request LLM feedback (standard questions)
  const handleRequestFeedback = async () => {
    if (!currentQuestion?.feedbackEnabled || !currentQuestion?.feedbackInstructions) return;
    if (!validateCurrent()) return;

    setIsFeedbackLoading(true);
    setFeedbackError(null);

    try {
      const contextAnswers: Record<string, string | string[]> = {};
      for (let i = 0; i < currentQuestionIndex; i++) {
        const q = allQuestions[i];
        if (answers[q.id]) {
          contextAnswers[q.label] = answers[q.id];
        }
      }

      const answer = Array.isArray(currentAnswer) ? currentAnswer.join(", ") : currentAnswer;

      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          questionLabel: currentQuestion.label,
          answer,
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

  // Request per-item LLM feedback (skill-list/skill-detail)
  const handleRequestItemFeedback = useCallback(async (index: number) => {
    if (!currentQuestion?.feedbackEnabled || !currentQuestion?.feedbackInstructions) return;

    const values = Array.isArray(currentAnswer) ? currentAnswer : [];
    const itemText = values[index];
    if (!itemText || !itemText.trim()) return;

    setFeedbackLoadingIndex(index);

    try {
      // Build context including the skill name for skill-detail questions
      const contextAnswers: Record<string, string | string[]> = {};
      for (let i = 0; i < currentQuestionIndex; i++) {
        const q = allQuestions[i];
        if (answers[q.id]) {
          contextAnswers[q.label] = answers[q.id];
        }
      }

      // For skill-detail, add the specific skill as context
      let labelContext = `${currentQuestion.label} (Item ${index + 1})`;
      if (currentQuestion.type === "skill-detail" && parentSkills[index]) {
        labelContext = `${currentQuestion.label} — Skill: "${parentSkills[index]}"`;
        // Also include the specific skill's activities as context for Q11
        if (currentQuestion.id === "skill-assessments") {
          const activities = answers["skill-activities"];
          if (Array.isArray(activities) && activities[index]) {
            contextAnswers["Activities for this skill"] = activities[index];
          }
        }
      }

      if (currentQuestion.type === "skill-list") {
        labelContext = `Course Skill/Objective ${index + 1}`;
      }

      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: `${currentQuestion.id}:${index}`,
          questionLabel: labelContext,
          answer: itemText,
          feedbackInstructions: currentQuestion.feedbackInstructions,
          contextAnswers,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Feedback request failed");
      }

      const data = await response.json();
      setQuestionFeedback(`${currentQuestion.id}:${index}`, data.feedback);
      setItemEditedSinceFeedback((prev: Record<number, boolean>) => ({ ...prev, [index]: false }));
    } catch (err: unknown) {
      console.error("Item feedback error:", err);
    } finally {
      setFeedbackLoadingIndex(null);
    }
  }, [currentQuestion, currentAnswer, currentQuestionIndex, allQuestions, answers, parentSkills, setQuestionFeedback]);

  // Sync skill-detail arrays when navigating forward from skill-list
  const syncDependentArrays = useCallback(() => {
    if (currentQuestion?.type !== "skill-list") return;
    const skills = Array.isArray(answers[currentQuestion.id]) ? answers[currentQuestion.id] as string[] : [];
    const filledCount = skills.filter(s => s.trim()).length;

    // Find all skill-detail questions that depend on this question
    for (const q of allQuestions) {
      if (q.type === "skill-detail" && q.parentQuestionId === currentQuestion.id) {
        const existing = Array.isArray(answers[q.id]) ? answers[q.id] as string[] : [];
        if (existing.length !== filledCount) {
          const adjusted = existing.slice(0, filledCount);
          while (adjusted.length < filledCount) adjusted.push("");
          setAnswer(q.id, adjusted);
        }
      }
    }
  }, [currentQuestion, answers, allQuestions, setAnswer]);

  // Navigate forward
  const handleNext = () => {
    if (!validateCurrent()) return;
    syncDependentArrays();
    markQuestionComplete(currentQuestion.id);

    if (currentQuestionIndex < allQuestions.length - 1) {
      setCurrentQuestion(currentQuestionIndex + 1);
      setAnswerEditedSinceFeedback(false);
      setItemEditedSinceFeedback({});
      setFeedbackLoadingIndex(null);
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
      setItemEditedSinceFeedback({});
      setFeedbackLoadingIndex(null);
    }
  };

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const isSkillType = currentQuestion.type === "skill-list" || currentQuestion.type === "skill-detail";

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

        {/* Question content */}
        <div className="card">
          {/* Skill-list type (Q9) */}
          {currentQuestion.type === "skill-list" && (
            <SkillListInput
              question={currentQuestion}
              values={Array.isArray(currentAnswer) ? currentAnswer as string[] : ["", "", ""]}
              onChange={handleSkillItemChange}
              feedbackByIndex={feedbackByIndex}
              feedbackLoadingIndex={feedbackLoadingIndex}
              onRequestItemFeedback={handleRequestItemFeedback}
              itemEditedSinceFeedback={itemEditedSinceFeedback}
              error={validationError || undefined}
            />
          )}

          {/* Skill-detail type (Q10, Q11) */}
          {currentQuestion.type === "skill-detail" && (
            <SkillDetailInput
              question={currentQuestion}
              values={Array.isArray(currentAnswer) ? currentAnswer as string[] : []}
              parentSkills={parentSkills}
              siblingAnswers={siblingAnswers}
              onChange={handleSkillItemChange}
              feedbackByIndex={feedbackByIndex}
              feedbackLoadingIndex={feedbackLoadingIndex}
              onRequestItemFeedback={handleRequestItemFeedback}
              itemEditedSinceFeedback={itemEditedSinceFeedback}
              error={validationError || undefined}
            />
          )}

          {/* Standard question types */}
          {!isSkillType && (
            <>
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
            </>
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
