/**
 * Formats a given Date or ISO date string into a localized relative time string
 * (e.g., "3 hours ago", "in 5 minutes", "yesterday") using Intl.RelativeTimeFormat.
 *
 * @param date - The Date instance or date string to format.
 * @returns A formatted relative time string, or empty string if date is invalid.
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (!d || isNaN(d.getTime())) return "";

  const diffInSeconds = Math.floor((Date.now() - d.getTime()) / 1000);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (Math.abs(diffInSeconds) < 60) return rtf.format(-diffInSeconds, "second");
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (Math.abs(diffInMinutes) < 60) return rtf.format(-diffInMinutes, "minute");
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (Math.abs(diffInHours) < 24) return rtf.format(-diffInHours, "hour");
  const diffInDays = Math.floor(diffInHours / 24);
  if (Math.abs(diffInDays) < 30) return rtf.format(-diffInDays, "day");
  const diffInMonths = Math.floor(diffInDays / 30);
  if (Math.abs(diffInMonths) < 12) return rtf.format(-diffInMonths, "month");
  const diffInYears = Math.floor(diffInDays / 365);
  return rtf.format(-diffInYears, "year");
}
