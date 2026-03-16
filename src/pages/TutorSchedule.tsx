import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Video, ExternalLink, User, BookOpen, Clock, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

interface TutorBooking {
  id: string;
  student_name: string | null;
  subject: string;
  lesson_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  status: string;
  google_meet_link: string | null;
}

export default function TutorSchedule() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [bookings, setBookings] = useState<TutorBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        const name = data?.display_name;
        setDisplayName(name);
        if (name) fetchBookings(name);
        else setLoading(false);
      });
  }, [user]);

  async function fetchBookings(tutorName: string) {
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("bookings")
      .select("id, student_name, subject, lesson_date, start_time, end_time, duration_minutes, status, google_meet_link")
      .eq("tutor_name", tutorName)
      .in("status", ["confirmed", "completed"])
      .gte("lesson_date", today)
      .order("lesson_date", { ascending: true })
      .order("start_time", { ascending: true });
    setBookings((data as TutorBooking[]) || []);
    setLoading(false);
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    const todayStr = new Date().toISOString().split("T")[0];
    const prefix = dateStr === todayStr ? "Today, " : "";
    return prefix + date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  };

  const formatTime = (t: string) => t.slice(0, 5);

  // Group bookings by date
  const grouped = bookings.reduce<Record<string, TutorBooking[]>>((acc, b) => {
    (acc[b.lesson_date] ||= []).push(b);
    return acc;
  }, {});

  if (!displayName && !loading) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">{t("tutorSchedule.setName")}</h1>
          <p className="text-muted-foreground">{t("tutorSchedule.setNameDesc")}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <CalendarDays className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">{t("tutorSchedule.title")}</h1>
          </div>
          <p className="text-muted-foreground mb-8">{t("tutorSchedule.subtitle")}</p>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <div className="rounded-xl border bg-card p-4">
              <p className="text-2xl font-bold text-foreground">{bookings.length}</p>
              <p className="text-xs text-muted-foreground">{t("tutorSchedule.upcomingCount")}</p>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <p className="text-2xl font-bold text-primary">{Object.keys(grouped).length}</p>
              <p className="text-xs text-muted-foreground">{t("tutorSchedule.daysScheduled")}</p>
            </div>
            <div className="rounded-xl border bg-card p-4 hidden md:block">
              <p className="text-2xl font-bold text-green-600">
                {bookings.reduce((sum, b) => sum + b.duration_minutes, 0)} min
              </p>
              <p className="text-xs text-muted-foreground">{t("tutorSchedule.totalTime")}</p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading...</div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-bold mb-1">{t("tutorSchedule.noLessons")}</p>
              <p className="text-sm text-muted-foreground">{t("tutorSchedule.noLessonsDesc")}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(grouped).map(([date, lessons]) => (
                <div key={date}>
                  <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    {formatDate(date)}
                    <Badge variant="outline" className="ml-auto text-xs">
                      {lessons.length} {lessons.length === 1 ? "lesson" : "lessons"}
                    </Badge>
                  </h2>
                  <div className="space-y-3">
                    {lessons.map(booking => (
                      <div key={booking.id} className="rounded-xl border bg-card p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm truncate">
                              {booking.student_name || t("tutorSchedule.unknownStudent")}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {booking.subject} · {booking.duration_minutes} min
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
                          <Clock className="h-4 w-4" />
                          <span className="tabular-nums">
                            {formatTime(booking.start_time)} – {formatTime(booking.end_time)}
                          </span>
                        </div>

                        {booking.google_meet_link ? (
                          <a
                            href={booking.google_meet_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors",
                              "bg-primary/10 text-primary hover:bg-primary/20"
                            )}
                          >
                            <Video className="h-3.5 w-3.5" />
                            {t("tutorSchedule.joinMeet")}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground italic shrink-0">
                            {t("tutorSchedule.noMeetLink")}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
