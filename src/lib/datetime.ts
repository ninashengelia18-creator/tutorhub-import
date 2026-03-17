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

const TIMEZONE_CITY_LABELS: Record<string, string> = {
  "America/New_York": "New York",
  "America/Chicago": "Chicago",
  "America/Denver": "Denver",
  "America/Los_Angeles": "Los Angeles",
  "Asia/Tbilisi": "Tbilisi",
  "Europe/London": "London",
  "Europe/Berlin": "Berlin",
  "Europe/Warsaw": "Warsaw",
  "Europe/Madrid": "Madrid",
  "Europe/Rome": "Rome",
  "Europe/Moscow": "Moscow",
  UTC: "UTC",
};

export function getTimeZoneOffsetLabel(timeZone: string) {
  try {
    const value = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "shortOffset",
    }).formatToParts(new Date()).find((part) => part.type === "timeZoneName")?.value;

    if (value) return value.replace(/\s+/g, "");
  } catch {
    // Ignore and fall through to fallback.
  }

  return timeZone;
}

export function getTimeZoneCityLabel(timeZone: string) {
  return TIMEZONE_CITY_LABELS[timeZone] ?? timeZone.split("/").pop()?.replace(/_/g, " ") ?? timeZone;
}

export function getTimeZoneSettingLabel(timeZone: string) {
  return `${getTimeZoneCityLabel(timeZone)} (${getTimeZoneOffsetLabel(timeZone)})`;
}

export function getTimeZoneInlineLabel(timeZone: string) {
  const city = getTimeZoneCityLabel(timeZone);
  const offset = getTimeZoneOffsetLabel(timeZone);
  return city === "UTC" ? offset : `${offset} ${city}`;
}

export function formatWallClockTime(value: string, lang: Language) {
  const [hour, minute] = value.split(":").map(Number);

  if (Number.isNaN(hour) || Number.isNaN(minute)) return value;

  return new Intl.DateTimeFormat(getLocaleForLanguage(lang), {
    timeZone: "UTC",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(Date.UTC(2000, 0, 1, hour, minute)));
}

export function formatTimeSlotLabel(value: string, lang: Language, timeZone: string) {
  return `${formatWallClockTime(value, lang)} (${getTimeZoneInlineLabel(timeZone)})`;
}
