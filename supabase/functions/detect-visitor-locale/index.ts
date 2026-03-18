import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type Language = "en";
type CurrencyCode = "USD" | "EUR";

const EUROPEAN_COUNTRY_CODES = new Set([
  "AL", "AD", "AT", "BE", "BA", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IS", "IE", "IT",
  "XK", "LV", "LI", "LT", "LU", "MT", "MD", "MC", "ME", "NL", "MK", "NO", "PL", "PT", "RO", "SM", "RS", "SK", "SI",
  "ES", "SE", "CH", "UA", "GB", "VA",
]);

function detectLanguage(_browserLanguage: string): Language {
  return "en";
}

function isValidTimeZone(value: string | null | undefined) {
  if (!value) return false;

  try {
    Intl.DateTimeFormat("en-US", { timeZone: value }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

function getClientIp(req: Request) {
  const forwardedFor = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "";
  return forwardedFor.split(",")[0]?.trim() || null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const browserLanguage = typeof body?.browserLanguage === "string" ? body.browserLanguage : req.headers.get("accept-language") ?? "en-US";
    const requestedTimeZone = typeof body?.browserTimeZone === "string" ? body.browserTimeZone : null;
    const browserTimeZone = isValidTimeZone(requestedTimeZone) ? requestedTimeZone : "UTC";

    const ip = getClientIp(req);
    let countryCode: string | null = null;
    let timeZone = browserTimeZone;

    if (ip) {
      const geoResponse = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`);
      if (geoResponse.ok) {
        const geoData = await geoResponse.json();
        if (geoData?.success) {
          countryCode = typeof geoData.country_code === "string" ? geoData.country_code.toUpperCase() : null;

          if (!isValidTimeZone(timeZone) && typeof geoData?.timezone?.id === "string" && isValidTimeZone(geoData.timezone.id)) {
            timeZone = geoData.timezone.id;
          }
        }
      }
    }

    const detectedLanguage = detectLanguage(browserLanguage);
    let preferred_language: Language = "en";
    let preferred_currency: CurrencyCode = "USD";

    if (countryCode === "GE") {
      preferred_language = "ka";
      preferred_currency = "GEL";

      if (!isValidTimeZone(timeZone)) {
        timeZone = "Asia/Tbilisi";
      }
    } else if (countryCode === "US") {
      preferred_language = "en";
      preferred_currency = "USD";
    } else if (detectedLanguage === "ru") {
      preferred_language = "ru";
      preferred_currency = "USD";
    } else if (countryCode && EUROPEAN_COUNTRY_CODES.has(countryCode)) {
      preferred_language = "en";
      preferred_currency = "EUR";
    }

    return new Response(JSON.stringify({
      countryCode,
      preferred_language,
      preferred_currency,
      preferred_timezone: isValidTimeZone(timeZone) ? timeZone : browserTimeZone,
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }
});
