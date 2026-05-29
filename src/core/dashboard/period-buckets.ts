export function startOfDay(timestamp: number): number {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export function startOfWeekMonday(timestamp: number): number {
  const date = new Date(startOfDay(timestamp));
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date.getTime();
}

export function startOfMonth(timestamp: number): number {
  const date = new Date(timestamp);
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export function startOfYear(timestamp: number): number {
  const date = new Date(timestamp);
  date.setMonth(0, 1);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export function formatDayLabel(timestamp: number): string {
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(
    new Date(timestamp),
  );
}

export function formatMonthLabel(timestamp: number): string {
  return new Intl.DateTimeFormat(undefined, { month: 'short', year: '2-digit' }).format(
    new Date(timestamp),
  );
}

export function formatYearLabel(timestamp: number): string {
  return new Intl.DateTimeFormat(undefined, { year: 'numeric' }).format(new Date(timestamp));
}

export function daysAgoFromNow(days: number, now: number = Date.now()): number {
  return startOfDay(now) - days * 24 * 60 * 60 * 1000;
}
