import { useCallback, useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useAppLocale } from "@/contexts/AppLocaleContext";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { CalendarDays, Video, ExternalLink, User, BookOpen, Clock, Wallet, Plus, Calendar as CalendarIcon, CheckCircle2, Trash2, Repeat } from "lucide-react";
import {
  convertLocalDateTimeToUtc,
  formatDateInTimeZone,
  formatLessonTimeRange,
  formatWallClockTime,
  getDateFromKey,
  getDateKeyInTimeZone,
  getTimeZoneSettingLabel,
} from "@/lib/datetime";
import { localizeSubjectLabel } from "@/lib/localization";
import { cn } from "@/lib/utils";

interface TutorBooking {
  id: string;
  student_name: string | null;
  subject: string;
  lesson_date: string;
  start_time: string;
  end_time: string;
  lesson_start_at?: string | null;
  lesson_end_at?: string | null;
  duration_minutes: number;
  status: string;
  google_meet_link: string | null;
  price_amount: number;
  currency: string;
}

interface AvailabilitySlot {
  id: string;
  slot_start_at: string;
  slot_end_at: string;
  tutor_timezone: string;
  availability_status: "open" | "booked";
}

const TIME_OPTIONS = Array.from({ length: 36 }, (_, index) => {
  const totalMinutes = 6 * 60 + index * 30;
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const minutes = String(totalMinutes % 60).padStart(2, "0");
  return `${hours}:${minutes}`;
});

function getLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function TutorSchedule() {
  const { user, profile } = useAuth();
  const { timezone } = useAppLocale();
  const { t, lang } = useLanguage();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<TutorBooking[]>([]);
  const [allBookings, setAllBookings] = useState<TutorBooking[]>([]);
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSlot, setSavingSlot] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [availabilityDate, setAvailabilityDate] = useState<Date | undefined>(new Date());
  const [slotStartTime, setSlotStartTime] = useState("09:00");
  const [slotDuration, setSlotDuration] = useState<25 | 50 | 720>(50);
  const isAllDay = slotDuration === 720;
  const [completingBooking, setCompletingBooking] = useState<TutorBooking | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const tutorName = profile?.display_name?.trim() || user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Tutor";

  const handleMarkComplete = async () => {
    if (!completingBooking) return;
    setIsCompleting(true);
    try {
      const { error } = await supabase.rpc("tutor_complete_booking", {
        _booking_id: completingBooking.id,
      });
      if (error) throw error;
      toast({ title: t("tutorSchedule.lessonCompleted"), description: t("tutorSchedule.lessonCompletedDesc") });
      void loadScheduleData();
    } catch (err: unknown) {
      toast({ title: t("tutorSchedule.error"), description: (err as Error).message, variant: "destructive" });
    } finally {
      setIsCompleting(false);
      setCompletingBooking(null);
    }
  };

  const loadScheduleData = useCallback(async () => {
    if (!user) return;

    setLoading(true);

    const selectFields = "id, student_name, subject, lesson_date, start_time, end_time, lesson_start_at, lesson_end_at, duration_minutes, status, google_meet_link, price_amount, currency";

    const [upcomingRes, allRes, slotsRes] = await Promise.all([
      supabase
        .from("bookings")
        .select(selectFields)
        .in("status", ["confirmed", "completed"])
        .order("lesson_start_at", { ascending: true }),
      supabase
        .from("bookings")
        .select(selectFields)
        .in("status", ["confirmed", "completed"])
        .order("lesson_start_at", { ascending: false }),
      supabase
        .from("tutor_availability_slots" as never)
        .select("id, slot_start_at, slot_end_at, tutor_timezone, availability_status")
        .eq("tutor_name", tutorName)
        .gte("slot_end_at", new Date().toISOString())
        .order("slot_start_at", { ascending: true }),
    ]);

    setBookings((upcomingRes.data as TutorBooking[]) ?? []);
    setAllBookings((allRes.data as TutorBooking[]) ?? []);
    setAvailabilitySlots((slotsRes.data as AvailabilitySlot[] | null) ?? []);
    setLoading(false);
  }, [tutorName, user]);

  useEffect(() => {
    void loadScheduleData();
  }, [loadScheduleData]);

  const now = new Date();
  const todayKey = getDateKeyInTimeZone(now, timezone);
  const selectedDateKey = useMemo(() => getLocalDateKey(selectedDate), [selectedDate]);
  const upcomingBookings = useMemo(
    () => bookings.filter((booking) => booking.lesson_start_at && new Date(booking.lesson_start_at) >= now),
    [bookings, now],
  );

  const grouped = upcomingBookings.reduce<Record<string, TutorBooking[]>>((acc, booking) => {
    const key = getDateKeyInTimeZone(booking.lesson_start_at, timezone);
    if (!key) return acc;
    (acc[key] ||= []).push(booking);
    return acc;
  }, {});

  const selectedDayLessons = grouped[selectedDateKey] ?? [];
  const upcomingAvailability = useMemo(
    () => availabilitySlots.filter((slot) => new Date(slot.slot_end_at) > now),
    [availabilitySlots, now],
  );

  // Merge booking dates + availability slot dates for calendar
  const availabilityDateKeys = useMemo(
    () => upcomingAvailability.map((slot) => getDateKeyInTimeZone(slot.slot_start_at, timezone)).filter(Boolean) as string[],
    [upcomingAvailability, timezone],
  );

  const calendarDates = useMemo(
    () => {
      const allKeys = new Set([...Object.keys(grouped), ...availabilityDateKeys]);
      return Array.from(allKeys).map((date) => getDateFromKey(date));
    },
    [grouped, availabilityDateKeys],
  );

  const availabilityCalendarDates = useMemo(
    () => availabilityDateKeys.map((k) => getDateFromKey(k)),
    [availabilityDateKeys],
  );

  const stats = useMemo(() => {
    const todaysLessons = upcomingBookings.filter((booking) => getDateKeyInTimeZone(booking.lesson_start_at, timezone) === todayKey);
    const completedRevenue = allBookings
      .filter((booking) => booking.status === "completed")
      .reduce((sum, booking) => sum + booking.price_amount, 0);

    return {
      todaysLessons,
      completedRevenue,
    };
  }, [allBookings, upcomingBookings, timezone, todayKey]);

  const formatDate = (dateKey: string) => {
    const prefix = dateKey === todayKey ? `${t("tutorSchedule.todayPrefix")} ` : "";
    return prefix + formatDateInTimeZone(getDateFromKey(dateKey), lang, timezone, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatTimeRange = (booking: TutorBooking) =>
    formatLessonTimeRange(booking.lesson_start_at, booking.lesson_end_at, lang, timezone);

  const [recurringWeeks, setRecurringWeeks] = useState(1);

  const handleDeleteSlot = async (slotId: string) => {
    const { error } = await supabase.from("tutor_availability_slots" as never).delete().eq("id", slotId).eq("availability_status", "open");
    if (error) {
      toast({ title: "Unable to delete slot", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Slot removed" });
    void loadScheduleData();
  };

  const handleAddAvailabilitySlot = async () => {
    const dateKey = availabilityDate ? getDateKeyInTimeZone(availabilityDate, timezone) : "";
    let slotStartAt: Date | null;
    let slotEndAt: Date | null;

    if (isAllDay) {
      slotStartAt = dateKey ? convertLocalDateTimeToUtc(dateKey, "08:00", timezone) : null;
      slotEndAt = dateKey ? convertLocalDateTimeToUtc(dateKey, "20:00", timezone) : null;
    } else {
      slotStartAt = dateKey ? convertLocalDateTimeToUtc(dateKey, slotStartTime, timezone) : null;
      slotEndAt = slotStartAt ? new Date(slotStartAt.getTime() + slotDuration * 60 * 1000) : null;
    }

    if (!dateKey || !slotStartAt || !slotEndAt) {
      toast({ title: "Unable to save slot", description: "Choose a valid date and time.", variant: "destructive" });
      return;
    }

    setSavingSlot(true);

    // Build recurring slots
    const slots = [];
    for (let week = 0; week < recurringWeeks; week++) {
      const offset = week * 7 * 24 * 60 * 60 * 1000;
      slots.push({
        tutor_name: tutorName,
        slot_start_at: new Date(slotStartAt.getTime() + offset).toISOString(),
        slot_end_at: new Date(slotEndAt.getTime() + offset).toISOString(),
        tutor_timezone: timezone,
        availability_status: "open",
      });
    }

    const { error } = await supabase.from("tutor_availability_slots" as never).insert(slots as never);

    setSavingSlot(false);

    if (error) {
      toast({ title: "Unable to save slot", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Availability saved", description: `${slots.length} slot${slots.length > 1 ? "s" : ""} added (${getTimeZoneSettingLabel(timezone, slotStartAt)}).` });
    void loadScheduleData();
  };

  return (
    <Layout hideFooter>
      <div className="container py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-2 flex items-center gap-3">
            <CalendarDays className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">{t("tutorSchedule.title")}</h1>
          </div>
          <p className="mb-3 text-muted-foreground">{t("tutorSchedule.subtitle")}</p>
          <p className="mb-8 text-sm text-muted-foreground">Your availability is shown in <span className="font-medium text-foreground">{getTimeZoneSettingLabel(timezone)}</span> and saved in UTC automatically.</p>

          {loading ? (
            <div className="py-12 text-center text-muted-foreground">{t("tutorSchedule.loading")}</div>
          ) : (
            <>
              <div className="mb-8 rounded-[1.75rem] border border-border bg-card p-6 shadow-sm">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                    <Plus className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Add availability</p>
                    <p className="text-xs text-muted-foreground">Students will see these slots in their own timezone.</p>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[240px_repeat(3,minmax(0,160px))_auto] lg:items-end">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Date</p>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {availabilityDate ? formatDateInTimeZone(availabilityDate, lang, timezone, { month: "short", day: "numeric", year: "numeric" }) : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={availabilityDate}
                          onSelect={setAvailabilityDate}
                          disabled={(date) => getDateKeyInTimeZone(date, timezone) < todayKey}
                          initialFocus
                          className="pointer-events-auto p-3"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Start</p>
                    <select
                      value={slotStartTime}
                      onChange={(event) => setSlotStartTime(event.target.value)}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      {TIME_OPTIONS.map((time) => (
                        <option key={time} value={time}>{formatWallClockTime(time, lang)}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Duration</p>
                    <select
                      value={slotDuration}
                      onChange={(event) => setSlotDuration(Number(event.target.value) as 25 | 50)}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value={25}>25 min</option>
                      <option value={50}>50 min</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground flex items-center gap-1.5"><Repeat className="h-3.5 w-3.5" />Repeat weekly</p>
                    <select
                      value={recurringWeeks}
                      onChange={(event) => setRecurringWeeks(Number(event.target.value))}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value={1}>No repeat</option>
                      <option value={2}>2 weeks</option>
                      <option value={4}>4 weeks</option>
                      <option value={8}>8 weeks</option>
                      <option value={12}>12 weeks</option>
                    </select>
                  </div>

                  <Button type="button" onClick={handleAddAvailabilitySlot} disabled={savingSlot} className="h-10 rounded-md px-5">
                    {savingSlot ? "Saving..." : "Save slot"}
                  </Button>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground">Upcoming availability</p>
                    <Badge variant="outline" className="text-xs">{upcomingAvailability.length}</Badge>
                  </div>

                  {upcomingAvailability.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border bg-background p-5 text-sm text-muted-foreground">
                      No availability slots saved yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {upcomingAvailability.map((slot) => (
                        <div key={slot.id} className="flex flex-col gap-3 rounded-2xl border bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {formatDateInTimeZone(slot.slot_start_at, lang, timezone, { weekday: "short", month: "short", day: "numeric" })}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatLessonTimeRange(slot.slot_start_at, slot.slot_end_at, lang, timezone)} · {getTimeZoneSettingLabel(slot.tutor_timezone, slot.slot_start_at)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={slot.availability_status === "booked" ? "secondary" : "outline"}>
                              {slot.availability_status === "booked" ? "Booked" : "Open"}
                            </Badge>
                            {slot.availability_status === "open" && (
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => void handleDeleteSlot(slot.id)}
                                aria-label="Delete slot"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

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
                  <p className="text-2xl font-bold text-foreground">{stats.todaysLessons.length}</p>
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
                      ${stats.completedRevenue.toFixed(0)}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">{t("tutorSchedule.earnedTotal")}</p>
                </div>
                <div className="rounded-xl border bg-card p-4">
                  <p className="text-2xl font-bold text-foreground">
                    ${upcomingBookings.reduce((sum, booking) => sum + booking.price_amount, 0).toFixed(0)}
                  </p>
                  <p className="text-xs text-muted-foreground">{t("tutorSchedule.upcomingRevenue")}</p>
                </div>
              </div>

              {upcomingBookings.length === 0 ? (
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
                              <span className="tabular-nums">{formatTimeRange(booking)}</span>
                            </div>

                            <div className="flex shrink-0 items-center gap-2">
                              {booking.google_meet_link ? (
                                <a
                                  href={booking.google_meet_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={cn("inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20")}
                                >
                                  <Video className="h-3.5 w-3.5" />
                                  {t("tutorSchedule.joinMeet")}
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              ) : (
                                <span className="text-xs italic text-muted-foreground">
                                  {t("tutorSchedule.noMeetLink")}
                                </span>
                              )}
                              {booking.status === "confirmed" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="rounded-lg text-xs"
                                  onClick={() => setCompletingBooking(booking)}
                                >
                                  <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                                  {t("tutorSchedule.markComplete")}
                                </Button>
                              )}
                            </div>
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
                                  <span className="tabular-nums">{formatTimeRange(booking)}</span>
                                </div>

                                <div className="flex shrink-0 items-center gap-2">
                                  {booking.google_meet_link ? (
                                    <a
                                      href={booking.google_meet_link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={cn("inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20")}
                                    >
                                      <Video className="h-3.5 w-3.5" />
                                      {t("tutorSchedule.joinMeet")}
                                      <ExternalLink className="h-3 w-3" />
                                    </a>
                                  ) : (
                                    <span className="text-xs italic text-muted-foreground">
                                      {t("tutorSchedule.noMeetLink")}
                                    </span>
                                  )}
                                  {booking.status === "confirmed" && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="rounded-lg text-xs"
                                      onClick={() => setCompletingBooking(booking)}
                                    >
                                      <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                                      {t("tutorSchedule.markComplete")}
                                    </Button>
                                  )}
                                </div>
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

      <AlertDialog open={!!completingBooking} onOpenChange={(open) => !open && setCompletingBooking(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("tutorSchedule.confirmCompleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("tutorSchedule.confirmCompleteDesc")
                .replace("{student}", completingBooking?.student_name || t("tutorSchedule.unknownStudent"))
                .replace("{subject}", completingBooking ? localizeSubjectLabel(completingBooking.subject, t) : "")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCompleting}>{t("tutorSchedule.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleMarkComplete} disabled={isCompleting}>
              {isCompleting ? t("tutorSchedule.completing") : t("tutorSchedule.confirmComplete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
