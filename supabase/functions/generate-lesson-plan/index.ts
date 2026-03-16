import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { subject, studentLevel, duration, numStudents, learningGoals, weakPoints, language } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const langMap: Record<string, string> = {
      ka: "Georgian (ქართული)",
      en: "English",
      ru: "Russian (Русский)",
    };
    const outputLang = langMap[language] || "English";

    const systemPrompt = `You are an expert lesson plan generator for tutors. Generate a detailed, professional lesson plan entirely in ${outputLang}. 

Return the plan in the following JSON format (all values must be strings in ${outputLang}):
{
  "title": "Lesson title",
  "objectives": ["objective 1", "objective 2", "objective 3", "objective 4"],
  "materials": ["material 1", "material 2"],
  "warmUp": { "duration": "5-10 min", "activity": "description" },
  "mainContent": [{ "step": "1", "title": "step title", "description": "details", "duration": "X min" }],
  "practiceActivities": [{ "title": "activity", "description": "details", "duration": "X min" }],
  "assessment": "assessment method description",
  "homework": "homework assignment description",
  "tutorTips": ["tip 1", "tip 2", "tip 3"],
  "totalEstimatedTime": "X minutes"
}

IMPORTANT: Return ONLY valid JSON, no markdown, no code blocks, no extra text.`;

    const userPrompt = `Create a lesson plan with these parameters:
- Subject: ${subject}
- Student age/level: ${studentLevel}
- Lesson duration: ${duration}
- Number of students: ${numStudents}
- Learning goals: ${learningGoals || "General improvement"}
- Student weak points: ${weakPoints || "None specified"}

Make the plan practical, engaging, and appropriate for the student level. Include specific examples and activities.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service credits exhausted. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI generation failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    // Try to parse the JSON from the response
    let plan;
    try {
      // Remove potential markdown code blocks
      const cleaned = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      plan = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", content);
      return new Response(JSON.stringify({ error: "Failed to parse lesson plan. Please try again." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ plan }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-lesson-plan error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
