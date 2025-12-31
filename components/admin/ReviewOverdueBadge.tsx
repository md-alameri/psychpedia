'use client';

interface ReviewOverdueBadgeProps {
  daysOverdue?: number;
  daysUntilReview?: number;
  isOverdue: boolean;
}

export default function ReviewOverdueBadge({
  daysOverdue,
  daysUntilReview,
  isOverdue,
}: ReviewOverdueBadgeProps) {
  if (isOverdue && daysOverdue) {
    if (daysOverdue > 90) {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
          {daysOverdue} days overdue
        </span>
      );
    } else if (daysOverdue > 30) {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
          {daysOverdue} days overdue
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
          {daysOverdue} days overdue
        </span>
      );
    }
  }
  
  if (daysUntilReview !== undefined) {
    if (daysUntilReview <= 30) {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
          Due in {daysUntilReview} days
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
          Up to date
        </span>
      );
    }
  }
  
  return null;
}

