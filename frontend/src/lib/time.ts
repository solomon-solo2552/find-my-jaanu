import { differenceInDays, differenceInSeconds, format, isYesterday } from "date-fns";

/**
 * Returns a short relative time string:
 *   < 60s   → "45s"
 *   < 60m   → "5m"
 *   < 24h   → "3h"
 *   yesterday → "Yesterday"
 *   this week → "Tue"
 *   older    → "Sep 15"
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = differenceInDays(now, date);

  if (diffDays === 0) {
    const diffSeconds = differenceInSeconds(now, date);

    if (diffSeconds < 60) {
      return `${Math.max(1, diffSeconds)}s`;
    }

    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) {
      return `${diffMinutes}m`;
    }

    const diffHours = Math.floor(diffMinutes / 60);
    return `${diffHours}h`;
  }

  if (diffDays === 1 || isYesterday(date)) {
    return "Yesterday";
  }

  if (diffDays < 7) {
    return format(date, "EEE"); // "Mon", "Tue"
  }

  return format(date, "MMM d"); // "Sep 15"
}