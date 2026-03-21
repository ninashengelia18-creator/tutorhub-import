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

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Step 1: Create user account with a random password (auto-confirmed)
    const tempPassword = crypto.randomUUID();
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { display_name },
    });

    const alreadyRegistered = createError && (
      createError.message.toLowerCase().includes("already") ||
      createError.status === 422
    );

    if (createError && !alreadyRegistered) {
      console.error("Failed to create student account:", createError.message);
      throw new Error(`Account creation failed: ${createError.message}`);
    }

    if (alreadyRegistered) {
      return new Response(
        JSON.stringify({ success: false, error: "An account with this email already exists. Please log in instead." }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 2: Generate password setup link
    const siteUrl = "https://www.learneazy.org";
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: "recovery",
      email,
    });

    let activateUrl = `${siteUrl}/activate-account`;
    if (linkError) {
      console.error("Failed to generate activation link:", linkError.message);
    } else if (linkData?.properties?.hashed_token) {
      const tokenHash = linkData.properties.hashed_token;
      activateUrl = `${siteUrl}/activate-account?token_hash=${tokenHash}&type=recovery`;
    } else if (linkData?.properties?.action_link) {
      const actionUrl = new URL(linkData.properties.action_link);
      const token = actionUrl.searchParams.get("token") || actionUrl.searchParams.get("token_hash");
      if (token) {
        activateUrl = `${siteUrl}/activate-account?token_hash=${token}&type=recovery`;
      }
    }

    // Step 3: Send unified welcome + activation email via Brevo
    const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
    const firstName = display_name?.split(" ")[0] || "there";

    if (BREVO_API_KEY) {
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #7c3aed;">👋 Welcome to LearnEazy, ${firstName}!</h2>
          <p>We're excited to have you on board! Your account has been created and you're almost ready to start learning.</p>
          <p>To get started, set up your password using the button below:</p>
          <div style="margin: 24px 0;">
            <a href="${activateUrl}"
               style="display: inline-block; background: #7c3aed; color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
              Set Up Your Password
            </a>
          </div>
          <p>Once your password is set, you'll be taken to your dashboard where you can:</p>
          <ol style="line-height: 1.8;">
            <li><strong>Browse our tutors</strong> — find the perfect match for your learning goals</li>
            <li><strong>Book a trial lesson</strong> — try a session before committing</li>
            <li><strong>Start learning!</strong></li>
          </ol>
          <div style="margin: 24px 0;">
            <a href="${siteUrl}/search"
               style="display: inline-block; background: #16a34a; color: #fff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;">
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
          subject: `Welcome to LearnEazy, ${firstName}! Set up your account 🎉`,
          htmlContent: html,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("Brevo error:", errText);
        throw new Error(`Email send failed [${res.status}]: ${errText}`);
      }
    } else {
      console.log("BREVO_API_KEY not set. Account created but email not sent.");
    }

    // Step 4: Log to sent_emails
    await supabase.from("sent_emails").insert({
      recipient_email: email,
      subject: `Welcome to LearnEazy, ${firstName}! Set up your account 🎉`,
      body_preview: `Unified welcome + activation email sent to ${display_name || email}`,
      application_type: "student_activation",
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error in create-student-account:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
