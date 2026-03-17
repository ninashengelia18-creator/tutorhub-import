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

    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: isAdmin, error: roleError } = await userClient.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });

    if (roleError || !isAdmin) {
      return new Response(JSON.stringify({ error: "Unauthorized." }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { tutorProfileId } = await req.json();
    const normalizedTutorProfileId = String(tutorProfileId ?? "").trim();

    if (!normalizedTutorProfileId) {
      return new Response(JSON.stringify({ error: "Missing tutor profile id." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: tutor, error: tutorError } = await adminClient
      .from("public_tutor_profiles")
      .select("id, application_id, email, first_name, last_name")
      .eq("id", normalizedTutorProfileId)
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

    let authUserId: string | null = null;

    if (normalizedEmail) {
      const { data: listedUsers, error: listUsersError } = await adminClient.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });
      if (listUsersError) throw listUsersError;

      authUserId = listedUsers.users.find((entry) => entry.email?.trim().toLowerCase() === normalizedEmail)?.id ?? null;
    }

    if (fullName) {
      const deleteByTutorNameResults = await Promise.all([
        adminClient.from("messages").delete().eq("tutor_name", fullName),
        adminClient.from("message_conversations").delete().eq("tutor_name", fullName),
        adminClient.from("bookings").delete().eq("tutor_name", fullName),
      ]);

      const failedTutorNameDeletion = deleteByTutorNameResults.find((result) => result.error);
      if (failedTutorNameDeletion?.error) {
        throw failedTutorNameDeletion.error;
      }

      const { error: deleteAvailabilityError } = await adminClient
        .from("tutor_availability_slots")
        .delete()
        .eq("tutor_name", fullName);

      if (deleteAvailabilityError) {
        throw deleteAvailabilityError;
      }
    }

    if (authUserId) {
      const accountDeletionOperations = [
        adminClient.from("lesson_plans").delete().eq("tutor_id", authUserId),
        adminClient.from("messages").delete().eq("sender_id", authUserId),
        adminClient.from("notification_preferences").delete().eq("user_id", authUserId),
        adminClient.from("user_preferences").delete().eq("user_id", authUserId),
        adminClient.from("profiles").delete().eq("id", authUserId),
        adminClient.from("user_roles").delete().eq("user_id", authUserId),
      ];

      const accountDeletionResults = await Promise.all(accountDeletionOperations);
      const failedAccountDeletion = accountDeletionResults.find((result) => result.error);
      if (failedAccountDeletion?.error) {
        throw failedAccountDeletion.error;
      }
    }

    const { error: deleteProfileError } = await adminClient
      .from("public_tutor_profiles")
      .delete()
      .eq("id", normalizedTutorProfileId);
    if (deleteProfileError) throw deleteProfileError;

    if (tutor.application_id) {
      const { error: deleteApplicationError } = await adminClient
        .from("tutor_applications")
        .delete()
        .eq("id", tutor.application_id);
      if (deleteApplicationError) throw deleteApplicationError;
    }

    if (authUserId) {
      const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(authUserId);
      if (deleteUserError) throw deleteUserError;
    }

    if (normalizedEmail) {
      await fetch("https://formspree.io/f/mojknpqp", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          email: normalizedEmail,
          full_name: fullName,
          tutor_email: normalizedEmail,
          tutor_message:
            "Your LearnEazy tutor account has been removed. Please contact info@learneazy.org for more information.",
          _subject: `Tutor account removed: ${fullName}`,
        }),
      }).catch((notificationError) => {
        console.error("admin-delete-tutor notification error", notificationError);
        return null;
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("admin-delete-tutor error", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
