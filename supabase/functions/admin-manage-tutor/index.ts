import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function sendBrevoEmail(apiKey: string, to: { email: string; name: string }, subject: string, html: string) {
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sender: { name: "LearnEazy", email: "info@learneazy.org" },
      to: [to],
      subject,
      htmlContent: html,
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    console.error("Brevo error:", errText);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY") ?? "";
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Verify caller is admin
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: isAdmin } = await userClient.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });

    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Unauthorized." }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, tutorProfileId } = await req.json();

    if (!tutorProfileId || !["suspend", "unsuspend", "delete"].includes(action)) {
      return new Response(JSON.stringify({ error: "Invalid action or missing tutor profile id." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch tutor profile
    const { data: tutor, error: tutorError } = await adminClient
      .from("public_tutor_profiles")
      .select("id, application_id, email, first_name, last_name")
      .eq("id", tutorProfileId)
      .maybeSingle();

    if (tutorError) throw tutorError;
    if (!tutor) {
      return new Response(JSON.stringify({ error: "Tutor not found." }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const fullName = [tutor.first_name, tutor.last_name].filter(Boolean).join(" ").trim();
    const normalizedEmail = String(tutor.email ?? "").trim().toLowerCase();

    // Find auth user by email
    let authUserId: string | null = null;
    if (normalizedEmail) {
      const { data: listedUsers } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 });
      authUserId = listedUsers?.users?.find((u) => u.email?.trim().toLowerCase() === normalizedEmail)?.id ?? null;
    }

    if (action === "suspend") {
      // Set is_suspended on profiles
      if (authUserId) {
        await adminClient.from("profiles").update({ is_suspended: true }).eq("id", authUserId);
      }

      // Unpublish tutor profile
      await adminClient
        .from("public_tutor_profiles")
        .update({ is_published: false, updated_at: new Date().toISOString() })
        .eq("id", tutorProfileId);

      // Send suspension email
      if (BREVO_API_KEY && normalizedEmail) {
        await sendBrevoEmail(
          BREVO_API_KEY,
          { email: normalizedEmail, name: fullName },
          "Your LearnEazy tutor account has been suspended",
          `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Hi ${tutor.first_name},</h2>
            <p>We're writing to let you know that your LearnEazy tutor account has been <strong>temporarily suspended</strong>.</p>
            <p>During this time, your profile will not be visible to students and you will not be able to log in.</p>
            <p>If you believe this is an error or would like more information, please contact us at <a href="mailto:info@learneazy.org">info@learneazy.org</a>.</p>
            <p style="color: #999; font-size: 12px; margin-top: 24px;">— The LearnEazy Team</p>
          </div>`,
        );
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "unsuspend") {
      // Remove suspension
      if (authUserId) {
        await adminClient.from("profiles").update({ is_suspended: false }).eq("id", authUserId);
      }

      // Republish tutor profile
      await adminClient
        .from("public_tutor_profiles")
        .update({ is_published: true, updated_at: new Date().toISOString() })
        .eq("id", tutorProfileId);

      // Send reactivation email
      if (BREVO_API_KEY && normalizedEmail) {
        await sendBrevoEmail(
          BREVO_API_KEY,
          { email: normalizedEmail, name: fullName },
          "Your LearnEazy tutor account has been reactivated",
          `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #16a34a;">Welcome back, ${tutor.first_name}!</h2>
            <p>Great news — your LearnEazy tutor account has been <strong>reactivated</strong>.</p>
            <p>Your profile is now visible to students again and you can log in to manage your schedule and bookings.</p>
            <div style="margin: 24px 0;">
              <a href="https://www.learneazy.org/login?portal=tutor"
                 style="display: inline-block; background: #2563eb; color: #fff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                Log In to Your Dashboard
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">If you have any questions, contact us at <a href="mailto:info@learneazy.org">info@learneazy.org</a>.</p>
            <p style="color: #999; font-size: 12px;">— The LearnEazy Team</p>
          </div>`,
        );
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "delete") {
      // Delete related data by tutor name
      if (fullName) {
        await Promise.all([
          adminClient.from("messages").delete().eq("tutor_name", fullName),
          adminClient.from("message_conversations").delete().eq("tutor_name", fullName),
          adminClient.from("bookings").delete().eq("tutor_name", fullName),
          adminClient.from("tutor_availability_slots").delete().eq("tutor_name", fullName),
        ]);
      }

      // Delete user-associated data and remove tutor role
      if (authUserId) {
        await Promise.all([
          adminClient.from("lesson_plans").delete().eq("tutor_id", authUserId),
          adminClient.from("messages").delete().eq("sender_id", authUserId),
          adminClient.from("notification_preferences").delete().eq("user_id", authUserId),
          adminClient.from("user_preferences").delete().eq("user_id", authUserId),
          adminClient.from("profiles").delete().eq("id", authUserId),
          adminClient.from("user_roles").delete().eq("user_id", authUserId),
        ]);
      }

      // Delete tutor profile
      await adminClient.from("public_tutor_profiles").delete().eq("id", tutorProfileId);

      // Delete application if exists
      if (tutor.application_id) {
        await adminClient.from("tutor_applications").delete().eq("id", tutor.application_id);
      }

      // Disable auth account (delete from Supabase Auth)
      if (authUserId) {
        await adminClient.auth.admin.deleteUser(authUserId);
      }

      // Send deletion email
      if (BREVO_API_KEY && normalizedEmail) {
        await sendBrevoEmail(
          BREVO_API_KEY,
          { email: normalizedEmail, name: fullName },
          "Your LearnEazy tutor account has been removed",
          `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Hi ${tutor.first_name},</h2>
            <p>We're writing to let you know that your LearnEazy tutor account has been <strong>permanently removed</strong> from the platform.</p>
            <p>All associated data including your profile, bookings, and messages have been deleted.</p>
            <p>If you believe this is an error or have any questions, please contact us at <a href="mailto:info@learneazy.org">info@learneazy.org</a>.</p>
            <p style="color: #999; font-size: 12px; margin-top: 24px;">— The LearnEazy Team</p>
          </div>`,
        );
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action." }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("admin-manage-tutor error", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
