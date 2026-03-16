import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, CalendarDays, Clock3, Wallet } from "lucide-react";
import { motion } from "framer-motion";

import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { getLocaleForLanguage, localizeSubjectLabel } from "@/lib/localization";

interface TutorBooking {
  id: string;
  student_name: string | null;
  subject: string;
  lesson_date: string;
  start_time: string;
  end_time: string;
  status: string;
  price_amount: number;
  currency: string;
}

export default function TutorDashboard() {
  const { user, profile } = useAuth();
  const { t, lang } = useLanguage();
  const [bookings, setBookings] = useState<TutorBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const tutorName = profile?.display_name?.trim() || user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Tutor";

  useEffect(() => {
    if (!tutorName) return;

    const loadBookings = async () => {
      const { data } = await supabase
        .from("bookings")
        .select("id, student_name, subject, lesson_date, start_time, end_time, status, price_amount, currency")
        .eq("tutor_name", tutorName)
        .in("status", ["confirmed", "completed"])
        .order("lesson_date", { ascending: true })
        .order("start_time", { ascending: true });

      setBookings((data as TutorBooking[]) ?? []);
      setLoading(false);
    };

    void loadBookings();
  }, [tutorName]);

  const today = new Date().toISOString().split("T")[0];

  const stats = useMemo(() => {
    const todaysLessons = bookings.filter((booking) => booking.lesson_date === today && booking.status === "confirmed");
    const upcomingLessons = bookings.filter((booking) => booking.lesson_date >= today && booking.status === "confirmed");
    const completedRevenue = bookings
      .filter((booking) => booking.status === "completed")
      .reduce((sum, booking) => sum + booking.price_amount, 0);

    return {
      todaysLessons,
      upcomingLessons,
      completedRevenue,
      currency: bookings[0]?.currency ?? "₾",
    };
  }, [bookings, today]);

  const nextLesson = stats.upcomingLessons[0] ?? null;

  const formatDate = (dateStr: string) =>
    new Date(`${dateStr}T00:00:00`).toLocaleDateString(getLocaleForLanguage(lang), {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

  const formatTime = (value: string) => value.slice(0, 5);

  return (
    <Layout hideFooter>
      <div className="container py-8 md:py-10">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <section className="rounded-[2rem] border border-border bg-card p-6 md:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">{t("tutorDashboard.portalLabel")}</p>
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">{t("tutorDashboard.welcomeBack").replace("{name}", tutorName)}</h1>
                  <p className="max-w-2xl text-base text-muted-foreground md:text-lg">{t("tutorDashboard.heroDescription")}</p>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button className="rounded-full px-6" asChild>
                  <Link to="/tutor-schedule">{t("tutorDashboard.openSchedule")}</Link>
                </Button>
                <Button variant="outline" className="rounded-full px-6" asChild>
                  <Link to="/lesson-planner">{t("tutorDashboard.lessonPlanner")}</Link>
                </Button>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">{t("tutorDashboard.today")}</CardTitle>
                <CalendarDays className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">{stats.todaysLessons.length}</p>
                <p className="mt-2 text-sm text-muted-foreground">{t("tutorDashboard.todayDescription")}</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">{t("tutorDashboard.upcoming")}</CardTitle>
                <Clock3 className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">{stats.upcomingLessons.length}</p>
                <p className="mt-2 text-sm text-muted-foreground">{t("tutorDashboard.upcomingDescription")}</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">{t("tutorDashboard.earned")}</CardTitle>
                <Wallet className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">{stats.currency}{stats.completedRevenue.toFixed(0)}</p>
                <p className="mt-2 text-sm text-muted-foreground">{t("tutorDashboard.earnedDescription")}</p>
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-xl text-foreground">{t("tutorDashboard.nextLesson")}</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-sm text-muted-foreground">{t("tutorDashboard.loadingLessons")}</p>
                ) : nextLesson ? (
                  <div className="space-y-4 rounded-[1.5rem] border border-border bg-background p-5">
                    <div className="space-y-1">
                      <p className="text-lg font-semibold text-foreground">{nextLesson.student_name || t("tutorSchedule.unknownStudent")} · {localizeSubjectLabel(nextLesson.subject, t)}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(nextLesson.lesson_date)} · {formatTime(nextLesson.start_time)}–{formatTime(nextLesson.end_time)}</p>
                    </div>
                    <Button variant="outline" className="rounded-full" asChild>
                      <Link to="/tutor-schedule">{t("tutorDashboard.viewFullSchedule")}</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 rounded-[1.5rem] border border-dashed border-border bg-background p-5">
                    <p className="text-base font-medium text-foreground">{t("tutorDashboard.noUpcomingLessons")}</p>
                    <p className="text-sm text-muted-foreground">{t("tutorDashboard.noUpcomingLessonsDescription")}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-xl text-foreground">{t("tutorDashboard.quickActions")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="h-14 w-full justify-start rounded-2xl" asChild>
                  <Link to="/tutor-schedule">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {t("tutorDashboard.manageSchedule")}
                  </Link>
                </Button>
                <Button variant="outline" className="h-14 w-full justify-start rounded-2xl" asChild>
                  <Link to="/lesson-planner">
                    <BookOpen className="mr-2 h-4 w-4" />
                    {t("tutorDashboard.buildLessonPlans")}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </section>
        </motion.div>
      </div>
    </Layout>
  );
}
