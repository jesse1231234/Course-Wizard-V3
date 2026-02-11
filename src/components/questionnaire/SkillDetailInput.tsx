"use client";

import type { Question, QuestionFeedback } from "@/types";
import QuestionFeedbackPanel from "./QuestionFeedbackPanel";

interface SkillDetailInputProps {
  question: Question;
  values: string[];
  parentSkills: string[];
  siblingAnswers?: Record<string, string[]>;
  onChange: (values: string[]) => void;
  feedbackByIndex: Record<number, QuestionFeedback | null>;
  feedbackLoadingIndex: number | null;
  onRequestItemFeedback: (index: number) => void;
  itemEditedSinceFeedback: Record<number, boolean>;
  error?: string;
}

export default function SkillDetailInput({
  question,
  values,
  parentSkills,
  siblingAnswers,
  onChange,
  feedbackByIndex,
  feedbackLoadingIndex,
  onRequestItemFeedback,
  itemEditedSinceFeedback,
  error,
}: SkillDetailInputProps) {
  const handleItemChange = (index: number, text: string) => {
    const updated = [...values];
    updated[index] = text;
    onChange(updated);
  };

  return (
    <div>
      {/* Question label */}
      <label className="block text-lg font-semibold text-slate-900 mb-1">
        {question.label}
      </label>
      {question.description && (
        <p className="text-sm text-slate-500 mb-4">{question.description}</p>
      )}

      {error && (
        <p className="text-sm text-red-600 mb-3">{error}</p>
      )}

      {/* One section per skill */}
      <div className="space-y-5">
        {parentSkills.map((skill, index) => (
          <div key={index} className="border border-slate-200 rounded-lg p-4 bg-white">
            {/* Skill header */}
            <div className="mb-3">
              <span className="inline-block text-sm font-medium text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                Skill {index + 1}: {skill}
              </span>
            </div>

            {/* Sibling context (e.g., activities from Q10 shown on Q11) */}
            {siblingAnswers && Object.entries(siblingAnswers).map(([questionId, answers]) => {
              const siblingText = answers[index];
              if (!siblingText) return null;
              return (
                <div key={questionId} className="mb-3 pl-3 border-l-2 border-slate-200">
                  <p className="text-xs font-medium text-slate-400 mb-1">Activities:</p>
                  <p className="text-sm text-slate-500">{siblingText}</p>
                </div>
              );
            })}

            {/* Text input */}
            <textarea
              className="textarea w-full min-h-[100px]"
              placeholder={question.placeholder || "Describe your response for this skill..."}
              value={values[index] || ""}
              onChange={(e) => handleItemChange(index, e.target.value)}
              rows={4}
            />

            {/* Per-item feedback */}
            {question.feedbackEnabled && (values[index] || "").trim().length > 0 && (
              <QuestionFeedbackPanel
                questionId={`${question.id}:${index}`}
                feedback={feedbackByIndex[index] || null}
                isLoading={feedbackLoadingIndex === index}
                error={null}
                onRequestFeedback={() => onRequestItemFeedback(index)}
                hasBeenEdited={itemEditedSinceFeedback[index] || false}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
