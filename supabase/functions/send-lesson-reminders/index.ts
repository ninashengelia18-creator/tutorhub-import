import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function sendBrevoEmail(apiKey: string, to: string, subject: string, htmlContent: string) {
  await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      sender: { name: "LearnEazy", email: "info@learneazy.org" },
      to: [{ email: to }],
      subject,
      htmlContent,
    }),
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const brevoKey = Deno.env.get("BREVO_API_KEY");
    const now = new Date();
    const thirtyMinLater = new Date(now.getTime() + 30 * 60 * 1000);

    // Find confirmed bookings starting within 30 minutes that haven't been reminded
    const { data: bookings, error } = await adminClient
      .from("bookings")
      .select("*")
      .eq("status", "confirmed")
      .is("reminder_sent_at", null)
      .lte("lesson_start_at", thirtyMinLater.toISOString())
      .gte("lesson_start_at", now.toISOString());

    if (error) {
      console.error("Query error:", error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
    }

    if (!bookings || bookings.length === 0) {
      return new Response(JSON.stringify({ reminded: 0 }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let reminded = 0;

    for (const booking of bookings) {
      const meetLinkHtml = booking.google_meet_link
        ? `<p style="margin:16px 0"><a href="${booking.google_meet_link}" style="background:#7c3aed;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Join Google Meet</a></p>`
        : "";

      const startTimeStr = booking.start_time?.slice(0, 5) || "";

      // Notify student
      const studentNotif = {
        user_id: booking.student_id,
        type: "lesson_reminder",
        title: "Lesson Starting Soon!",
        message: `Your ${booking.subject} lesson with ${booking.tutor_name} starts in ~30 minutes.`,
        booking_id: booking.id,
      };

      // Find tutor user_id
      const { data: tutorProfile } = await adminClient
        .from("profiles")
        .select("id")
        .eq("display_name", booking.tutor_name)
        .maybeSingle();

      const notifications = [studentNotif];
      if (tutorProfile?.id) {
        notifications.push({
          user_id: tutorProfile.id,
          type: "lesson_reminder",
          title: "Lesson Starting Soon!",
          message: `Your ${booking.subject} lesson with ${booking.student_name || "a student"} starts in ~30 minutes.`,
          booking_id: booking.id,
        });
      }

      await adminClient.from("notifications").insert(notifications);

      // Send reminder emails
      if (brevoKey && booking.student_email) {
        await sendBrevoEmail(
          brevoKey,
          booking.student_email,
          `⏰ Lesson in 30 min – ${booking.subject} with ${booking.tutor_name}`,
          `<div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto">
            <h2 style="color:#7c3aed">Your Lesson Starts Soon!</h2>
            <p>Hi ${booking.student_name || "there"},</p>
            <p>Your <strong>${booking.subject}</strong> lesson with <strong>${booking.tutor_name}</strong> starts in about 30 minutes.</p>
            <p>📅 Today at <strong>${startTimeStr}</strong></p>
            ${meetLinkHtml}
            <p style="color:#666;font-size:13px">See you in class!<br>The LearnEazy Team</p>
          </div>`
        );
      }

      // Email tutor
      if (brevoKey) {
        const { data: tutorEmailProfile } = await adminClient
          .from("public_tutor_profiles")
          .select("email")
          .ilike("first_name", booking.tutor_name.split(" ")[0])
          .limit(1)
          .maybeSingle();

        if (tutorEmailProfile?.email) {
          await sendBrevoEmail(
            brevoKey,
            tutorEmailProfile.email,
            `⏰ Lesson in 30 min – ${booking.subject}`,
            `<div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto">
              <h2 style="color:#7c3aed">Your Lesson Starts Soon!</h2>
              <p>Hi ${booking.tutor_name.split(" ")[0]},</p>
              <p>Your <strong>${booking.subject}</strong> lesson with <strong>${booking.student_name || "a student"}</strong> starts in about 30 minutes.</p>
              <p>📅 Today at <strong>${startTimeStr}</strong></p>
              ${meetLinkHtml}
              <p style="color:#666;font-size:13px">Get ready!<br>The LearnEazy Team</p>
            </div>`
          );
        }
      }

      // Mark as reminded
      await adminClient
        .from("bookings")
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq("id", booking.id);

      reminded++;
    }

    return new Response(
      JSON.stringify({ reminded }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("send-lesson-reminders error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal error" }),
      { status: 500, headers: corsHeaders }
    );
  }
});
