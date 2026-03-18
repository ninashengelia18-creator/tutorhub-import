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
    const { first_name, email, application_type } = await req.json();

    if (!first_name || !email || !application_type) {
      throw new Error("Missing required fields: first_name, email, application_type");
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const roleLabel = application_type === "tutor" ? "Tutor" : "Conversation Partner";

    const subject = "We received your application";
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #16a34a;">Hi ${first_name},</h2>
        <p>Thank you for applying to become a <strong>${roleLabel}</strong> at LearnEazy!</p>
        <p>We have successfully received your application and our team is reviewing it. You can expect to hear back from us within <strong>3–5 business days</strong>.</p>
        <p>If you have any questions in the meantime, feel free to reach out to us at <a href="mailto:info@learneazy.org">info@learneazy.org</a>.</p>
        <p style="margin-top: 24px; color: #666;">— The LearnEazy Team</p>
      </div>
    `;

    const bodyPreview = `Hi ${first_name}, thank you for applying as a ${roleLabel}. We'll respond within 3–5 business days.`;

    // Send email via Resend
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Learneazy Applications <applications@my-domain.com>",
        to: [email],
        subject,
        html: htmlBody,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Resend error:", errText);
      throw new Error(`Email send failed [${res.status}]: ${errText}`);
    }

    // Log to sent_emails table
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    await supabase.from("sent_emails").insert({
      recipient_email: email,
      subject,
      body_preview: bodyPreview,
      application_type,
    });

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
