"use client";

interface ProgressBarProps {
  currentIndex: number;
  totalQuestions: number;
  currentSectionTitle?: string;
  completedCount: number;
}

export default function ProgressBar({
  currentIndex,
  totalQuestions,
  currentSectionTitle,
  completedCount,
}: ProgressBarProps) {
  const progressPercent = totalQuestions > 0
    ? Math.round((completedCount / totalQuestions) * 100)
    : 0;

  return (
    <nav aria-label="Progress" className="mb-8">
      {/* Progress bar */}
      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-primary-600 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Progress text */}
      <div className="flex items-center justify-between mt-2">
        <span className="text-sm font-medium text-slate-700">
          Question {currentIndex + 1} of {totalQuestions}
        </span>
        {currentSectionTitle && (
          <span className="text-sm text-slate-500">
            {currentSectionTitle}
          </span>
        )}
      </div>
    </nav>
  );
}
