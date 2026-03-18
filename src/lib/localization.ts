import type { Language } from "@/contexts/LanguageContext";
import { translations } from "@/contexts/LanguageContext";

const SUBJECT_TRANSLATION_KEYS: Record<string, string> = {
  mathematics: "home.subj.math",
  math: "home.subj.math",
  physics: "home.subj.physics",
  english: "home.subj.english",
  programming: "home.subj.programming",
  chemistry: "home.subj.chemistry",
  biology: "home.subj.biology",
  history: "home.subj.history",
  science: "home.subj.science",
  "computer science": "home.subj.computerScience",
  "foreign languages": "home.subj.foreignLangs",
  "business & finance": "home.subj.businessFinance",
  "data science": "home.subj.dataScience",
  marketing: "home.subj.marketing",
  law: "home.subj.law",
  medicine: "home.subj.medicine",
  "business english": "home.subj.businessEnglish",
};

const SUBJECT_CANONICAL_VALUES: Record<string, string> = {
  ...Object.fromEntries(Object.keys(SUBJECT_TRANSLATION_KEYS).map((key) => [key, key])),
  русский: "russian",
  математика: "mathematics",
  физика: "physics",
  английский: "english",
  программирование: "programming",
  химия: "chemistry",
  биология: "biology",
  история: "history",
  география: "geography",
  музыка: "music",
};

const DATE_LOCALES: Record<Language, string> = {
  en: "en-US",
};

function normalizeTerm(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function getLocaleForLanguage(lang: Language) {
  return DATE_LOCALES[lang] ?? DATE_LOCALES.en;
}

export function localizeSubjectLabel(
  subject: string,
  t: (key: string) => string,
) {
  const normalized = normalizeTerm(subject);
  const canonical = SUBJECT_CANONICAL_VALUES[normalized] ?? normalized;
  const key = SUBJECT_TRANSLATION_KEYS[canonical];
  return key ? t(key) : subject;
}

export function getSubjectSearchTerms(subject: string) {
  const normalized = normalizeTerm(subject);
  const canonical = SUBJECT_CANONICAL_VALUES[normalized] ?? normalized;
  const translationKey = SUBJECT_TRANSLATION_KEYS[canonical];
  const terms = new Set<string>([normalized, canonical]);

  if (translationKey) {
    for (const locale of Object.keys(translations) as Language[]) {
      const translated = translations[locale][translationKey];
      if (translated) {
        terms.add(normalizeTerm(translated));
      }
    }
  }

  return Array.from(terms);
}

export function normalizeSubjectValue(subject: string) {
  const normalized = normalizeTerm(subject);
  return SUBJECT_CANONICAL_VALUES[normalized] ?? normalized;
}

export function formatLocalizedDate(date: Date, lang: Language) {
  return date.toLocaleDateString(getLocaleForLanguage(lang), {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

