import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { useAuth } from "@/contexts/AuthContext";
import { type Language, useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

export type CurrencyCode = "USD" | "GEL" | "EUR";

export interface LocalePreferences {
  preferred_language: Language;
  preferred_currency: CurrencyCode;
  preferred_timezone: string;
}

interface AppLocaleContextType {
  currency: CurrencyCode;
  timezone: string;
  timezoneLabel: string;
  isDetecting: boolean;
  formatCurrency: (amount: number, sourceCurrency?: CurrencyCode | string) => string;
  setLocalePreferences: (preferences: LocalePreferences) => void;
}

const LanguageContext = createContext<AppLocaleContextType | undefined>(undefined);

const DETECTED_PREFERENCES_KEY = "learneazy-detected-locale";
const MANUAL_PREFERENCES_KEY = "learneazy-locale-preferences";

const DEFAULT_CURRENCY: CurrencyCode = "USD";
const DEFAULT_LANGUAGE: Language = "en";
const DEFAULT_TIMEZONE = "UTC";

const EXCHANGE_RATE_FROM_GEL: Record<CurrencyCode, number> = {
  GEL: 1,
  USD: 0.37,
  EUR: 0.34,
};

const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  USD: "$",
  GEL: "₾",
  EUR: "€",
};

const EUROPEAN_COUNTRY_CODES = new Set([
  "AL", "AD", "AT", "BE", "BA", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IS", "IE", "IT",
  "XK", "LV", "LI", "LT", "LU", "MT", "MD", "MC", "ME", "NL", "MK", "NO", "PL", "PT", "RO", "SM", "RS", "SK", "SI",
  "ES", "SE", "CH", "UA", "GB", "VA",
]);

export const TIMEZONE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "America/New_York", label: "US East Coast (EST/EDT)" },
  { value: "America/Chicago", label: "US Central (CST/CDT)" },
  { value: "America/Denver", label: "US Mountain (MST/MDT)" },
  { value: "America/Los_Angeles", label: "US West Coast (PST/PDT)" },
  { value: "Asia/Tbilisi", label: "Georgia (GET)" },
  { value: "Europe/London", label: "United Kingdom (GMT/BST)" },
  { value: "Europe/Berlin", label: "Central Europe (CET/CEST)" },
  { value: "Europe/Warsaw", label: "Poland (CET/CEST)" },
  { value: "Europe/Madrid", label: "Spain (CET/CEST)" },
  { value: "Europe/Rome", label: "Italy (CET/CEST)" },
  { value: "Europe/Moscow", label: "Moscow (MSK)" },
  { value: "UTC", label: "UTC" },
];

function isValidTimeZone(value: string | null | undefined) {
  if (!value) return false;

  try {
    Intl.DateTimeFormat("en-US", { timeZone: value }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

function getBrowserTimeZone() {
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return isValidTimeZone(timeZone) ? timeZone : DEFAULT_TIMEZONE;
  } catch {
    return DEFAULT_TIMEZONE;
  }
}

function normalizeCurrencyCode(value: string | null | undefined): CurrencyCode {
  if (value === "₾") return "GEL";
  if (value === "$") return "USD";
  if (value === "€") return "EUR";
  if (value === "GEL" || value === "USD" || value === "EUR") return value;
  return DEFAULT_CURRENCY;
}

function normalizeLanguage(value: string | null | undefined): Language {
  if (value === "ka" || value === "ru" || value === "en") return value;
  return DEFAULT_LANGUAGE;
}

function normalizePreferences(input?: Partial<LocalePreferences> | null): LocalePreferences {
  return {
    preferred_language: normalizeLanguage(input?.preferred_language),
    preferred_currency: normalizeCurrencyCode(input?.preferred_currency),
    preferred_timezone: input?.preferred_timezone?.trim() || getBrowserTimeZone(),
  };
}

function readStoredPreferences(key: string) {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return normalizePreferences(JSON.parse(raw) as Partial<LocalePreferences>);
  } catch {
    return null;
  }
}

function writeStoredPreferences(key: string, preferences: LocalePreferences) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(preferences));
}

function detectLanguageFromBrowser(browserLanguage: string) {
  const normalized = browserLanguage.toLowerCase();
  if (normalized.startsWith("ka")) return "ka" satisfies Language;
  if (normalized.startsWith("ru")) return "ru" satisfies Language;
  return "en" satisfies Language;
}

function fallbackPreferences(browserLanguage: string, browserTimeZone: string) {
  const language = detectLanguageFromBrowser(browserLanguage);

  if (browserTimeZone === "Asia/Tbilisi" || language === "ka") {
    return normalizePreferences({
      preferred_language: "ka",
      preferred_currency: "GEL",
      preferred_timezone: "Asia/Tbilisi",
    });
  }

  if (language === "ru") {
    return normalizePreferences({
      preferred_language: "ru",
      preferred_currency: "USD",
      preferred_timezone: browserTimeZone,
    });
  }

  return normalizePreferences({
    preferred_language: "en",
    preferred_currency: "USD",
    preferred_timezone: browserTimeZone,
  });
}

function convertCurrency(amount: number, fromCurrency: CurrencyCode, toCurrency: CurrencyCode) {
  const gelAmount = fromCurrency === "GEL" ? amount : amount / EXCHANGE_RATE_FROM_GEL[fromCurrency];
  return gelAmount * EXCHANGE_RATE_FROM_GEL[toCurrency];
}

function formatMoney(amount: number, currency: CurrencyCode) {
  const sign = amount < 0 ? "-" : "";
  const absoluteAmount = Math.abs(amount);
  const formattedNumber = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(absoluteAmount);

  return `${sign}${CURRENCY_SYMBOLS[currency]}${formattedNumber}`;
}

function getTimeZoneShortName(timeZone: string) {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "short",
    });
    return formatter.formatToParts(new Date()).find((part) => part.type === "timeZoneName")?.value ?? timeZone;
  } catch {
    return timeZone;
  }
}

export function AppLocaleProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { lang, setLang } = useLanguage();

  const storedPreferences = typeof window !== "undefined"
    ? readStoredPreferences(MANUAL_PREFERENCES_KEY) ?? readStoredPreferences(DETECTED_PREFERENCES_KEY)
    : null;

  const [currency, setCurrency] = useState<CurrencyCode>(storedPreferences?.preferred_currency ?? DEFAULT_CURRENCY);
  const [timezone, setTimezone] = useState(storedPreferences?.preferred_timezone ?? getBrowserTimeZone());
  const [isDetecting, setIsDetecting] = useState(true);

  const persistPreferences = useCallback(async (preferences: LocalePreferences) => {
    if (!user?.id) return;

    await supabase
      .from("user_preferences" as never)
      .upsert({
        user_id: user.id,
        ...preferences,
        updated_at: new Date().toISOString(),
      } as never, {
        onConflict: "user_id",
      });
  }, [user?.id]);

  const applyDetectedPreferences = useCallback((preferences: LocalePreferences) => {
    const normalized = normalizePreferences(preferences);

    setCurrency(normalized.preferred_currency);
    setTimezone(normalized.preferred_timezone);
    writeStoredPreferences(DETECTED_PREFERENCES_KEY, normalized);

    if (typeof window !== "undefined" && !localStorage.getItem("learneazy-lang")) {
      setLang(normalized.preferred_language);
    }
  }, [setLang]);

  const applyManualPreferences = useCallback((preferences: LocalePreferences) => {
    const normalized = normalizePreferences(preferences);

    setCurrency(normalized.preferred_currency);
    setTimezone(normalized.preferred_timezone);
    setLang(normalized.preferred_language);
    writeStoredPreferences(MANUAL_PREFERENCES_KEY, normalized);
    void persistPreferences(normalized);
  }, [persistPreferences, setLang]);

  useEffect(() => {
    let cancelled = false;

    const loadPreferences = async () => {
      const browserLanguage = typeof navigator !== "undefined" ? navigator.language : "en-US";
      const browserTimeZone = getBrowserTimeZone();
      const localManualPreferences = readStoredPreferences(MANUAL_PREFERENCES_KEY);

      setIsDetecting(true);

      if (user?.id) {
        const { data } = await supabase
          .from("user_preferences" as never)
          .select("preferred_language, preferred_currency, preferred_timezone")
          .eq("user_id", user.id)
          .maybeSingle();

        if (cancelled) return;

        if (data) {
          applyManualPreferences(data as unknown as LocalePreferences);
          setIsDetecting(false);
          return;
        }

        if (localManualPreferences) {
          applyManualPreferences(localManualPreferences);
          setIsDetecting(false);
          return;
        }
      }

      try {
        const { data, error } = await supabase.functions.invoke("detect-visitor-locale", {
          body: {
            browserLanguage,
            browserTimeZone,
          },
        });

        if (error) throw error;
        if (cancelled) return;

        const detectedPreferences = normalizePreferences(data as Partial<LocalePreferences>);
        applyDetectedPreferences(detectedPreferences);
        await persistPreferences(detectedPreferences);
      } catch {
        if (cancelled) return;
        const detectedPreferences = fallbackPreferences(browserLanguage, browserTimeZone);
        applyDetectedPreferences(detectedPreferences);
        await persistPreferences(detectedPreferences);
      } finally {
        if (!cancelled) {
          setIsDetecting(false);
        }
      }
    };

    void loadPreferences();

    return () => {
      cancelled = true;
    };
  }, [applyDetectedPreferences, applyManualPreferences, persistPreferences, user?.id]);

  const formatCurrency = useCallback((amount: number, sourceCurrency: CurrencyCode | string = "GEL") => {
    const normalizedSourceCurrency = normalizeCurrencyCode(sourceCurrency);
    return formatMoney(convertCurrency(amount, normalizedSourceCurrency, currency), currency);
  }, [currency]);

  const timezoneLabel = useMemo(() => `${timezone} (${getTimeZoneShortName(timezone)})`, [timezone]);

  const value = useMemo<AppLocaleContextType>(() => ({
    currency,
    timezone,
    timezoneLabel,
    isDetecting,
    formatCurrency,
    setLocalePreferences: applyManualPreferences,
  }), [currency, timezone, timezoneLabel, isDetecting, formatCurrency, applyManualPreferences]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useAppLocale() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useAppLocale must be used within AppLocaleProvider");
  return context;
}

export function getCurrencyForCountry(countryCode?: string | null, browserLanguage = "en-US") {
  if (countryCode === "GE") return "GEL" satisfies CurrencyCode;
  if (detectLanguageFromBrowser(browserLanguage) === "ru") return "USD" satisfies CurrencyCode;
  if (countryCode && EUROPEAN_COUNTRY_CODES.has(countryCode)) return "EUR" satisfies CurrencyCode;
  return "USD" satisfies CurrencyCode;
}
