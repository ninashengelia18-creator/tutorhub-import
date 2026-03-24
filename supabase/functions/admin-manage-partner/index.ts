import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
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

    const { action, partnerProfileId } = await req.json();

    if (!partnerProfileId || !["archive", "unarchive", "delete", "suspend", "unsuspend"].includes(action)) {
      return new Response(JSON.stringify({ error: "Invalid action or missing partner profile id." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch partner profile
    const { data: partner, error: partnerError } = await adminClient
      .from("public_partner_profiles")
      .select("id, application_id, email, first_name, last_name")
      .eq("id", partnerProfileId)
      .maybeSingle();

    if (partnerError) throw partnerError;
    if (!partner) {
      return new Response(JSON.stringify({ error: "Partner not found." }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const normalizedEmail = String(partner.email ?? "").trim().toLowerCase();

    // Find auth user by email
    let authUserId: string | null = null;
    if (normalizedEmail) {
      const { data: listedUsers } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 });
      authUserId = listedUsers?.users?.find((u) => u.email?.trim().toLowerCase() === normalizedEmail)?.id ?? null;
    }

    if (action === "archive") {
      await adminClient
        .from("public_partner_profiles")
        .update({ is_published: false, is_archived: true, updated_at: new Date().toISOString() })
        .eq("id", partnerProfileId);

      if (authUserId) {
        await adminClient.from("profiles").update({ is_suspended: true }).eq("id", authUserId);
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "unarchive") {
      await adminClient
        .from("public_partner_profiles")
        .update({ is_published: true, is_archived: false, updated_at: new Date().toISOString() })
        .eq("id", partnerProfileId);

      if (authUserId) {
        await adminClient.from("profiles").update({ is_suspended: false }).eq("id", authUserId);
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "suspend") {
      if (authUserId) {
        await adminClient.from("profiles").update({ is_suspended: true }).eq("id", authUserId);
      }
      await adminClient
        .from("public_partner_profiles")
        .update({ is_published: false, updated_at: new Date().toISOString() })
        .eq("id", partnerProfileId);

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "unsuspend") {
      if (authUserId) {
        await adminClient.from("profiles").update({ is_suspended: false }).eq("id", authUserId);
      }
      await adminClient
        .from("public_partner_profiles")
        .update({ is_published: true, updated_at: new Date().toISOString() })
        .eq("id", partnerProfileId);

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "delete") {
      // Delete partner profile
      await adminClient.from("public_partner_profiles").delete().eq("id", partnerProfileId);

      // Delete application if exists
      if (partner.application_id) {
        await adminClient.from("conversation_partner_applications").delete().eq("id", partner.application_id);
      }

      // Remove roles and profile data
      if (authUserId) {
        await Promise.all([
          adminClient.from("user_roles").delete().eq("user_id", authUserId),
          adminClient.from("profiles").delete().eq("id", authUserId),
          adminClient.from("notification_preferences").delete().eq("user_id", authUserId),
          adminClient.from("user_preferences").delete().eq("user_id", authUserId),
        ]);
        await adminClient.auth.admin.deleteUser(authUserId);
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
    console.error("admin-manage-partner error", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
