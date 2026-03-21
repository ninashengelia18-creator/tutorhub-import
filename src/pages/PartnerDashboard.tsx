import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Clock3, Edit, MessageSquare, Star, Users, Video } from "lucide-react";
import { motion } from "framer-motion";

import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useAppLocale } from "@/contexts/AppLocaleContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import type { PublicPartnerProfile } from "@/lib/publicPartners";
import { formatDateInTimeZone, formatLessonTimeRange, getDateKeyInTimeZone } from "@/lib/datetime";

interface PartnerBooking {
  id: string;
  student_name: string | null;
  subject: string;
  lesson_date: string;
  start_time: string;
  end_time: string;
  lesson_start_at?: string | null;
  lesson_end_at?: string | null;
  status: string;
  price_amount: number;
  currency: string;
  google_meet_link: string | null;
}

export default function PartnerDashboard() {
  const { user, profile: authProfile } = useAuth();
  const { timezone } = useAppLocale();
  const { t, lang } = useLanguage();
  const [partnerProfile, setPartnerProfile] = useState<PublicPartnerProfile | null>(null);
  const [bookings, setBookings] = useState<PartnerBooking[]>([]);
  const [loading, setLoading] = useState(true);

  const displayName = authProfile?.display_name?.trim() || user?.user_metadata?.display_name || "Partner";

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.rpc("ensure_my_partner_profile" as never);
    setPartnerProfile(data as PublicPartnerProfile | null);

    if (displayName) {
      const { data: bookingData } = await supabase
        .from("bookings")
        .select("id, student_name, subject, lesson_date, start_time, end_time, lesson_start_at, lesson_end_at, status, price_amount, currency, google_meet_link")
        .eq("tutor_name", displayName)
        .in("status", ["confirmed", "completed"])
        .order("lesson_start_at", { ascending: true });
      setBookings((bookingData as PartnerBooking[]) ?? []);
    }

    setLoading(false);
  }, [displayName]);

  useEffect(() => { void load(); }, [load]);

  const now = new Date();
  const todayKey = getDateKeyInTimeZone(now, timezone);

  const stats = useMemo(() => {
    const todaysSessions = bookings.filter(
      (b) => b.status === "confirmed" && getDateKeyInTimeZone(b.lesson_start_at, timezone) === todayKey,
    );
    const upcomingSessions = bookings.filter(
      (b) => b.status === "confirmed" && b.lesson_start_at && new Date(b.lesson_start_at) >= now,
    );
    const completedRevenue = bookings
      .filter((b) => b.status === "completed")
      .reduce((sum, b) => sum + b.price_amount, 0);

    return { todaysSessions, upcomingSessions, completedRevenue, currency: bookings[0]?.currency ?? "$" };
  }, [bookings, now, timezone, todayKey]);

  const nextSession = stats.upcomingSessions[0] ?? null;

  const formatDate = (value?: string | null) =>
    value
      ? formatDateInTimeZone(value, lang, timezone, { weekday: "short", month: "short", day: "numeric" })
      : "";

  const formatTimeRange = (b: PartnerBooking) =>
    formatLessonTimeRange(b.lesson_start_at, b.lesson_end_at, lang, timezone);

  return (
    <Layout hideFooter>
      <div className="container py-8 md:py-10">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          {/* Hero */}
          <section className="rounded-[2rem] border border-border bg-card p-6 md:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {t("partnerDashboard.portalLabel")}
                </p>
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                    {t("partnerDashboard.welcomeBack").replace("{name}", displayName)}
                  </h1>
                  <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
                    {t("partnerDashboard.heroDescription")}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button className="rounded-full px-6" asChild>
                  <Link to="/partner-schedule">{t("partnerDashboard.openSchedule")}</Link>
                </Button>
                <Button variant="outline" className="rounded-full px-6" asChild>
                  <Link to="/partner-profile-edit">
                    <Edit className="mr-2 h-4 w-4" />
                    {t("partnerDashboard.editProfile")}
                  </Link>
                </Button>
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="grid gap-4 md:grid-cols-3">
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">{t("partnerDashboard.today")}</CardTitle>
                <CalendarDays className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">{stats.todaysSessions.length}</p>
                <p className="mt-2 text-sm text-muted-foreground">{t("partnerDashboard.todayDescription")}</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">{t("partnerDashboard.upcoming")}</CardTitle>
                <Clock3 className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">{stats.upcomingSessions.length}</p>
                <p className="mt-2 text-sm text-muted-foreground">{t("partnerDashboard.upcomingDescription")}</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">{t("partnerDashboard.rating")}</CardTitle>
                <Star className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">{Number(partnerProfile?.rating ?? 5).toFixed(1)}</p>
                <p className="mt-2 text-sm text-muted-foreground">{partnerProfile?.review_count ?? 0} {t("partnerDashboard.reviews")}</p>
              </CardContent>
            </Card>
          </section>

          {/* Next session + quick actions */}
          <section className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-xl text-foreground">{t("partnerDashboard.nextSession")}</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-sm text-muted-foreground">{t("partnerDashboard.loadingSessions")}</p>
                ) : nextSession ? (
                  <div className="space-y-4 rounded-[1.5rem] border border-border bg-background p-5">
                    <div className="space-y-1">
                      <p className="text-lg font-semibold text-foreground">{nextSession.student_name || "Student"}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(nextSession.lesson_start_at)} · {formatTimeRange(nextSession)}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {nextSession.google_meet_link && (
                        <Button className="rounded-full" asChild>
                          <a href={nextSession.google_meet_link} target="_blank" rel="noopener noreferrer">
                            <Video className="mr-2 h-4 w-4" />
                            {t("partnerDashboard.joinSession")}
                          </a>
                        </Button>
                      )}
                      <Button variant="outline" className="rounded-full" asChild>
                        <Link to="/partner-schedule">{t("partnerDashboard.viewFullSchedule")}</Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 rounded-[1.5rem] border border-dashed border-border bg-background p-5">
                    <p className="text-base font-medium text-foreground">{t("partnerDashboard.noUpcomingSessions")}</p>
                    <p className="text-sm text-muted-foreground">{t("partnerDashboard.noUpcomingSessionsDescription")}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-xl text-foreground">{t("partnerDashboard.quickActions")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="h-14 w-full justify-start rounded-2xl" asChild>
                  <Link to="/partner-schedule">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {t("partnerDashboard.manageSchedule")}
                  </Link>
                </Button>
                <Button variant="outline" className="h-14 w-full justify-start rounded-2xl" asChild>
                  <Link to="/partner-messages">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    {t("partnerDashboard.viewMessages")}
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
