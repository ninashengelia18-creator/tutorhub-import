import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// NOTE: This function is kept for backwards compatibility but
// admin notification is now handled by send-application-confirmation-email.
// This function can be removed in the future.

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { first_name, last_name, email } = body;

    const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
    if (!BREVO_API_KEY) {
      console.log("BREVO_API_KEY not set. Application logged but email not sent.");
      console.log("Application from:", first_name, last_name, email);
      return new Response(JSON.stringify({ success: true, note: "No API key" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>New Tutor Application</h2>
        <p>A new tutor application has been submitted by <strong>${first_name} ${last_name}</strong> (${email}).</p>
        <p>Please review it in the <a href="https://learneazy.org/admin/applications">Admin Dashboard</a>.</p>
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
        to: [{ email: "info@learneazy.org", name: "LearnEazy Admin" }],
        subject: `New Tutor Application: ${first_name} ${last_name}`,
        htmlContent: html,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Brevo error:", errText);
      throw new Error(`Email send failed [${res.status}]: ${errText}`);
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
