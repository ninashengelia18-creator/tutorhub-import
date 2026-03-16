import type { Language } from "@/contexts/LanguageContext";

const SUBJECT_TRANSLATION_KEYS: Record<string, string> = {
  mathematics: "home.subj.math",
  math: "home.subj.math",
  physics: "home.subj.physics",
  english: "home.subj.english",
  programming: "home.subj.programming",
  chemistry: "home.subj.chemistry",
  biology: "home.subj.biology",
  history: "home.subj.history",
  geography: "home.subj.geography",
  georgian: "td.georgian",
  russian: "td.russian",
  music: "td.music",
  art: "home.subj.art",
  "drawing / art": "home.subj.art",
  "georgian language & literature": "home.subj.georgianLit",
};

const DATE_LOCALES: Record<Language, string> = {
  en: "en-US",
  ka: "ka-GE",
  ru: "ru-RU",
};

export function getLocaleForLanguage(lang: Language) {
  return DATE_LOCALES[lang] ?? DATE_LOCALES.en;
}

export function localizeSubjectLabel(
  subject: string,
  t: (key: string) => string,
) {
  const normalized = subject.trim().toLowerCase();
  const key = SUBJECT_TRANSLATION_KEYS[normalized];
  return key ? t(key) : subject;
}

export function formatLocalizedDate(date: Date, lang: Language) {
  return date.toLocaleDateString(getLocaleForLanguage(lang), {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
