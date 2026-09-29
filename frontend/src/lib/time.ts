import { formatDistanceToNowStrict, isToday, isYesterday, format, differenceInDays } from "date-fns";

export function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = differenceInDays(now, date);

    if (diffDays === 0) {
        // Today - show "5m", "3h", etc.
        return formatDistanceToNowStrict(date, { addSuffix: false })
        .replace("seconds", "s")
        .replace("second", "s")
        .replace("minutes","m")
        .replace("minute","m")
        .replace("hours","h")
        .replace("hour","h")
        .replace("days","d")
        .replace("day","d");
    }

    if (diffDays === 1 || isYesterday(date)) {
        return "Yesterday";
    }

    if (diffDays < 7) {
        return format(date, "EEE"); // "Mon", "Tue"
    }

    return format(date, "MMM d"); // "Sep 15"
}