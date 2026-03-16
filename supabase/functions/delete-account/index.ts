import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const authHeader = req.headers.get("Authorization");
    const formspreeEndpoint = "https://formspree.io/f/mojknpqp";

    if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
      throw new Error("Backend configuration is missing.");
    }

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

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { email } = await req.json();
    const normalizedEmail = String(email ?? "").trim().toLowerCase();
    const accountEmail = userData.user.email?.trim().toLowerCase();

    if (!accountEmail || normalizedEmail !== accountEmail) {
      return new Response(JSON.stringify({ error: "Email confirmation does not match your account." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;
    const accountCreatedAt = userData.user.created_at ?? null;
    const notificationPromise = fetch(formspreeEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: "LearnEazy account deleted",
        message: "A user deleted their LearnEazy account.",
        account_email: accountEmail,
        user_id: userId,
        created_at: accountCreatedAt,
        deleted_at: new Date().toISOString(),
      }),
    }).catch((notificationError) => {
      console.error("delete-account notification error", notificationError);
      return null;
    });

    const mutations = [
      adminClient.from("messages").delete().eq("student_id", userId),
      adminClient.from("messages").delete().eq("sender_id", userId),
      adminClient.from("bookings").delete().eq("student_id", userId),
      adminClient.from("notification_preferences").delete().eq("user_id", userId),
      adminClient.from("profiles").delete().eq("id", userId),
      adminClient.from("user_roles").delete().eq("user_id", userId),
    ];

    const results = await Promise.all(mutations);
    const failed = results.find((result) => result.error);
    if (failed?.error) {
      throw failed.error;
    }

    const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(userId);
    if (deleteUserError) {
      throw deleteUserError;
    }

    await notificationPromise;

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("delete-account error", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
