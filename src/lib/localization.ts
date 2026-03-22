import type { Language } from "@/contexts/LanguageContext";
import { translations } from "@/contexts/LanguageContext";

const SUBJECT_TRANSLATION_KEYS: Record<string, string> = {
  // K-12 Maths
  "us school math": "home.subj.math",
  algebra: "home.subj.math",
  geometry: "home.subj.math",
  trigonometry: "home.subj.math",
  calculus: "home.subj.math",
  "gcse maths": "home.subj.math",
  "igcse maths": "home.subj.math",
  "a-level maths": "home.subj.math",
  "further maths": "home.subj.math",
  mathematics: "home.subj.math",
  math: "home.subj.math",
  // K-12 Science
  "general science": "home.subj.science",
  biology: "home.subj.biology",
  chemistry: "home.subj.chemistry",
  physics: "home.subj.physics",
  "gcse sciences": "home.subj.science",
  "a-level biology": "home.subj.biology",
  "a-level chemistry": "home.subj.chemistry",
  "a-level physics": "home.subj.physics",
  // K-12 English
  "reading & writing support": "home.subj.english",
  "us english/ela": "home.subj.english",
  "gcse english language": "home.subj.englishLang",
  "gcse english literature": "home.subj.englishLit",
  "a-level english language": "home.subj.englishLang",
  "a-level english literature": "home.subj.englishLit",
  english: "home.subj.english",
  // K-12 Coding
  "coding for kids": "home.subj.computerScience",
  "coding for teens": "home.subj.computerScience",
  "gcse computer science": "home.subj.computerScience",
  "a-level computer science": "home.subj.computerScience",
  "ap computer science": "home.subj.computerScience",
  "computer science": "home.subj.computerScience",
  // University
  "university calculus": "home.subj.math",
  "linear algebra": "home.subj.math",
  "statistics & data analysis": "home.subj.dataScience",
  "intro physics": "home.subj.physics",
  "intro chemistry": "home.subj.chemistry",
  "academic writing": "home.subj.english",
  "essay & dissertation support": "home.subj.english",
  "python for data analysis": "home.subj.programming",
  "intro programming": "home.subj.programming",
  "r or excel statistics": "home.subj.dataScience",
  programming: "home.subj.programming",
  "data science": "home.subj.dataScience",
  // Professionals
  "general english": "home.subj.businessEnglish",
  "conversation practice": "home.subj.businessEnglish",
  "business english": "home.subj.businessEnglish",
  "interview prep": "home.subj.businessEnglish",
  "ielts academic": "home.subj.businessEnglish",
  "ielts general": "home.subj.businessEnglish",
  toefl: "home.subj.businessEnglish",
  "python for beginners": "home.subj.programming",
  "web development basics": "home.subj.programming",
  "data skills for professionals": "home.subj.dataScience",
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

