import type { Language } from "@/contexts/LanguageContext";
import { getLocaleForLanguage } from "@/lib/localization";

type DateLike = Date | string | null | undefined;

function toDate(value: DateLike) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseTimeZoneOffsetToMinutes(value: string) {
  if (value === "GMT" || value === "UTC") return 0;

  const match = value.match(/GMT([+-])(\d{1,2})(?::?(\d{2}))?/);
  if (!match) return 0;

  const [, sign, hours, minutes] = match;
  const totalMinutes = Number.parseInt(hours, 10) * 60 + Number.parseInt(minutes ?? "0", 10);
  return sign === "-" ? -totalMinutes : totalMinutes;
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

export function getTimeZoneOffsetLabel(timeZone: string, value: DateLike = new Date()) {
  const date = toDate(value) ?? new Date();

  try {
    const label = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "shortOffset",
    }).formatToParts(date).find((part) => part.type === "timeZoneName")?.value;

    if (label) return label.replace(/\s+/g, "");
  } catch {
    // Ignore and fall through to fallback.
  }

  return timeZone;
}

export function getTimeZoneAbbreviation(timeZone: string, value: DateLike = new Date()) {
  const date = toDate(value) ?? new Date();

  try {
    const label = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "short",
    }).formatToParts(date).find((part) => part.type === "timeZoneName")?.value;

    if (label) return label.replace(/\s+/g, "");
  } catch {
    // Ignore and fall through to offset label.
  }

  return getTimeZoneOffsetLabel(timeZone, date);
}

export function getTimeZoneCityLabel(timeZone: string) {
  return TIMEZONE_CITY_LABELS[timeZone] ?? timeZone.split("/").pop()?.replace(/_/g, " ") ?? timeZone;
}

export function getTimeZoneSettingLabel(timeZone: string, value: DateLike = new Date()) {
  return `${getTimeZoneCityLabel(timeZone)} (${getTimeZoneOffsetLabel(timeZone, value)})`;
}

export function getTimeZoneInlineLabel(timeZone: string, value: DateLike = new Date()) {
  const city = getTimeZoneCityLabel(timeZone);
  const offset = getTimeZoneOffsetLabel(timeZone, value);
  return city === "UTC" ? offset : `${offset} ${city}`;
}

export function getTimeZoneDisplayLabel(timeZone: string, value: DateLike = new Date()) {
  const city = getTimeZoneCityLabel(timeZone);
  const abbreviation = getTimeZoneAbbreviation(timeZone, value);
  return city === "UTC" ? abbreviation : `${abbreviation} ${city}`;
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

export function convertLocalDateTimeToUtc(dateKey: string, timeValue: string, timeZone: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const [hour, minute] = timeValue.split(":").map(Number);

  if ([year, month, day, hour, minute].some((value) => Number.isNaN(value))) return null;

  const utcGuess = new Date(Date.UTC(year, (month || 1) - 1, day || 1, hour || 0, minute || 0));
  const firstOffset = parseTimeZoneOffsetToMinutes(getTimeZoneOffsetLabel(timeZone, utcGuess));
  const firstPass = new Date(utcGuess.getTime() - firstOffset * 60_000);
  const secondOffset = parseTimeZoneOffsetToMinutes(getTimeZoneOffsetLabel(timeZone, firstPass));

  return new Date(utcGuess.getTime() - secondOffset * 60_000);
}

export function getDurationMinutes(startAt: DateLike, endAt: DateLike) {
  const start = toDate(startAt);
  const end = toDate(endAt);

  if (!start || !end) return 0;
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 60_000));
}
