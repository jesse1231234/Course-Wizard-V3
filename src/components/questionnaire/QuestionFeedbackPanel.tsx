"use client";

import { Lightbulb, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import type { QuestionFeedback } from "@/types";

interface QuestionFeedbackPanelProps {
  questionId: string;
  feedback: QuestionFeedback | null;
  isLoading: boolean;
  error: string | null;
  onRequestFeedback: () => void;
  hasBeenEdited: boolean;
}

export default function QuestionFeedbackPanel({
  feedback,
  isLoading,
  error,
  onRequestFeedback,
  hasBeenEdited,
}: QuestionFeedbackPanelProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
        <div className="flex items-center gap-3 text-indigo-700">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm font-medium">Getting feedback...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
        <div className="flex items-center gap-2 text-red-700 mb-2">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm font-medium">Feedback unavailable</span>
        </div>
        <p className="text-sm text-red-600 mb-3">{error}</p>
        <button
          onClick={onRequestFeedback}
          className="btn-secondary text-sm py-1.5 px-3 flex items-center gap-1.5"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Try Again
        </button>
      </div>
    );
  }

  // Has feedback
  if (feedback) {
    return (
      <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
        <div className="flex items-center gap-2 text-indigo-700 mb-2">
          <Lightbulb className="h-5 w-5" />
          <span className="text-sm font-medium">AI Feedback</span>
        </div>

        <p className="text-sm text-slate-700 mb-3">{feedback.feedback}</p>

        {feedback.suggestions && feedback.suggestions.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-medium text-slate-500 mb-1">Suggestions:</p>
            <ul className="list-disc list-inside space-y-1">
              {feedback.suggestions.map((suggestion, i) => (
                <li key={i} className="text-sm text-slate-600">{suggestion}</li>
              ))}
            </ul>
          </div>
        )}

        {hasBeenEdited && (
          <button
            onClick={onRequestFeedback}
            className="btn-secondary text-sm py-1.5 px-3 flex items-center gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Get Updated Feedback
          </button>
        )}
      </div>
    );
  }

  // No feedback yet — show the request button
  return (
    <div className="mt-4">
      <button
        onClick={onRequestFeedback}
        className="btn-secondary text-sm py-2 px-4 flex items-center gap-2"
      >
        <Lightbulb className="h-4 w-4" />
        Get AI Feedback
      </button>
    </div>
  );
}
