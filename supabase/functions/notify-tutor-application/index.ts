import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      first_name,
      last_name,
      email,
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
    } = body;

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    // Build a simple HTML email with the application details
    const html = `
      <h2>New Tutor Application</h2>
      <table style="border-collapse:collapse;width:100%;max-width:600px;">
        <tr><td style="padding:6px;font-weight:bold;">Name</td><td style="padding:6px;">${first_name} ${last_name}</td></tr>
        <tr><td style="padding:6px;font-weight:bold;">Email</td><td style="padding:6px;">${email}</td></tr>
        <tr><td style="padding:6px;font-weight:bold;">Phone</td><td style="padding:6px;">${phone || "—"}</td></tr>
        <tr><td style="padding:6px;font-weight:bold;">Country</td><td style="padding:6px;">${country || "—"}</td></tr>
        <tr><td style="padding:6px;font-weight:bold;">Experience</td><td style="padding:6px;">${experience}</td></tr>
        <tr><td style="padding:6px;font-weight:bold;">Education</td><td style="padding:6px;">${education || "—"}</td></tr>
        <tr><td style="padding:6px;font-weight:bold;">Certifications</td><td style="padding:6px;">${certifications || "—"}</td></tr>
        <tr><td style="padding:6px;font-weight:bold;">Bio</td><td style="padding:6px;">${bio}</td></tr>
        <tr><td style="padding:6px;font-weight:bold;">Subjects</td><td style="padding:6px;">${(subjects || []).join(", ")}</td></tr>
        <tr><td style="padding:6px;font-weight:bold;">Hourly Rate</td><td style="padding:6px;">$${hourly_rate}/hr</td></tr>
        <tr><td style="padding:6px;font-weight:bold;">Native Language</td><td style="padding:6px;">${native_language || "—"}</td></tr>
        <tr><td style="padding:6px;font-weight:bold;">Other Languages</td><td style="padding:6px;">${other_languages || "—"}</td></tr>
        <tr><td style="padding:6px;font-weight:bold;">Availability</td><td style="padding:6px;">${availability}</td></tr>
        <tr><td style="padding:6px;font-weight:bold;">Timezone</td><td style="padding:6px;">${timezone || "—"}</td></tr>
        <tr><td style="padding:6px;font-weight:bold;">About Teaching</td><td style="padding:6px;">${about_teaching || "—"}</td></tr>
      </table>
    `;

    if (RESEND_API_KEY) {
      // Send admin notification
      const adminRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "LearnEazy <noreply@notify.www.getaiwhisper.com>",
          to: ["info@learneazy.org"],
          subject: `New Tutor Application: ${first_name} ${last_name}`,
          html,
        }),
      });

      if (!adminRes.ok) {
        const errText = await adminRes.text();
        console.error("Resend admin notification error:", errText);
      }

      // Send confirmation email to applicant
      const confirmationHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Thank you for applying to LearnEazy!</h2>
          <p>Dear ${first_name},</p>
          <p>We have received your application and will review it within 2–3 business days. We will email you with our decision.</p>
          <p>In the meantime if you have any questions, contact us at <a href="mailto:info@learneazy.org">info@learneazy.org</a></p>
          <p style="color: #999; font-size: 12px;">— The LearnEazy Team</p>
        </div>`;

      const applicantRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "LearnEazy <noreply@notify.www.getaiwhisper.com>",
          to: [email],
          subject: "We've received your LearnEazy tutor application!",
          html: confirmationHtml,
        }),
      });

      if (!applicantRes.ok) {
        const errText = await applicantRes.text();
        console.error("Resend applicant confirmation error:", errText);
      }
    } else {
      console.log("RESEND_API_KEY not set. Application logged but email not sent.");
      console.log("Application from:", first_name, last_name, email);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error in notify-tutor-application:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
