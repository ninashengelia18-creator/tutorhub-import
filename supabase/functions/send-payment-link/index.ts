import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function sendBrevoEmail(to: string, subject: string, htmlContent: string) {
  const apiKey = Deno.env.get("BREVO_API_KEY");
  if (!apiKey) {
    console.warn("BREVO_API_KEY not set, skipping email");
    return;
  }
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

    const authHeader = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!authHeader) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

    const { data: { user } } = await adminClient.auth.getUser(authHeader);
    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

    const { data: isAdmin } = await adminClient.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!isAdmin) return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: corsHeaders });

    const { booking_id, payment_link, amount } = await req.json();
    if (!booking_id || !payment_link) {
      return new Response(JSON.stringify({ error: "Missing booking_id or payment_link" }), { status: 400, headers: corsHeaders });
    }

    const { data: booking, error: bErr } = await adminClient
      .from("bookings")
      .select("*")
      .eq("id", booking_id)
      .single();

    if (bErr || !booking) return new Response(JSON.stringify({ error: "Booking not found" }), { status: 404, headers: corsHeaders });

    if (!booking.student_email) {
      return new Response(JSON.stringify({ error: "No student email on this booking" }), { status: 400, headers: corsHeaders });
    }

    const displayAmount = amount ?? booking.price_amount;
    const lessonDate = booking.lesson_date;
    const startTime = booking.start_time?.slice(0, 5) || "";

    await sendBrevoEmail(
      booking.student_email,
      `💳 Payment Link – ${booking.subject} with ${booking.tutor_name}`,
      `<div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto">
        <h2 style="color:#7c3aed">Complete Your Payment</h2>
        <p>Hi ${booking.student_name || "there"},</p>
        <p>Your <strong>${booking.subject}</strong> lesson with <strong>${booking.tutor_name}</strong> is almost confirmed!</p>
        <p>📅 <strong>${lessonDate}</strong> at <strong>${startTime}</strong></p>
        <p style="font-size:20px;font-weight:bold;text-align:center;margin:16px 0">$${Number(displayAmount).toFixed(2)} USD</p>
        <p style="margin:16px 0;text-align:center">
          <a href="${payment_link}" style="background:#7c3aed;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">
            Pay Now
          </a>
        </p>
        <p style="color:#666;font-size:13px">Once we receive your payment, you'll get a Google Meet link and session confirmation via email.</p>
        <p style="color:#666;font-size:13px">See you in class!<br>The LearnEazy Team</p>
      </div>`
    );

    // Create notification for the student
    await adminClient.from("notifications").insert({
      user_id: booking.student_id,
      type: "payment_link",
      title: "Payment Link Sent",
      message: `A payment link for your ${booking.subject} lesson with ${booking.tutor_name} has been sent to your email.`,
      booking_id,
    });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("send-payment-link error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal error" }),
      { status: 500, headers: corsHeaders }
    );
  }
});
