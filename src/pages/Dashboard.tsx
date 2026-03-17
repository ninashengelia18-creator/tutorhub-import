import { useEffect, useMemo, useState } from "react";
import { Clock, Video, MoreHorizontal, TrendingUp, Monitor, ChevronRight, BookOpen, Search, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useAppLocale } from "@/contexts/AppLocaleContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { SubscribePlansDialog } from "@/components/SubscribePlansDialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { localizeSubjectLabel } from "@/lib/localization";
import { formatDateInTimeZone, formatLessonTimeRange } from "@/lib/datetime";

interface Booking {
  id: string;
  tutor_name: string;
  tutor_avatar_url: string | null;
  subject: string;
  duration_minutes: number;
  lesson_date: string;
  start_time: string;
  end_time: string;
  lesson_start_at?: string | null;
  lesson_end_at?: string | null;
  price_amount: number;
  currency: string;
  status: string;
  is_trial: boolean;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { timezone } = useAppLocale();
  const { t, lang } = useLanguage();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "";

  useEffect(() => {
    async function fetchBookings() {
      const { data } = await supabase
        .from("bookings")
        .select("*")
        .order("lesson_start_at", { ascending: true });
      setBookings((data as Booking[]) || []);
      setLoading(false);
    }
    void fetchBookings();
  }, []);

  const now = new Date();

  const upcomingBookings = useMemo(
    () => bookings.filter((booking) => booking.status === "confirmed" && booking.lesson_start_at && new Date(booking.lesson_start_at) >= now),
    [bookings, now],
  );
  const lastTutor = bookings.length > 0 ? bookings[bookings.length - 1] : null;

  const formatLessonDate = (value?: string | null) =>
    value
      ? formatDateInTimeZone(value, lang, timezone, {
          weekday: "short",
          month: "short",
          day: "numeric",
        })
      : "";

  const renderLessonRange = (booking: Booking) =>
    formatLessonTimeRange(booking.lesson_start_at, booking.lesson_end_at, lang, timezone);

  return (
    <Layout hideFooter>
      <div className="container py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {lastTutor && upcomingBookings.length === 0 && !loading && (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-1">
                {displayName ? t("dash.welcomeBackName").replace("{name}", displayName) : t("dash.welcomeBack")}
              </p>
              <h1 className="text-2xl md:text-3xl font-bold mb-8">
                {t("dash.readyContinue").replace("{name}", lastTutor.tutor_name.split(" ")[0])}
              </h1>

              <div className="max-w-sm mx-auto">
                <div className="h-40 w-40 rounded-lg bg-muted overflow-hidden flex items-center justify-center mx-auto mb-4">
                  {lastTutor.tutor_avatar_url ? (
                    <img src={lastTutor.tutor_avatar_url} alt={lastTutor.tutor_name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-4xl font-bold text-primary">
                      {lastTutor.tutor_name.split(" ").map((n) => n[0]).join("")}
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold mb-2">{lastTutor.tutor_name.split(" ")[0]}</h2>
                <div className="flex items-center justify-center gap-3 text-sm mb-4">
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-foreground" /> 5
                  </span>
                  <span className="text-muted-foreground">{t("dash.reviews0")}</span>
                  <span>{lastTutor.currency}{lastTutor.price_amount.toFixed(2)}</span>
                  <span className="text-muted-foreground">{t("dash.perLesson")}</span>
                </div>
                <SubscribePlansDialog
                  buttonVariant="default"
                  buttonClassName="hero-gradient border-0 px-8 text-primary-foreground"
                />
              </div>

              <div className="mt-12 text-left max-w-2xl mx-auto">
                <h3 className="font-semibold text-lg mb-4">{t("dash.continueLearning")}</h3>
                <div className="rounded-xl border bg-card p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden flex items-center justify-center shrink-0">
                      {lastTutor.tutor_avatar_url ? (
                        <img src={lastTutor.tutor_avatar_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold text-primary">
                          {lastTutor.tutor_name.split(" ").map((n) => n[0]).join("")}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{lastTutor.tutor_name} · {localizeSubjectLabel(lastTutor.subject, t)}</p>
                      <p className="text-xs text-primary">{t("dash.trialBooked")}</p>
                    </div>
                  </div>
                  <SubscribePlansDialog buttonVariant="outline" />
                </div>
              </div>
            </div>
          )}

          {bookings.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-1">
                {displayName ? t("dash.whatsNewName").replace("{name}", displayName) : t("dash.whatsNew")}
              </p>
              <h1 className="text-2xl md:text-3xl font-bold mb-8">{t("dash.findPerfect")}</h1>
              <Card className="max-w-md mx-auto">
                <CardContent className="p-8 text-center">
                  <BookOpen className="h-12 w-12 text-primary/40 mx-auto mb-4" />
                  <p className="font-semibold mb-2">{t("dash.noLessonsYet")}</p>
                  <p className="text-sm text-muted-foreground mb-4">{t("dash.bookToStart")}</p>
                  <Button className="hero-gradient text-primary-foreground border-0" asChild>
                    <Link to="/search">
                      <Search className="h-4 w-4 mr-2" />
                      {t("dash.findTutor")}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {upcomingBookings.length > 0 && (
            <div>
              <p className="text-muted-foreground mb-1">{t("dash.goodToSee").replace("{name}", displayName)}</p>
              <h1 className="text-2xl md:text-3xl font-bold mb-6">{t("dash.nextLesson")}</h1>

              <Card className="max-w-2xl">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden flex items-center justify-center">
                        {upcomingBookings[0].tutor_avatar_url ? (
                          <img src={upcomingBookings[0].tutor_avatar_url} alt={upcomingBookings[0].tutor_name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-sm font-bold text-primary">
                            {upcomingBookings[0].tutor_name.split(" ").map((n) => n[0]).join("")}
                          </span>
                        )}
                      </div>
                    </div>
                    <button className="text-muted-foreground hover:text-foreground">
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                  </div>

                  <p className="text-lg font-bold mb-1">
                    {renderLessonRange(upcomingBookings[0])}
                  </p>
                  <p className="text-sm text-muted-foreground mb-1">
                    {formatLessonDate(upcomingBookings[0].lesson_start_at)}
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {localizeSubjectLabel(upcomingBookings[0].subject, t)} {t("dash.withTutor")} {upcomingBookings[0].tutor_name}
                  </p>

                  <Button variant="outline" size="lg" asChild>
                    <Link to="/classroom">
                      <Video className="h-4 w-4 mr-2" />
                      {t("dash.joinLesson")}
                    </Link>
                  </Button>

                  <div className="mt-6 pt-4 border-t">
                    <p className="font-semibold text-sm mb-3">{t("dash.beforeLesson")}</p>
                    <div className="space-y-2">
                      <button className="w-full flex items-center gap-3 rounded-lg border p-3 text-left hover:bg-muted/50 transition-colors">
                        <TrendingUp className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm flex-1">{t("dash.shareLearning")}</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </button>
                      <button className="w-full flex items-center gap-3 rounded-lg border p-3 text-left hover:bg-muted/50 transition-colors">
                        <Monitor className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm flex-1">{t("dash.testClassroom")}</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {upcomingBookings.length > 1 && (
                <div className="mt-8">
                  <h2 className="text-xl font-bold mb-4">{t("dash.upNext")}</h2>
                  <div className="space-y-4">
                    {upcomingBookings.slice(1).map((booking) => (
                      <div key={booking.id} className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          <div className="h-2.5 w-2.5 rounded-full bg-foreground mt-1.5" />
                          <div className="w-px h-full bg-border min-h-[40px]" />
                        </div>
                        <div className="flex-1 flex items-center justify-between pb-4">
                          <div>
                            <p className="font-bold">{renderLessonRange(booking)}</p>
                            <p className="text-sm text-muted-foreground">{formatLessonDate(booking.lesson_start_at)}</p>
                            <p className="text-sm text-muted-foreground">
                              {localizeSubjectLabel(booking.subject, t)} {t("dash.withTutor")} {booking.tutor_name}
                            </p>
                          </div>
                          <button className="text-muted-foreground hover:text-foreground">
                            <MoreHorizontal className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
