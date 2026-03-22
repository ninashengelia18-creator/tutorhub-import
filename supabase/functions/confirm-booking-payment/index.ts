import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/* ── Smart-quote sanitiser ────────────────────────────────────────── */

function sanitiseSmartQuotes(raw: string): string {
  return raw
    // double-quote variants → ASCII "
    .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036\uFF02]/g, '"')
    // single-quote / apostrophe variants → ASCII '
    .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035\uFF07]/g, "'")
    // other common Unicode dashes that can sneak in
    .replace(/[\u2013\u2014]/g, '-');
}

/* ── Google auth helpers ─────────────────────────────────────────── */

function base64url(input: Uint8Array): string {
  let binary = "";
  for (const byte of input) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function createJWT(sa: { client_email: string; private_key: string }): Promise<string> {
  const header = base64url(new TextEncoder().encode(JSON.stringify({ alg: "RS256", typ: "JWT" })));
  const now = Math.floor(Date.now() / 1000);
  const payload = base64url(
    new TextEncoder().encode(
      JSON.stringify({
        iss: sa.client_email,
        scope: "https://www.googleapis.com/auth/calendar",
        aud: "https://oauth2.googleapis.com/token",
        iat: now,
        exp: now + 3600,
      })
    )
  );
  const signingInput = `${header}.${payload}`;
  const pemBody = sanitiseSmartQuotes(sa.private_key)
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
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", cryptoKey, new TextEncoder().encode(signingInput));
  return `${signingInput}.${base64url(new Uint8Array(signature))}`;
}

async function getAccessToken(sa: { client_email: string; private_key: string }): Promise<string> {
  const jwt = await createJWT(sa);
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=${encodeURIComponent("urn:ietf:params:oauth:grant_type:jwt-bearer")}&assertion=${encodeURIComponent(jwt)}`,
  });
  if (!res.ok) throw new Error(`Google token exchange failed: ${await res.text()}`);
  return (await res.json()).access_token;
}

/* ── Brevo email helper ──────────────────────────────────────────── */

async function sendBrevoEmail(to: string, subject: string, htmlContent: string) {
  const apiKey = Deno.env.get("BREVO_API_KEY");
  if (!apiKey) {
    console.warn("BREVO_API_KEY not set, skipping email");
    return;
  }
  await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      sender: { name: "LearnEazy", email: "info@learneazy.org" },
      to: [{ email: to }],
      subject,
      htmlContent,
    }),
  });
}

/* ── Main handler ────────────────────────────────────────────────── */

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify caller is admin
    const authHeader = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!authHeader) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

    const { data: { user } } = await adminClient.auth.getUser(authHeader);
    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

    const { data: isAdmin } = await adminClient.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!isAdmin) return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: corsHeaders });

    const { booking_id } = await req.json();
    if (!booking_id) return new Response(JSON.stringify({ error: "Missing booking_id" }), { status: 400, headers: corsHeaders });

    // Fetch booking
    const { data: booking, error: bErr } = await adminClient
      .from("bookings")
      .select("*")
      .eq("id", booking_id)
      .single();

    if (bErr || !booking) return new Response(JSON.stringify({ error: "Booking not found" }), { status: 404, headers: corsHeaders });

    // Update status to confirmed
    await adminClient.from("bookings").update({ status: "confirmed", updated_at: new Date().toISOString() }).eq("id", booking_id);

    // Generate Google Meet link
    let meetLink: string | null = null;
    let eventId: string | null = null;

    const saJson = Deno.env.get("GOOGLE_CALENDAR_SERVICE_ACCOUNT_JSON");
    if (saJson) {
      try {
        let cleanJson = sanitiseSmartQuotes(saJson).trim();
        if (!cleanJson.startsWith('{')) cleanJson = '{' + cleanJson;
        if (!cleanJson.endsWith('}')) cleanJson = cleanJson + '}';
        const sa = JSON.parse(cleanJson);
        const accessToken = await getAccessToken(sa);

        const startTime = booking.lesson_start_at || `${booking.lesson_date}T${booking.start_time}Z`;
        const endTime = booking.lesson_end_at || `${booking.lesson_date}T${booking.end_time}Z`;

        const attendees: { email: string }[] = [];
        if (booking.student_email) attendees.push({ email: booking.student_email });

        // Try to find tutor email
        const { data: tutorProfile } = await adminClient
          .from("public_tutor_profiles")
          .select("email")
          .eq("first_name", booking.tutor_name.split(" ")[0])
          .limit(1)
          .maybeSingle();
        if (tutorProfile?.email) attendees.push({ email: tutorProfile.email });

        const event = {
          summary: `${booking.subject} – LearnEazy Lesson`,
          description: `Lesson with ${booking.tutor_name}\nStudent: ${booking.student_name || "Student"}`,
          start: { dateTime: startTime, timeZone: "UTC" },
          end: { dateTime: endTime, timeZone: "UTC" },
          attendees,
          conferenceData: {
            createRequest: { requestId: booking_id, conferenceSolutionKey: { type: "hangoutsMeet" } },
          },
          reminders: {
            useDefault: false,
            overrides: [
              { method: "email", minutes: 60 },
              { method: "popup", minutes: 15 },
            ],
          },
        };

        const calRes = await fetch(
          "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all",
          {
            method: "POST",
            headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
            body: JSON.stringify(event),
          }
        );

        if (calRes.ok) {
          const calEvent = await calRes.json();
          meetLink = calEvent.hangoutLink || calEvent.conferenceData?.entryPoints?.[0]?.uri || null;
          eventId = calEvent.id || null;

          await adminClient.from("bookings").update({
            google_meet_link: meetLink,
            google_event_id: eventId,
          }).eq("id", booking_id);
        } else {
          console.error("Google Calendar API error:", await calRes.text());
        }
      } catch (err) {
        console.error("Calendar event creation failed:", err);
      }
    }

    // Create notifications for student
    const studentNotif = {
      user_id: booking.student_id,
      type: "booking_confirmed",
      title: "Payment Confirmed!",
      message: `Your ${booking.subject} lesson with ${booking.tutor_name} on ${booking.lesson_date} has been confirmed.${meetLink ? " A Google Meet link has been generated." : ""}`,
      booking_id,
    };

    // Find tutor user_id by display_name
    const { data: tutorProfileRow } = await adminClient
      .from("profiles")
      .select("id")
      .eq("display_name", booking.tutor_name)
      .maybeSingle();

    const notifications = [studentNotif];
    if (tutorProfileRow?.id) {
      notifications.push({
        user_id: tutorProfileRow.id,
        type: "booking_confirmed",
        title: "New Confirmed Lesson!",
        message: `${booking.student_name || "A student"} has confirmed payment for ${booking.subject} on ${booking.lesson_date}.${meetLink ? " A Google Meet link has been generated." : ""}`,
        booking_id,
      });
    }

    await adminClient.from("notifications").insert(notifications);

    // Send confirmation emails
    const lessonDate = booking.lesson_date;
    const startTimeStr = booking.start_time?.slice(0, 5) || "";
    const meetLinkHtml = meetLink ? `<p style="margin:16px 0"><a href="${meetLink}" style="background:#7c3aed;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Join Google Meet</a></p>` : "";

    if (booking.student_email) {
      await sendBrevoEmail(
        booking.student_email,
        `✅ Lesson Confirmed – ${booking.subject} with ${booking.tutor_name}`,
        `<div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto">
          <h2 style="color:#7c3aed">Your Lesson is Confirmed!</h2>
          <p>Hi ${booking.student_name || "there"},</p>
          <p>Your <strong>${booking.subject}</strong> lesson with <strong>${booking.tutor_name}</strong> has been confirmed.</p>
          <p>📅 <strong>${lessonDate}</strong> at <strong>${startTimeStr}</strong></p>
          ${meetLinkHtml}
          <p style="color:#666;font-size:13px">See you in class!<br>The LearnEazy Team</p>
        </div>`
      );
    }

    // Email tutor
    const { data: tutorEmailProfile } = await adminClient
      .from("public_tutor_profiles")
      .select("email")
      .ilike("first_name", booking.tutor_name.split(" ")[0])
      .limit(1)
      .maybeSingle();

    if (tutorEmailProfile?.email) {
      await sendBrevoEmail(
        tutorEmailProfile.email,
        `✅ New Confirmed Lesson – ${booking.subject}`,
        `<div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto">
          <h2 style="color:#7c3aed">New Confirmed Lesson!</h2>
          <p>Hi ${booking.tutor_name.split(" ")[0]},</p>
          <p><strong>${booking.student_name || "A student"}</strong> has confirmed payment for your <strong>${booking.subject}</strong> lesson.</p>
          <p>📅 <strong>${lessonDate}</strong> at <strong>${startTimeStr}</strong></p>
          ${meetLinkHtml}
          <p style="color:#666;font-size:13px">Get ready for class!<br>The LearnEazy Team</p>
        </div>`
      );
    }

    return new Response(
      JSON.stringify({ success: true, meet_link: meetLink, event_id: eventId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("confirm-booking-payment error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal error" }),
      { status: 500, headers: corsHeaders }
    );
  }
});
