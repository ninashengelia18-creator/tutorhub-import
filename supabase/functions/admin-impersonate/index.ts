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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the caller is an admin
    const authHeader = req.headers.get("authorization");
    if (!authHeader) throw new Error("Unauthorized");

    const token = authHeader.replace("Bearer ", "");
    const { data: { user: caller }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !caller) throw new Error("Unauthorized");

    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: caller.id,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Admin access required");

    const { email, redirectTo } = await req.json();
    if (!email) throw new Error("Email is required");

    // Use the origin from the request or fall back to learneazy.org
    const origin = req.headers.get("origin") || "https://www.learneazy.org";
    const targetRedirect = redirectTo || `${origin}/tutor-dashboard`;

    // Generate a magic link for the target user
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: {
        redirectTo: targetRedirect,
      },
    });

    if (linkError) throw new Error(`Failed to generate link: ${linkError.message}`);

    // Use the action_link directly — it contains the correct verification URL
    const loginUrl = linkData?.properties?.action_link
      ? linkData.properties.action_link.replace(
          /redirect_to=[^&]*/,
          `redirect_to=${encodeURIComponent(targetRedirect)}`
        )
      : `${supabaseUrl}/auth/v1/verify?token=${linkData?.properties?.hashed_token}&type=magiclink&redirect_to=${encodeURIComponent(targetRedirect)}`;

    return new Response(JSON.stringify({ success: true, url: loginUrl }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error in admin-impersonate:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: error instanceof Error && error.message.includes("Unauthorized") ? 401 : 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
