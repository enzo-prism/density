const MS_PER_DAY = 86_400_000;

export function formatDateInTimeZone(date: Date, timeZone: string): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(date);
  const map = new Map(parts.map((part) => [part.type, part.value]));
  const year = map.get("year");
  const month = map.get("month");
  const day = map.get("day");
  if (!year || !month || !day) {
    throw new Error("Failed to format date in timezone.");
  }
  return `${year}-${month}-${day}`;
}

export function isValidTimeZone(timeZone: string): boolean {
  if (!timeZone) {
    return false;
  }
  try {
    new Intl.DateTimeFormat("en-US", { timeZone }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

export function dateToDayIndex(date: string): number {
  return Math.floor(Date.parse(`${date}T00:00:00Z`) / MS_PER_DAY);
}

export function dayIndexToDate(dayIndex: number): string {
  return new Date(dayIndex * MS_PER_DAY).toISOString().slice(0, 10);
}

export function getDateRangeInTimeZone(
  timeZone: string,
  lookbackDays: number
): {
  startDate: string;
  endDate: string;
  startDayIndex: number;
  endDayIndex: number;
} {
  const endDate = formatDateInTimeZone(new Date(), timeZone);
  const endDayIndex = dateToDayIndex(endDate);
  const startDayIndex = endDayIndex - lookbackDays + 1;
  const startDate = dayIndexToDate(startDayIndex);
  return { startDate, endDate, startDayIndex, endDayIndex };
}

export function listDatesInRange(startDate: string, endDate: string): string[] {
  const startIndex = dateToDayIndex(startDate);
  const endIndex = dateToDayIndex(endDate);
  const dates: string[] = [];
  for (let i = startIndex; i <= endIndex; i += 1) {
    dates.push(dayIndexToDate(i));
  }
  return dates;
}

export function clampLookbackDays(value: number | undefined): number {
  if (!Number.isFinite(value)) {
    return 365;
  }
  const floored = Math.floor(value as number);
  return Math.min(3650, Math.max(30, floored));
}
