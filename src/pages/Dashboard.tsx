import { useState, useEffect } from "react";
import { Clock, Video, MoreHorizontal, TrendingUp, Monitor, ChevronRight, BookOpen, Search, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { localizeSubjectLabel } from "@/lib/localization";

interface Booking {
  id: string;
  tutor_name: string;
  tutor_avatar_url: string | null;
  subject: string;
  duration_minutes: number;
  lesson_date: string;
  start_time: string;
  end_time: string;
  price_amount: number;
  currency: string;
  status: string;
  is_trial: boolean;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "";

  useEffect(() => {
    async function fetchBookings() {
      const { data } = await supabase
        .from("bookings")
        .select("*")
        .order("lesson_date", { ascending: true });
      setBookings(data || []);
      setLoading(false);
    }
    fetchBookings();
  }, []);

  const today = new Date().toISOString().split("T")[0];
  const upcomingBookings = bookings.filter(b => b.lesson_date >= today && b.status === "confirmed");
  const lastTutor = bookings.length > 0 ? bookings[bookings.length - 1] : null;

  const formatTime = (time: string) => time.slice(0, 5);

  return (
    <Layout>
      {/* Sub-navigation */}
      <div className="border-b bg-card">
        <div className="container flex items-center gap-8 overflow-x-auto">
          <Link to="/dashboard" className="py-3 text-sm font-medium border-b-2 border-primary text-primary">
            {t("msg.home")}
          </Link>
          <Link to="/messages" className="py-3 text-sm font-medium text-muted-foreground hover:text-foreground border-b-2 border-transparent">
            {t("msg.messages")}
          </Link>
          <Link to="/my-lessons" className="py-3 text-sm font-medium text-muted-foreground hover:text-foreground border-b-2 border-transparent">
            {t("msg.myLessons")}
          </Link>
          <Link to="/for-business" className="py-3 text-sm font-medium text-muted-foreground hover:text-foreground border-b-2 border-transparent">
            {t("msg.forBusiness")}
          </Link>
        </div>
      </div>

      <div className="container py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {/* Returning user with tutor */}
          {lastTutor && upcomingBookings.length === 0 && !loading && (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-1">
                {displayName ? t("dash.welcomeBackName").replace("{name}", displayName) : t("dash.welcomeBack")}
              </p>
              <h1 className="text-2xl md:text-3xl font-bold mb-8">
                {t("dash.readyContinue").replace("{name}", lastTutor.tutor_name.split(" ")[0])}
              </h1>

              {/* Tutor card */}
              <div className="max-w-sm mx-auto">
                <div className="h-40 w-40 rounded-lg bg-muted overflow-hidden flex items-center justify-center mx-auto mb-4">
                  {lastTutor.tutor_avatar_url ? (
                    <img src={lastTutor.tutor_avatar_url} alt={lastTutor.tutor_name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-4xl font-bold text-primary">
                      {lastTutor.tutor_name.split(" ").map(n => n[0]).join("")}
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
                <Button className="hero-gradient text-primary-foreground border-0 px-8" asChild>
                  <Link to="/search">{t("dash.subscribeContinue")}</Link>
                </Button>
              </div>

              {/* Continue learning */}
              <div className="mt-12 text-left max-w-2xl mx-auto">
                <h3 className="font-semibold text-lg mb-4">{t("dash.continueLearning")}</h3>
                <div className="rounded-xl border bg-card p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden flex items-center justify-center shrink-0">
                      {lastTutor.tutor_avatar_url ? (
                        <img src={lastTutor.tutor_avatar_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold text-primary">
                          {lastTutor.tutor_name.split(" ").map(n => n[0]).join("")}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{lastTutor.tutor_name} · {localizeSubjectLabel(lastTutor.subject, t)}</p>
                      <p className="text-xs text-primary">{t("dash.trialBooked")}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">{t("dash.subscribe")}</Button>
                </div>
              </div>
            </div>
          )}

          {/* New user with no bookings */}
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

          {/* Has upcoming lessons */}
          {upcomingBookings.length > 0 && (
            <div>
              <p className="text-muted-foreground mb-1">{t("dash.goodToSee").replace("{name}", displayName)}</p>
              <h1 className="text-2xl md:text-3xl font-bold mb-6">{t("dash.nextLesson")}</h1>

              {/* Next lesson card */}
              <Card className="max-w-2xl">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden flex items-center justify-center">
                        {upcomingBookings[0].tutor_avatar_url ? (
                          <img src={upcomingBookings[0].tutor_avatar_url} alt={upcomingBookings[0].tutor_name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-sm font-bold text-primary">
                            {upcomingBookings[0].tutor_name.split(" ").map(n => n[0]).join("")}
                          </span>
                        )}
                      </div>
                    </div>
                    <button className="text-muted-foreground hover:text-foreground">
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                  </div>

                  <p className="text-lg font-bold mb-1">
                    {formatTime(upcomingBookings[0].start_time)} – {formatTime(upcomingBookings[0].end_time)}
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

                  {/* Before your lesson section */}
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

              {/* Up next timeline */}
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
                            <p className="font-bold">
                              {formatTime(booking.start_time)} – {formatTime(booking.end_time)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {booking.subject} {t("dash.withTutor")} {booking.tutor_name}
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
