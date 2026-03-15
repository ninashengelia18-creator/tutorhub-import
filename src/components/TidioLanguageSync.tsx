import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

declare global {
  interface Window {
    tidioChatApi?: {
      setColorScheme: (scheme: string) => void;
      setContactProperties: (props: Record<string, string>) => void;
      open: () => void;
      close: () => void;
      display: (show: boolean) => void;
    };
    tidioIdentify?: Record<string, string>;
  }
}

const langMap: Record<string, string> = {
  en: "en",
  ka: "ka",
  ru: "ru",
};

export function TidioLanguageSync() {
  const { lang } = useLanguage();

  useEffect(() => {
    const tidioLang = langMap[lang] || "en";

    // Set language attribute so Tidio picks it up on load
    document.documentElement.setAttribute("lang", tidioLang);

    // If Tidio is already loaded, update via script reload approach
    // Tidio reads document lang on init, so we also handle dynamic changes
    const script = document.querySelector('script[src*="tidio.co"]');
    if (script && window.tidioChatApi) {
      // Tidio doesn't have a direct setLanguage API, but setting
      // the visitor language property helps with auto-translation
      window.tidioChatApi.setContactProperties({ language: tidioLang });
    }
  }, [lang]);

  return null;
}
