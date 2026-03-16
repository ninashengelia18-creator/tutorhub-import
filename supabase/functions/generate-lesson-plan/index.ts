import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type LessonPlan = {
  title: string;
  objectives: string[];
  materials: string[];
  warmUp: { duration: string; activity: string };
  mainContent: { step: string; title: string; description: string; duration: string }[];
  practiceActivities: { title: string; description: string; duration: string }[];
  assessment: string;
  homework: string;
  tutorTips: string[];
  totalEstimatedTime: string;
};

const asText = (value: unknown, fallback = ""): string => {
  if (typeof value === "string") return value.trim() || fallback;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return fallback;
};

const asStringArray = (value: unknown, fallback: string[] = []): string[] => {
  if (!Array.isArray(value)) return fallback;
  const items = value.map((item) => asText(item)).filter(Boolean);
  return items.length > 0 ? items : fallback;
};

const extractJsonObject = (content: string): Record<string, unknown> | null => {
  const cleaned = content.replace(/```json\s*/gi, "").replace(/```/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) return null;

    try {
      return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
    } catch {
      return null;
    }
  }
};

const normalizePlan = (input: Record<string, unknown>, durationFallback: string): LessonPlan => ({
  title: asText(input.title, "Lesson Plan"),
  objectives: asStringArray(input.objectives, ["Understand the core topic", "Practice with guided examples", "Apply the skill independently"]),
  materials: asStringArray(input.materials, ["Notebook", "Pen", "Lesson materials"]),
  warmUp: {
    duration: asText((input.warmUp as Record<string, unknown> | undefined)?.duration, "5-10 min"),
    activity: asText((input.warmUp as Record<string, unknown> | undefined)?.activity, "Brief review of prior knowledge and lesson introduction."),
  },
  mainContent: Array.isArray(input.mainContent) && input.mainContent.length > 0
    ? input.mainContent.map((item, index) => {
        const part = (item ?? {}) as Record<string, unknown>;
        return {
          step: asText(part.step, String(index + 1)),
          title: asText(part.title, `Step ${index + 1}`),
          description: asText(part.description, "Guided explanation and examples."),
          duration: asText(part.duration, "10 min"),
        };
      })
    : [{ step: "1", title: "Core instruction", description: "Introduce the main concept with examples and guided practice.", duration: durationFallback }],
  practiceActivities: Array.isArray(input.practiceActivities) && input.practiceActivities.length > 0
    ? input.practiceActivities.map((item, index) => {
        const part = (item ?? {}) as Record<string, unknown>;
        return {
          title: asText(part.title, `Practice ${index + 1}`),
          description: asText(part.description, "Students apply the concept through focused practice."),
          duration: asText(part.duration, "10 min"),
        };
      })
    : [{ title: "Independent practice", description: "Students complete a short task to apply the lesson independently.", duration: "10 min" }],
  assessment: asText(input.assessment, "Check understanding with a short review task and verbal feedback."),
  homework: asText(input.homework, "Assign a short follow-up task to reinforce the lesson."),
  tutorTips: asStringArray(input.tutorTips, ["Adjust pacing to the student's level", "Use concrete examples", "Finish with a quick recap"]),
  totalEstimatedTime: asText(input.totalEstimatedTime, durationFallback),
});

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { subject, studentLevel, duration, numStudents, learningGoals, weakPoints, language } = await req.json();

    if (!subject || !studentLevel || !duration || !numStudents) {
      return new Response(JSON.stringify({ error: "Missing required lesson plan fields." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const langMap: Record<string, string> = {
      ka: "Georgian (ქართული)",
      en: "English",
      ru: "Russian (Русский)",
    };
    const outputLang = langMap[language] || "English";

    const systemPrompt = `You are an expert lesson plan generator for tutors. Generate a detailed, professional lesson plan entirely in ${outputLang}.

Return a single valid JSON object with exactly these keys:
{
  "title": "Lesson title",
  "objectives": ["objective 1", "objective 2", "objective 3"],
  "materials": ["material 1", "material 2"],
  "warmUp": { "duration": "5-10 min", "activity": "description" },
  "mainContent": [{ "step": "1", "title": "step title", "description": "details", "duration": "X min" }],
  "practiceActivities": [{ "title": "activity", "description": "details", "duration": "X min" }],
  "assessment": "assessment method description",
  "homework": "homework assignment description",
  "tutorTips": ["tip 1", "tip 2", "tip 3"],
  "totalEstimatedTime": "X minutes"
}

Do not include markdown, code fences, commentary, or any extra text outside the JSON object.`;

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
        model: "google/gemini-3-flash-preview",
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

      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(JSON.stringify({ error: "AI generation failed." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const rawContent = data?.choices?.[0]?.message?.content;
    const content = typeof rawContent === "string"
      ? rawContent
      : Array.isArray(rawContent)
        ? rawContent.map((item) => item?.text ?? "").join("")
        : "";

    const parsedPlan = extractJsonObject(content);
    if (!parsedPlan) {
      console.error("Failed to parse AI response:", content);
      return new Response(JSON.stringify({ error: "Failed to parse lesson plan. Please try again." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const plan = normalizePlan(parsedPlan, duration);

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