import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function sendBrevoEmail(
  apiKey: string,
  to: { email: string; name: string }[],
  subject: string,
  htmlContent: string,
  senderEmail = "info@learneazy.org",
) {
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sender: { name: "LearnEazy", email: senderEmail },
      to,
      subject,
      htmlContent,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("Brevo error:", errText);
    throw new Error(`Email send failed [${res.status}]: ${errText}`);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      first_name,
      last_name,
      email,
      application_type,
      // Optional fields for admin notification detail
      phone,
      country,
      experience,
      education,
      certifications,
      bio,
      subjects,
      hourly_rate,
      native_language,
      other_languages,
      availability,
      timezone,
      about_teaching,
      motivation,
      conversation_style,
      video_intro_url,
    } = await req.json();

    if (!first_name || !email || !application_type) {
      throw new Error("Missing required fields: first_name, email, application_type");
    }

    const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
    if (!BREVO_API_KEY) {
      throw new Error("BREVO_API_KEY is not configured");
    }

    const isTutor = application_type === "tutor";
    const roleLabel = isTutor ? "Tutor" : "Conversation Partner";
    const fullName = [first_name, last_name].filter(Boolean).join(" ");

    // 1. Send confirmation email to applicant
    const confirmSubject = "We received your application";
    const confirmHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #16a34a;">Hi ${first_name},</h2>
        <p>Thank you for applying to become a <strong>${roleLabel}</strong> at LearnEazy!</p>
        <p>We have successfully received your application and our team is reviewing it. You can expect to hear back from us within <strong>3–5 business days</strong>.</p>
        <p>If you have any questions in the meantime, feel free to reach out to us at <a href="mailto:info@learneazy.org">info@learneazy.org</a>.</p>
        <p style="margin-top: 24px; color: #666;">— The LearnEazy Team</p>
      </div>
    `;

    await sendBrevoEmail(
      BREVO_API_KEY,
      [{ email, name: first_name }],
      confirmSubject,
      confirmHtml,
    );

    // 2. Send admin notification email
    let adminHtml: string;

    if (isTutor) {
      adminHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #16a34a;">New Tutor Application Received</h2>
          <p>A new tutor application has been submitted. Here are the details:</p>
          <table style="border-collapse:collapse;width:100%;">
            <tr><td style="padding:6px;font-weight:bold;">Full Name</td><td style="padding:6px;">${fullName}</td></tr>
            <tr><td style="padding:6px;font-weight:bold;">Email</td><td style="padding:6px;">${email}</td></tr>
            <tr><td style="padding:6px;font-weight:bold;">Phone</td><td style="padding:6px;">${phone || "—"}</td></tr>
            <tr><td style="padding:6px;font-weight:bold;">Country</td><td style="padding:6px;">${country || "—"}</td></tr>
            <tr><td style="padding:6px;font-weight:bold;">Subjects</td><td style="padding:6px;">${(subjects || []).join(", ") || "—"}</td></tr>
            <tr><td style="padding:6px;font-weight:bold;">Experience</td><td style="padding:6px;">${experience || "—"}</td></tr>
            <tr><td style="padding:6px;font-weight:bold;">Education</td><td style="padding:6px;">${education || "—"}</td></tr>
            <tr><td style="padding:6px;font-weight:bold;">Certifications</td><td style="padding:6px;">${certifications || "—"}</td></tr>
            <tr><td style="padding:6px;font-weight:bold;">Bio</td><td style="padding:6px;">${bio || "—"}</td></tr>
            <tr><td style="padding:6px;font-weight:bold;">Hourly Rate</td><td style="padding:6px;">$${hourly_rate || "—"}/hr</td></tr>
            <tr><td style="padding:6px;font-weight:bold;">Native Language</td><td style="padding:6px;">${native_language || "—"}</td></tr>
            <tr><td style="padding:6px;font-weight:bold;">Other Languages</td><td style="padding:6px;">${other_languages || "—"}</td></tr>
            <tr><td style="padding:6px;font-weight:bold;">Availability</td><td style="padding:6px;">${availability || "—"}</td></tr>
            <tr><td style="padding:6px;font-weight:bold;">Timezone</td><td style="padding:6px;">${timezone || "—"}</td></tr>
            <tr><td style="padding:6px;font-weight:bold;">About Teaching</td><td style="padding:6px;">${about_teaching || "—"}</td></tr>
            <tr><td style="padding:6px;font-weight:bold;">ID Document</td><td style="padding:6px;">✅ Uploaded</td></tr>
          </table>
          <p style="margin-top: 16px; color: #666; font-size: 13px;">Review this application in the <a href="https://www.learneazy.org/admin/applications">Admin Dashboard</a>.</p>
        </div>
      `;
    } else {
      adminHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #16a34a;">New Conversation Partner Application</h2>
          <table style="border-collapse:collapse;width:100%;">
            <tr><td style="padding:6px;font-weight:bold;">Name</td><td style="padding:6px;">${fullName}</td></tr>
            <tr><td style="padding:6px;font-weight:bold;">Email</td><td style="padding:6px;">${email}</td></tr>
            <tr><td style="padding:6px;font-weight:bold;">Phone</td><td style="padding:6px;">${phone || "—"}</td></tr>
            <tr><td style="padding:6px;font-weight:bold;">Country</td><td style="padding:6px;">${country || "—"}</td></tr>
            <tr><td style="padding:6px;font-weight:bold;">Motivation</td><td style="padding:6px;">${motivation || "—"}</td></tr>
            <tr><td style="padding:6px;font-weight:bold;">Conversation Style</td><td style="padding:6px;">${conversation_style || "—"}</td></tr>
            <tr><td style="padding:6px;font-weight:bold;">Video Intro</td><td style="padding:6px;">${video_intro_url ? `<a href="${video_intro_url}">${video_intro_url}</a>` : "—"}</td></tr>
          </table>
          <p style="margin-top: 16px; color: #666; font-size: 13px;">Review this application in the Admin Dashboard.</p>
        </div>
      `;
    }

    const adminSubject = isTutor
      ? `New Tutor Application Received`
      : `New Conversation Partner Application: ${fullName}`;

    await sendBrevoEmail(
      BREVO_API_KEY,
      [{ email: "galinakutubidze1@gmail.com", name: "LearnEazy Admin" }],
      adminSubject,
      adminHtml,
    );

    // Log to sent_emails table
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const bodyPreview = `Hi ${first_name}, thank you for applying as a ${roleLabel}. We'll respond within 3–5 business days.`;

    await supabase.from("sent_emails").insert([
      {
        recipient_email: email,
        subject: confirmSubject,
        body_preview: bodyPreview,
        application_type,
      },
      {
        recipient_email: "info@learneazy.org",
        subject: `New ${roleLabel} Application: ${fullName}`,
        body_preview: `New ${roleLabel} application from ${fullName} (${email})`,
        application_type,
      },
    ]);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error in send-application-confirmation-email:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
