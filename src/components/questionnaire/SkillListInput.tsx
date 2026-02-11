"use client";

import { Plus, X } from "lucide-react";
import type { Question, QuestionFeedback } from "@/types";
import QuestionFeedbackPanel from "./QuestionFeedbackPanel";

interface SkillListInputProps {
  question: Question;
  values: string[];
  onChange: (values: string[]) => void;
  feedbackByIndex: Record<number, QuestionFeedback | null>;
  feedbackLoadingIndex: number | null;
  onRequestItemFeedback: (index: number) => void;
  itemEditedSinceFeedback: Record<number, boolean>;
  error?: string;
}

const MIN_SKILLS = 3;
const MAX_SKILLS = 6;

export default function SkillListInput({
  question,
  values,
  onChange,
  feedbackByIndex,
  feedbackLoadingIndex,
  onRequestItemFeedback,
  itemEditedSinceFeedback,
  error,
}: SkillListInputProps) {
  const handleItemChange = (index: number, text: string) => {
    const updated = [...values];
    updated[index] = text;
    onChange(updated);
  };

  const handleAddSkill = () => {
    if (values.length < MAX_SKILLS) {
      onChange([...values, ""]);
    }
  };

  const handleRemoveSkill = (index: number) => {
    if (values.length > MIN_SKILLS) {
      const updated = values.filter((_, i) => i !== index);
      onChange(updated);
    }
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

      {/* Skill items */}
      <div className="space-y-4">
        {values.map((value, index) => (
          <div key={index} className="border border-slate-200 rounded-lg p-4 bg-white">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-indigo-600">
                Skill {index + 1}
              </span>
              {values.length > MIN_SKILLS && (
                <button
                  onClick={() => handleRemoveSkill(index)}
                  className="ml-auto text-slate-400 hover:text-red-500 transition-colors"
                  title="Remove skill"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <input
              type="text"
              className="input w-full"
              placeholder={`e.g., Analyze datasets using Python to identify meaningful patterns`}
              value={value}
              onChange={(e) => handleItemChange(index, e.target.value)}
            />

            {/* Per-item feedback */}
            {question.feedbackEnabled && value.trim().length > 0 && (
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

      {/* Add skill button */}
      {values.length < MAX_SKILLS && (
        <button
          onClick={handleAddSkill}
          className="mt-4 btn-secondary flex items-center gap-2 text-sm"
        >
          <Plus className="h-4 w-4" />
          Add Skill ({values.length}/{MAX_SKILLS})
        </button>
      )}
    </div>
  );
}
