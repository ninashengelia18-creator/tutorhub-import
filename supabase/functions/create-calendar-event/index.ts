import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/* ── Smart-quote sanitiser ────────────────────────────────────────── */

function sanitiseSmartQuotes(raw: string): string {
  return raw
    .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036\uFF02]/g, '"')
    .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035\uFF07]/g, "'")
    .replace(/[\u2013\u2014]/g, '-');
}

/* ── Google auth helpers ─────────────────────────────────────────── */

function base64url(input: Uint8Array): string {
  let binary = "";
  for (const byte of input) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function createJWT(serviceAccount: {
  client_email: string;
  private_key: string;
}): Promise<string> {
  const header = base64url(
    new TextEncoder().encode(JSON.stringify({ alg: "RS256", typ: "JWT" }))
  );

  const now = Math.floor(Date.now() / 1000);
  const claimSet = {
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/calendar",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };
  const payload = base64url(
    new TextEncoder().encode(JSON.stringify(claimSet))
  );

  const signingInput = `${header}.${payload}`;

  const pemBody = sanitiseSmartQuotes(serviceAccount.private_key)
    .replace(/-+BEGIN PRIVATE KEY-+/, "")
    .replace(/-+END PRIVATE KEY-+/, "")
    .replace(/\s/g, "");
  const keyBuffer = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    keyBuffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(signingInput)
  );

  return `${signingInput}.${base64url(new Uint8Array(signature))}`;
}

async function getAccessToken(serviceAccount: {
  client_email: string;
  private_key: string;
}): Promise<string> {
  const jwt = await createJWT(serviceAccount);

  const params = new URLSearchParams();
  params.set("grant_type", "urn:ietf:params:oauth:grant_type:jwt-bearer");
  params.set("assertion", jwt);

  console.log("DEBUG: token request body length =", params.toString().length);
  console.log("DEBUG: grant_type param =", params.get("grant_type"));

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    body: params,
  });

  const text = await res.text();
  console.log("DEBUG: Google token response status =", res.status);
  console.log("DEBUG: Google token response =", text.substring(0, 200));

  if (!res.ok) {
    throw new Error(`Google token exchange failed: ${text}`);
  }

  const data = JSON.parse(text);
  return data.access_token;
}

/* ── Main handler ────────────────────────────────────────────────── */

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ⚠️ AUTH DISABLED FOR TESTING — re-enable before going live

    // Parse body
    const {
      booking_id,
      summary,
      description,
      start_time,
      end_time,
      tutor_email,
      student_email,
    } = await req.json();

    if (!booking_id || !start_time || !end_time) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Get service account credentials
    const saJson = Deno.env.get("GOOGLE_CALENDAR_SERVICE_ACCOUNT_JSON");
    if (!saJson) {
      return new Response(
        JSON.stringify({ error: "Service account not configured" }),
        { status: 500, headers: corsHeaders }
      );
    }

    let cleanJson = sanitiseSmartQuotes(saJson).trim();
    if (!cleanJson.startsWith('{')) cleanJson = '{' + cleanJson;
    if (!cleanJson.endsWith('}')) cleanJson = cleanJson + '}';
    const serviceAccount = JSON.parse(cleanJson);
    const accessToken = await getAccessToken(serviceAccount);

    // Build attendees list
    const attendees: { email: string }[] = [];
    if (tutor_email) attendees.push({ email: tutor_email });
    if (student_email) attendees.push({ email: student_email });

    // Create calendar event with Google Meet
    const event = {
      summary: summary || "LearnEazy Lesson",
      description: description || "Online lesson on LearnEazy",
      start: { dateTime: start_time, timeZone: "UTC" },
      end: { dateTime: end_time, timeZone: "UTC" },
      attendees,
      conferenceData: {
        createRequest: {
          requestId: booking_id,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 60 },
          { method: "popup", minutes: 15 },
        ],
      },
    };

    const calendarRes = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      }
    );

    if (!calendarRes.ok) {
      const errText = await calendarRes.text();
      console.error("Google Calendar API error:", errText);
      return new Response(
        JSON.stringify({ error: "Failed to create calendar event", details: errText }),
        { status: 502, headers: corsHeaders }
      );
    }

    const calendarEvent = await calendarRes.json();
    const meetLink =
      calendarEvent.hangoutLink || calendarEvent.conferenceData?.entryPoints?.[0]?.uri || null;
    const eventId = calendarEvent.id;

    // Save to booking using service role
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    await adminClient
      .from("bookings")
      .update({ google_meet_link: meetLink, google_event_id: eventId })
      .eq("id", booking_id);

    return new Response(
      JSON.stringify({ meet_link: meetLink, event_id: eventId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal error" }),
      { status: 500, headers: corsHeaders }
    );
  }
});
