import { getLocales } from 'expo-localization';

function startOfDay(timestamp: number): number {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function daysBetween(earlier: number, later: number): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((startOfDay(later) - startOfDay(earlier)) / msPerDay);
}

function getLocale(): string {
  return getLocales()[0]?.languageTag ?? 'en-US';
}

/**
 * Formats a timestamp for display across the app.
 * Within 6 calendar days: Today, Yesterday, or weekday name.
 * Older dates: short absolute date in the user's locale.
 */
export function formatAppDate(timestamp: number, now: number = Date.now()): string {
  const daysAgo = daysBetween(timestamp, now);

  if (daysAgo === 0) {
    return 'Today';
  }
  if (daysAgo === 1) {
    return 'Yesterday';
  }
  if (daysAgo >= 2 && daysAgo <= 6) {
    return new Intl.DateTimeFormat(getLocale(), { weekday: 'long' }).format(new Date(timestamp));
  }

  return new Intl.DateTimeFormat(getLocale(), {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(timestamp));
}
