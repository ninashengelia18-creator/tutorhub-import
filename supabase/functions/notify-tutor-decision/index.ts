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
    const { email, first_name, last_name, decision } = await req.json();

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    const subject =
      decision === "approved"
        ? `Congratulations ${first_name}! Your LearnEazy tutor application has been approved!`
        : `LearnEazy Tutor Application Update`;

    const html =
      decision === "approved"
        ? `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #16a34a;">🎉 Congratulations, ${first_name}!</h2>
        <p>Your LearnEazy tutor application has been <strong>approved</strong>!</p>
        <p>You can now log in and start setting up your availability to receive student bookings.</p>
        <div style="margin: 24px 0;">
          <a href="https://learneazy.org/login?portal=tutor"
             style="display: inline-block; background: #16a34a; color: #fff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            Log in to LearnEazy
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">If you have any questions, contact us at info@learneazy.org</p>
        <p style="color: #999; font-size: 12px;">— The LearnEazy Team</p>
      </div>`
        : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Hi ${first_name},</h2>
        <p>Thank you for applying to become a tutor on LearnEazy.</p>
        <p>After careful review, we are unable to approve your application at this time.</p>
        <p>If you have questions or would like to reapply in the future, please contact us at <a href="mailto:info@learneazy.org">info@learneazy.org</a>.</p>
        <p style="color: #999; font-size: 12px;">— The LearnEazy Team</p>
      </div>`;

    if (RESEND_API_KEY) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "LearnEazy <noreply@notify.www.getaiwhisper.com>",
          to: [email],
          subject,
          html,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("Resend error:", errText);
        throw new Error(`Email send failed [${res.status}]: ${errText}`);
      }
    } else {
      console.log("RESEND_API_KEY not set. Decision logged but email not sent.");
      console.log(`Decision: ${decision} for ${first_name} ${last_name} (${email})`);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error in notify-tutor-decision:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
