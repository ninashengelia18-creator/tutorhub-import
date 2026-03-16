import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { CalendarDays, Video, ExternalLink, User, BookOpen, Clock, Wallet } from "lucide-react";
import { getLocaleForLanguage, localizeSubjectLabel } from "@/lib/localization";
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
  price_amount: number;
  currency: string;
}

export default function TutorSchedule() {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const [bookings, setBookings] = useState<TutorBooking[]>([]);
  const [allBookings, setAllBookings] = useState<TutorBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    if (!user) return;

    const fetchBookings = async () => {
      setLoading(true);

      const today = new Date().toISOString().split("T")[0];
      const selectFields = "id, student_name, subject, lesson_date, start_time, end_time, duration_minutes, status, google_meet_link, price_amount, currency";

      const [upcomingRes, allRes] = await Promise.all([
        supabase
          .from("bookings")
          .select(selectFields)
          .in("status", ["confirmed", "completed"])
          .gte("lesson_date", today)
          .order("lesson_date", { ascending: true })
          .order("start_time", { ascending: true }),
        supabase
          .from("bookings")
          .select(selectFields)
          .in("status", ["confirmed", "completed"])
          .order("lesson_date", { ascending: false })
          .order("start_time", { ascending: false }),
      ]);

      setBookings((upcomingRes.data as TutorBooking[]) ?? []);
      setAllBookings((allRes.data as TutorBooking[]) ?? []);
      setLoading(false);
    };

    void fetchBookings();
  }, [user]);

  const selectedDateKey = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, [selectedDate]);

  const formatDate = (dateStr: string) => {
    const date = new Date(`${dateStr}T00:00:00`);
    const todayStr = new Date().toISOString().split("T")[0];
    const prefix = dateStr === todayStr ? `${t("tutorSchedule.todayPrefix")} ` : "";
    return prefix + date.toLocaleDateString(getLocaleForLanguage(lang), { weekday: "short", month: "short", day: "numeric" });
  };

  const formatTime = (timeValue: string) => timeValue.slice(0, 5);

  const grouped = bookings.reduce<Record<string, TutorBooking[]>>((acc, booking) => {
    (acc[booking.lesson_date] ||= []).push(booking);
    return acc;
  }, {});

  const calendarDates = useMemo(
    () => Object.keys(grouped).map((date) => new Date(`${date}T00:00:00`)),
    [grouped],
  );

  const selectedDayLessons = grouped[selectedDateKey] ?? [];

  return (
    <Layout hideFooter>
      <div className="container py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-2 flex items-center gap-3">
            <CalendarDays className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">{t("tutorSchedule.title")}</h1>
          </div>
          <p className="mb-8 text-muted-foreground">{t("tutorSchedule.subtitle")}</p>

          {loading ? (
            <div className="py-12 text-center text-muted-foreground">{t("tutorSchedule.loading")}</div>
          ) : (
            <>
              <div className="mb-8 rounded-[1.75rem] border border-border bg-card p-4 shadow-sm">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t("tutorSchedule.calendarTitle")}</p>
                    <p className="text-xs text-muted-foreground">{t("tutorSchedule.calendarHint")}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {calendarDates.length}
                  </Badge>
                </div>

                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  month={selectedDate}
                  onMonthChange={setSelectedDate}
                  modifiers={{ booked: calendarDates }}
                  modifiersClassNames={{ booked: "bg-accent text-accent-foreground rounded-md font-semibold" }}
                  className="w-full rounded-2xl border border-border bg-background"
                  classNames={{
                    months: "w-full",
                    month: "w-full space-y-4",
                    table: "w-full border-collapse",
                    head_row: "grid grid-cols-7",
                    row: "mt-2 grid grid-cols-7",
                    head_cell: "w-full text-center text-muted-foreground",
                    cell: "h-10 w-full p-0 text-center",
                    day: "h-10 w-10 p-0 font-normal",
                  }}
                />
              </div>

              <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="rounded-xl border bg-card p-4">
                  <p className="text-2xl font-bold text-foreground">{bookings.length}</p>
                  <p className="text-xs text-muted-foreground">{t("tutorSchedule.upcomingCount")}</p>
                </div>
                <div className="rounded-xl border bg-card p-4">
                  <p className="text-2xl font-bold text-primary">{Object.keys(grouped).length}</p>
                  <p className="text-xs text-muted-foreground">{t("tutorSchedule.daysScheduled")}</p>
                </div>
                <div className="rounded-xl border bg-card p-4">
                  <div className="flex items-center gap-1.5">
                    <Wallet className="h-5 w-5 text-primary" />
                    <p className="text-2xl font-bold text-foreground">
                      ₾{allBookings.filter((booking) => booking.status === "completed").reduce((sum, booking) => sum + booking.price_amount, 0).toFixed(0)}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">{t("tutorSchedule.earnedTotal")}</p>
                </div>
                <div className="rounded-xl border bg-card p-4">
                  <p className="text-2xl font-bold text-foreground">
                    ₾{bookings.reduce((sum, booking) => sum + booking.price_amount, 0).toFixed(0)}
                  </p>
                  <p className="text-xs text-muted-foreground">{t("tutorSchedule.upcomingRevenue")}</p>
                </div>
              </div>

              {bookings.length === 0 ? (
                <div className="py-16 text-center">
                  <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="mb-1 text-lg font-bold">{t("tutorSchedule.noLessons")}</p>
                  <p className="text-sm text-muted-foreground">{t("tutorSchedule.noLessonsDesc")}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-primary" />
                      <h2 className="text-sm font-semibold text-foreground">{formatDate(selectedDateKey)}</h2>
                      <Badge variant="outline" className="ml-auto text-xs">
                        {selectedDayLessons.length} {selectedDayLessons.length === 1 ? t("tutorSchedule.lessonSingle") : t("tutorSchedule.lessonPlural")}
                      </Badge>
                    </div>

                    {selectedDayLessons.length === 0 ? (
                      <div className="rounded-[1.5rem] border border-dashed border-border bg-card p-8 text-center">
                        <BookOpen className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
                        <p className="mb-1 text-base font-semibold text-foreground">{t("tutorSchedule.noLessonsOnDay")}</p>
                        <p className="text-sm text-muted-foreground">{t("tutorSchedule.noLessonsOnDayDesc")}</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {selectedDayLessons.map((booking) => (
                          <div key={booking.id} className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:flex-row sm:items-center">
                            <div className="flex min-w-0 flex-1 items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                                <User className="h-5 w-5 text-primary" />
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold">
                                  {booking.student_name || t("tutorSchedule.unknownStudent")}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {localizeSubjectLabel(booking.subject, t)} · {booking.duration_minutes} {t("tutorSchedule.minutes")} · <span className="font-medium text-foreground">{booking.currency}{booking.price_amount.toFixed(2)}</span>
                                </p>
                              </div>
                            </div>

                            <div className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground">
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
                                className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20")}
                              >
                                <Video className="h-3.5 w-3.5" />
                                {t("tutorSchedule.joinMeet")}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            ) : (
                              <span className="shrink-0 text-xs italic text-muted-foreground">
                                {t("tutorSchedule.noMeetLink")}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-2">
                    <p className="mb-3 text-sm font-semibold text-muted-foreground">{t("tutorSchedule.allUpcomingTitle")}</p>
                    <div className="space-y-6">
                      {Object.entries(grouped).map(([date, lessons]) => (
                        <div key={date}>
                          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                            <CalendarDays className="h-4 w-4" />
                            {formatDate(date)}
                            <Badge variant="outline" className="ml-auto text-xs">
                              {lessons.length} {lessons.length === 1 ? t("tutorSchedule.lessonSingle") : t("tutorSchedule.lessonPlural")}
                            </Badge>
                          </h3>
                          <div className="space-y-3">
                            {lessons.map((booking) => (
                              <div key={booking.id} className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:flex-row sm:items-center">
                                <div className="flex min-w-0 flex-1 items-center gap-3">
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                                    <User className="h-5 w-5 text-primary" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold">
                                      {booking.student_name || t("tutorSchedule.unknownStudent")}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {localizeSubjectLabel(booking.subject, t)} · {booking.duration_minutes} {t("tutorSchedule.minutes")} · <span className="font-medium text-foreground">{booking.currency}{booking.price_amount.toFixed(2)}</span>
                                    </p>
                                  </div>
                                </div>

                                <div className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground">
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
                                    className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20")}
                                  >
                                    <Video className="h-3.5 w-3.5" />
                                    {t("tutorSchedule.joinMeet")}
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                ) : (
                                  <span className="shrink-0 text-xs italic text-muted-foreground">
                                    {t("tutorSchedule.noMeetLink")}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
