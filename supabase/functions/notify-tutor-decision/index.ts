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
    const { email, first_name, last_name, decision } = await req.json();

    const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");

    let resetLink = "";

    if (decision === "approved") {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      try {
        const { data, error } = await supabase.auth.admin.generateLink({
          type: "recovery",
          email,
          options: {
            redirectTo: "https://www.learneazy.org/reset-password",
          },
        });
        if (error) {
          console.error("Failed to generate reset link:", error.message);
        } else if (data?.properties?.action_link) {
          resetLink = data.properties.action_link;
        }
      } catch (err) {
        console.error("Error generating reset link:", err);
      }
    }

    const subject =
      decision === "approved"
        ? `Congratulations! You've been accepted as a tutor on LearnEazy`
        : `Your LearnEazy tutor application update`;

    const resetButton = resetLink
      ? `
        <div style="margin: 24px 0;">
          <a href="${resetLink}"
             style="display: inline-block; background: #2563eb; color: #fff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            Set Up Your Password
          </a>
        </div>
        <p style="color: #555; font-size: 14px;">Once you've set your password, you can log in anytime at:</p>
        <div style="margin: 12px 0 24px 0;">
          <a href="https://www.learneazy.org/login"
             style="display: inline-block; background: #16a34a; color: #fff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            Log in to LearnEazy
          </a>
        </div>`
      : `
        <div style="margin: 24px 0;">
          <a href="https://www.learneazy.org/login"
             style="display: inline-block; background: #16a34a; color: #fff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            Log in to LearnEazy
          </a>
        </div>`;

    const html =
      decision === "approved"
        ? `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #16a34a;">🎉 Welcome to LearnEazy, ${first_name}!</h2>
        <p>We're thrilled to let you know that your tutor application has been <strong>approved</strong>!</p>
        <p>You are now an official LearnEazy tutor and can start teaching on the platform right away.</p>
        <p>Here's what to do next:</p>
        <ol style="line-height: 1.8;">
          <li><strong>Set up your password</strong> using the button below</li>
          <li>Log in to your tutor dashboard</li>
          <li>Set up your availability so students can book lessons with you</li>
          <li>Start accepting bookings and teaching!</li>
        </ol>
        ${resetButton}
        <p style="color: #555; font-size: 14px;">Once you complete your first session, we will be in touch to collect your payment details for earnings withdrawals.</p>
        <p style="color: #666; font-size: 14px;">If you have any questions, contact us at <a href="mailto:info@learneazy.org">info@learneazy.org</a>.</p>
        <p style="color: #999; font-size: 12px;">— The LearnEazy Team</p>
      </div>`
        : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Hi ${first_name},</h2>
        <p>Thank you for your interest in becoming a tutor on LearnEazy and for taking the time to apply.</p>
        <p>After careful review, we regret to inform you that we are unable to approve your application at this time.</p>
        <p>This doesn't mean the door is closed — we encourage you to <strong>reapply in the future</strong> as our needs and criteria may change.</p>
        <p>If you have any questions or would like feedback on your application, please don't hesitate to reach out to us at <a href="mailto:info@learneazy.org">info@learneazy.org</a>.</p>
        <p style="margin-top: 24px; color: #666;">We wish you all the best!</p>
        <p style="color: #999; font-size: 12px;">— The LearnEazy Team</p>
      </div>`;

    if (BREVO_API_KEY) {
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": BREVO_API_KEY,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          sender: { name: "LearnEazy", email: "info@learneazy.org" },
          to: [{ email, name: `${first_name} ${last_name}` }],
          subject,
          htmlContent: html,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("Brevo error:", errText);
        throw new Error(`Email send failed [${res.status}]: ${errText}`);
      }
    } else {
      console.log("BREVO_API_KEY not set. Decision logged but email not sent.");
      console.log(`Decision: ${decision} for ${first_name} ${last_name} (${email})`);
    }

    // Also trigger a Supabase password reset email for approved tutors
    if (decision === "approved") {
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const resetSupabase = createClient(supabaseUrl, supabaseServiceKey);

        const { error: resetError } = await resetSupabase.auth.resetPasswordForEmail(email, {
          redirectTo: "https://www.learneazy.org/reset-password",
        });
        if (resetError) {
          console.error("Failed to send Supabase password reset email:", resetError.message);
        } else {
          console.log("Supabase password reset email sent to:", email);
        }
      } catch (resetErr) {
        console.error("Error sending Supabase password reset email:", resetErr);
      }
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
