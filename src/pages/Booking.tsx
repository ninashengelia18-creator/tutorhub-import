import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Shield, Calendar as CalendarIcon, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAppLocale } from "@/contexts/AppLocaleContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  formatDateInTimeZone,
  formatTimeInTimeZone,
  getDateFromKey,
  getDateKeyInTimeZone,
  getDurationMinutes,
  getTimeZoneDisplayLabel,
  getTimeZoneInlineLabel,
} from "@/lib/datetime";
import { formatLocalizedDate, localizeSubjectLabel } from "@/lib/localization";

const FORMSPREE_URL = "https://formspree.io/f/mojknpqp";

const tutorData: Record<string, { name: string; subject: string; price: number }> = {
  "1": { name: "Nino B.", subject: "Mathematics", price: 25 },
  "2": { name: "Giorgi K.", subject: "Physics", price: 30 },
  "3": { name: "Ana M.", subject: "English", price: 20 },
  "4": { name: "Luka T.", subject: "Programming", price: 35 },
};

const slotCopy = {
  en: {
    yourTime: "your time",
    tutorTime: "tutor's time",
    showingIn: "Showing available slots in",
    noSlots: "No available slots yet for this tutor.",
    noSlotsForDate: "No available slots on this date.",
    chooseSlot: "Choose a time slot",
    availability: "Available slots",
  },
  ka: {
    yourTime: "თქვენი დრო",
    tutorTime: "რეპეტიტორის დრო",
    showingIn: "ხელმისაწვდომი დრო ნაჩვენებია",
    noSlots: "ამ რეპეტიტორს ჯერ თავისუფალი დრო არ დაუმატებია.",
    noSlotsForDate: "ამ თარიღზე თავისუფალი დრო არ არის.",
    chooseSlot: "აირჩიეთ დრო",
    availability: "თავისუფალი დროები",
  },
  ru: {
    yourTime: "ваше время",
    tutorTime: "время репетитора",
    showingIn: "Свободные слоты показаны в часовом поясе",
    noSlots: "У этого репетитора пока нет доступных слотов.",
    noSlotsForDate: "На эту дату свободных слотов нет.",
    chooseSlot: "Выберите слот",
    availability: "Доступные слоты",
  },
} as const;

interface AvailabilitySlot {
  id: string;
  tutor_name: string;
  slot_start_at: string;
  slot_end_at: string;
  tutor_timezone: string;
  availability_status: "open" | "booked";
}

interface BookingRecord {
  id: string;
  lesson_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  lesson_start_at: string | null;
  lesson_end_at: string | null;
}

export default function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const { timezone } = useAppLocale();
  const { user } = useAuth();
  const { toast } = useToast();

  const tutor = tutorData[id || "1"] || tutorData["1"];
  const localizedTutorSubject = localizeSubjectLabel(tutor.subject, t);
  const copy = slotCopy[lang];

  const [subject, setSubject] = useState(localizedTutorSubject);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [message, setMessage] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState(user?.email || "");
  const [submitting, setSubmitting] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);

  useEffect(() => {
    setStudentEmail(user?.email || "");
  }, [user?.email]);

  useEffect(() => {
    const loadAvailability = async () => {
      setLoadingSlots(true);

      const { data, error } = await supabase
        .from("tutor_availability_slots" as never)
        .select("id, tutor_name, slot_start_at, slot_end_at, tutor_timezone, availability_status")
        .eq("tutor_name", tutor.name)
        .eq("availability_status", "open")
        .gte("slot_start_at", new Date().toISOString())
        .order("slot_start_at", { ascending: true });

      if (error) {
        toast({ title: t("booking.failed"), description: error.message, variant: "destructive" });
        setAvailabilitySlots([]);
        setLoadingSlots(false);
        return;
      }

      setAvailabilitySlots(((data as AvailabilitySlot[] | null) ?? []).filter((slot) => new Date(slot.slot_end_at) > new Date()));
      setLoadingSlots(false);
    };

    void loadAvailability();
  }, [toast, tutor.name, t]);

  const availableDateKeys = useMemo(() => {
    return Array.from(new Set(availabilitySlots.map((slot) => getDateKeyInTimeZone(slot.slot_start_at, timezone)).filter(Boolean)));
  }, [availabilitySlots, timezone]);

  useEffect(() => {
    if (availableDateKeys.length === 0) {
      setDate(undefined);
      setSelectedSlotId("");
      return;
    }

    const selectedDateKey = date ? getDateKeyInTimeZone(date, timezone) : "";
    if (!selectedDateKey || !availableDateKeys.includes(selectedDateKey)) {
      setDate(getDateFromKey(availableDateKeys[0]));
    }
  }, [availableDateKeys, date, timezone]);

  const selectedDateKey = date ? getDateKeyInTimeZone(date, timezone) : "";

  const visibleSlots = useMemo(
    () => availabilitySlots.filter((slot) => getDateKeyInTimeZone(slot.slot_start_at, timezone) === selectedDateKey),
    [availabilitySlots, selectedDateKey, timezone],
  );

  useEffect(() => {
    if (visibleSlots.length === 0) {
      setSelectedSlotId("");
      return;
    }

    if (!visibleSlots.some((slot) => slot.id === selectedSlotId)) {
      setSelectedSlotId(visibleSlots[0].id);
    }
  }, [selectedSlotId, visibleSlots]);

  const selectedSlot = visibleSlots.find((slot) => slot.id === selectedSlotId) ?? null;
  const duration = selectedSlot ? getDurationMinutes(selectedSlot.slot_start_at, selectedSlot.slot_end_at) : 0;
  const price = selectedSlot ? (tutor.price / 60) * duration : 0;
  const studentTimezoneLabel = getTimeZoneDisplayLabel(timezone, selectedSlot?.slot_start_at);
  const tutorTimezoneLabel = selectedSlot
    ? getTimeZoneInlineLabel(selectedSlot.tutor_timezone, selectedSlot.slot_start_at)
    : null;

  const handleSubmit = async () => {
    if (!user) {
      navigate(`/login?redirect=/booking/${id}`);
      return;
    }

    if (!selectedSlot || !studentName.trim() || !studentEmail.trim()) {
      toast({ title: t("booking.failed"), description: t("booking.fillRequired"), variant: "destructive" });
      return;
    }

    setSubmitting(true);

    try {
      const { data, error } = await supabase.rpc("book_tutor_availability_slot" as never, {
        _slot_id: selectedSlot.id,
        _subject: subject,
        _student_name: studentName.trim(),
        _student_email: studentEmail.trim(),
        _student_message: message.trim(),
        _scheduled_timezone: timezone,
        _price_amount: price,
        _currency: "₾",
      } as never);

      if (error) throw error;

      const booking = data as BookingRecord;

      await fetch(FORMSPREE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: studentName.trim(),
          studentEmail: studentEmail.trim(),
          tutorName: tutor.name,
          subject,
          lessonDate: booking.lesson_date,
          startTime: formatTimeInTimeZone(selectedSlot.slot_start_at, lang, timezone),
          endTime: formatTimeInTimeZone(selectedSlot.slot_end_at, lang, timezone),
          tutorTime: formatTimeInTimeZone(selectedSlot.slot_start_at, lang, selectedSlot.tutor_timezone),
          duration: `${duration} min`,
          price: `₾${price.toFixed(2)}`,
          message: message.trim(),
          language: lang,
          _subject: `New Booking Request: ${subject} with ${tutor.name}`,
        }),
      });

      if (typeof window !== "undefined" && (window as any).Tawk_API) {
        (window as any).Tawk_API.maximize();
      }

      navigate("/booking-confirmation", {
        state: {
          tutorName: tutor.name,
          subject,
          date: booking.lesson_date,
          startTime: booking.start_time,
          endTime: booking.end_time,
          duration,
          lessonStartAt: booking.lesson_start_at ?? selectedSlot.slot_start_at,
          lessonEndAt: booking.lesson_end_at ?? selectedSlot.slot_end_at,
          studentTimezone: timezone,
          tutorTimezone: selectedSlot.tutor_timezone,
        },
      });
    } catch (err: any) {
      toast({ title: t("booking.failed"), description: err?.message || "Something went wrong", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container max-w-2xl py-8">
        <Link to={`/tutor/${id}`} className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-primary">
          <ChevronLeft className="mr-1 h-4 w-4" />
          {t("booking.back")}
        </Link>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="mb-2 text-2xl font-bold">{t("booking.title")}</h1>
          <p className="mb-2 text-muted-foreground">
            {t("booking.bookingWith")} {tutor.name}
          </p>
          <p className="mb-6 text-sm text-muted-foreground">
            {copy.showingIn} <span className="font-medium text-foreground">{studentTimezoneLabel}</span>
          </p>

          {!user && (
            <div className="mb-6 flex flex-col gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 sm:flex-row sm:items-center">
              <LogIn className="h-5 w-5 shrink-0 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">{t("booking.loginRequired")}</p>
                <p className="text-xs text-muted-foreground">{t("booking.loginRequiredDesc")}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" asChild>
                  <Link to={`/signup/student?redirect=/booking/${id}`}>{t("auth.signup")}</Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link to={`/login?redirect=/booking/${id}`}>{t("auth.login")}</Link>
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-5 rounded-xl border bg-card p-6">
            <div>
              <label className="mb-1.5 block text-sm font-medium">{t("booking.subject")}</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">{t("booking.date")}</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                    disabled={availableDateKeys.length === 0}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? formatLocalizedDate(date, lang) : t("booking.selectDate")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(currentDate) => {
                      const dateKey = getDateKeyInTimeZone(currentDate, timezone);
                      const todayKey = getDateKeyInTimeZone(new Date(), timezone);
                      return !availableDateKeys.includes(dateKey) || (todayKey ? dateKey < todayKey : false);
                    }}
                    initialFocus
                    className={cn("pointer-events-auto p-3")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">{copy.availability}</label>
              <div className="rounded-xl border bg-background p-3">
                {loadingSlots ? (
                  <p className="text-sm text-muted-foreground">{t("tutorSchedule.loading")}</p>
                ) : availableDateKeys.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{copy.noSlots}</p>
                ) : visibleSlots.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{copy.noSlotsForDate}</p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{copy.chooseSlot}</p>
                    {visibleSlots.map((slot) => {
                      const isSelected = slot.id === selectedSlotId;

                      return (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => setSelectedSlotId(slot.id)}
                          className={cn(
                            "w-full rounded-xl border px-4 py-3 text-left transition-colors",
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "border-border bg-card hover:border-primary/40 hover:bg-muted/40",
                          )}
                        >
                          <p className="text-sm font-semibold text-foreground">
                            {formatTimeInTimeZone(slot.slot_start_at, lang, timezone)} ({copy.yourTime})
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {formatTimeInTimeZone(slot.slot_start_at, lang, slot.tutor_timezone)} ({copy.tutorTime} {getTimeZoneInlineLabel(slot.tutor_timezone, slot.slot_start_at)})
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">{t("booking.studentName")}</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder={t("booking.studentNamePlaceholder")}
                  className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">{t("booking.studentEmail")}</label>
                <input
                  type="email"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  placeholder={t("booking.studentEmailPlaceholder")}
                  className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">{t("booking.messageToTutor")}</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t("booking.notesPlaceholder")}
                rows={3}
                className="w-full resize-none rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>

            <div className="rounded-lg bg-muted/50 p-4">
              {selectedSlot ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">{formatDateInTimeZone(selectedSlot.slot_start_at, lang, timezone, { weekday: "long", month: "long", day: "numeric" })}</span>
                    <span className="font-medium text-foreground">{duration} min</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">{formatTimeInTimeZone(selectedSlot.slot_start_at, lang, timezone)} ({copy.yourTime})</span>
                    <span className="font-semibold tabular-nums">₾{price.toFixed(2)}</span>
                  </div>
                  {tutorTimezoneLabel ? (
                    <p className="text-xs text-muted-foreground">
                      {formatTimeInTimeZone(selectedSlot.slot_start_at, lang, selectedSlot.tutor_timezone)} ({copy.tutorTime} {tutorTimezoneLabel})
                    </p>
                  ) : null}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{copy.noSlotsForDate}</p>
              )}
            </div>

            <Button
              onClick={handleSubmit}
              disabled={submitting || loadingSlots || !selectedSlot}
              className="hero-gradient h-12 w-full border-0 text-base font-semibold text-primary-foreground"
            >
              {!user ? t("booking.signupToBook") : submitting ? t("booking.submitting") : t("booking.submitRequest")}
            </Button>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-3.5 w-3.5" />
              {t("booking.sslSecure")}
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
