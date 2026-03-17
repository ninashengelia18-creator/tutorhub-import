import type { Language } from "@/contexts/LanguageContext";
import { getLocaleForLanguage } from "@/lib/localization";

type DateLike = Date | string | null | undefined;

function toDate(value: DateLike) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function getDateKeyInTimeZone(value: DateLike, timeZone: string) {
  const date = toDate(value);
  if (!date) return "";

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  return year && month && day ? `${year}-${month}-${day}` : "";
}

export function getDateFromKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

export function formatDateInTimeZone(
  value: DateLike,
  lang: Language,
  timeZone: string,
  options: Intl.DateTimeFormatOptions,
) {
  const date = toDate(value);
  if (!date) return "";

  return new Intl.DateTimeFormat(getLocaleForLanguage(lang), {
    timeZone,
    ...options,
  }).format(date);
}

export function formatTimeInTimeZone(
  value: DateLike,
  lang: Language,
  timeZone: string,
  options: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit" },
) {
  return formatDateInTimeZone(value, lang, timeZone, options);
}

export function formatLessonTimeRange(
  startAt: DateLike,
  endAt: DateLike,
  lang: Language,
  timeZone: string,
) {
  const start = formatTimeInTimeZone(startAt, lang, timeZone);
  const end = formatTimeInTimeZone(endAt, lang, timeZone);

  if (!start) return end;
  if (!end) return start;
  return `${start} – ${end}`;
}

export function getHourInTimeZone(value: DateLike, timeZone: string) {
  const date = toDate(value);
  if (!date) return null;

  const hour = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    hourCycle: "h23",
  }).format(date);

  return Number.parseInt(hour, 10);
}

export function getTimeZoneOffsetLabel(timeZone: string) {
  try {
    const value = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "shortOffset",
    }).formatToParts(new Date()).find((part) => part.type === "timeZoneName")?.value;

    if (value) return value.replace("GMT", "GMT ");
  } catch {
    // Ignore and fall through to fallback.
  }

  return timeZone;
}
