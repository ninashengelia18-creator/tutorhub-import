import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const { email, display_name } = await req.json();

    if (!email) {
      throw new Error("Missing required field: email");
    }

    const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
    if (!BREVO_API_KEY) {
      console.log("BREVO_API_KEY not set. Welcome email not sent.");
      return new Response(JSON.stringify({ success: true, note: "No API key" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const firstName = display_name?.split(" ")[0] || "there";

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #7c3aed;">👋 Welcome to LearnEazy, ${firstName}!</h2>
        <p>We're excited to have you on board! Your account has been created and you're ready to start learning.</p>
        <p>Here's what you can do next:</p>
        <ol style="line-height: 1.8;">
          <li><strong>Verify your email</strong> — check your inbox for a verification link</li>
          <li><strong>Browse our tutors</strong> — find the perfect match for your learning goals</li>
          <li><strong>Book a trial lesson</strong> — try a session before committing</li>
          <li><strong>Start learning!</strong></li>
        </ol>
        <div style="margin: 24px 0;">
          <a href="https://www.learneazy.org/tutors"
             style="display: inline-block; background: #7c3aed; color: #fff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            Browse Tutors
          </a>
        </div>
        <p style="color: #555; font-size: 14px;">If you have any questions, feel free to reach out to us at <a href="mailto:info@learneazy.org">info@learneazy.org</a>.</p>
        <p style="color: #999; font-size: 12px;">— The LearnEazy Team</p>
      </div>
    `;

    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        sender: { name: "LearnEazy", email: "info@learneazy.org" },
        to: [{ email, name: display_name || email }],
        subject: `Welcome to LearnEazy, ${firstName}! 🎉`,
        htmlContent: html,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Brevo error:", errText);
      throw new Error(`Email send failed [${res.status}]: ${errText}`);
    }

    // Log to sent_emails table
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    await supabase.from("sent_emails").insert({
      recipient_email: email,
      subject: `Welcome to LearnEazy, ${firstName}! 🎉`,
      body_preview: `Welcome email sent to ${display_name || email}`,
      application_type: "student_welcome",
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error in send-student-welcome-email:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
