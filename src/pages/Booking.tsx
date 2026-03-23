import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Calendar as CalendarIcon, ChevronLeft, LogIn, Shield } from "lucide-react";
import { motion } from "framer-motion";

import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAppLocale } from "@/contexts/AppLocaleContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  formatDateInTimeZone,
  formatTimeInTimeZone,
  getDateFromKey,
  getDateKeyInTimeZone,
  getDurationMinutes,
  getTimeZoneDisplayLabel,
  getTimeZoneInlineLabel,
} from "@/lib/datetime";
import { cn } from "@/lib/utils";
import { getTutorFullName, type PublicTutorProfile } from "@/lib/publicTutors";

const FORMSPREE_URL = "https://formspree.io/f/mojknpqp";

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
  const { timezone } = useAppLocale();
  const { user } = useAuth();
  const { toast } = useToast();

  const [tutor, setTutor] = useState<PublicTutorProfile | null>(null);
  const [loadingTutor, setLoadingTutor] = useState(true);
  const [subject, setSubject] = useState("");
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
    const loadTutor = async () => {
      if (!id) return;
      setLoadingTutor(true);

      const { data } = await supabase
        .from("public_tutor_profiles" as never)
        .select("*")
        .eq("id", id)
        .eq("is_published", true)
        .maybeSingle();

      const nextTutor = (data as PublicTutorProfile | null) ?? null;
      setTutor(nextTutor);
      setSubject(nextTutor?.primary_subject ?? "");
      setLoadingTutor(false);
    };

    void loadTutor();
  }, [id]);

  const tutorName = useMemo(() => (tutor ? getTutorFullName(tutor) : ""), [tutor]);

  useEffect(() => {
    const loadAvailability = async () => {
      if (!tutorName) {
        setAvailabilitySlots([]);
        setLoadingSlots(false);
        return;
      }

      setLoadingSlots(true);
      const { data, error } = await supabase
        .from("tutor_availability_slots" as never)
        .select("id, tutor_name, slot_start_at, slot_end_at, tutor_timezone, availability_status")
        .eq("tutor_name", tutorName)
        .eq("availability_status", "open")
        .gte("slot_start_at", new Date().toISOString())
        .order("slot_start_at", { ascending: true });

      if (error) {
        toast({ title: "Could not load availability", description: error.message, variant: "destructive" });
        setAvailabilitySlots([]);
        setLoadingSlots(false);
        return;
      }

      setAvailabilitySlots(((data as AvailabilitySlot[] | null) ?? []).filter((slot) => new Date(slot.slot_end_at) > new Date()));
      setLoadingSlots(false);
    };

    void loadAvailability();
  }, [toast, tutorName]);

  const availableDateKeys = useMemo(
    () => Array.from(new Set(availabilitySlots.map((slot) => getDateKeyInTimeZone(slot.slot_start_at, timezone)).filter(Boolean))),
    [availabilitySlots, timezone],
  );

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
  const price = selectedSlot && tutor ? (Number(tutor.hourly_rate) / 60) * duration : 0;
  const studentTimezoneLabel = getTimeZoneDisplayLabel(timezone, selectedSlot?.slot_start_at);
  const tutorTimezoneLabel = selectedSlot ? getTimeZoneInlineLabel(selectedSlot.tutor_timezone, selectedSlot.slot_start_at) : null;

  const handleSubmit = async () => {
    if (!user) {
      navigate(`/login?redirect=/booking/${id}`);
      return;
    }

    if (!tutor || !selectedSlot || !studentName.trim() || !studentEmail.trim() || !subject.trim()) {
      toast({ title: "Missing required details", description: "Please complete the booking form before continuing.", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    try {
      const { data, error } = await supabase.rpc("book_tutor_availability_slot" as never, {
        _slot_id: selectedSlot.id,
        _subject: subject.trim(),
        _student_name: studentName.trim(),
        _student_email: studentEmail.trim(),
        _student_message: message.trim(),
        _scheduled_timezone: timezone,
        _price_amount: price,
        _currency: "$",
      } as never);

      if (error) throw error;

      const booking = data as BookingRecord;

      // Fire-and-forget: send notification email
      fetch(FORMSPREE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          email: studentEmail.trim(),
          tutor_name: tutorName,
          tutor_subject: subject.trim(),
          student_name: studentName.trim(),
          student_email: studentEmail.trim(),
          lesson_date: booking.lesson_date,
          start_time: formatTimeInTimeZone(selectedSlot.slot_start_at, "en", timezone),
          end_time: formatTimeInTimeZone(selectedSlot.slot_end_at, "en", timezone),
          duration: `${duration} min`,
          hourly_rate_usd: `$${Number(tutor.hourly_rate).toFixed(0)}`,
          booking_total_usd: `$${price.toFixed(2)}`,
          message: message.trim() || "No message provided",
          _subject: `New booking request for ${tutorName}`,
        }),
      }).catch(() => {});

      // Meet link will be generated when admin confirms payment
      const lessonStart = booking.lesson_start_at ?? selectedSlot.slot_start_at;
      const lessonEnd = booking.lesson_end_at ?? selectedSlot.slot_end_at;
      const meetLink: string | null = null;

      navigate("/booking-confirmation", {
        state: {
          tutorName,
          subject: subject.trim(),
          date: booking.lesson_date,
          startTime: booking.start_time,
          endTime: booking.end_time,
          duration,
          lessonStartAt: lessonStart,
          lessonEndAt: lessonEnd,
          studentTimezone: timezone,
          tutorTimezone: selectedSlot.tutor_timezone,
          meetLink,
          priceAmount: price,
          currency: "USD",
        },
      });
    } catch (error: any) {
      toast({ title: "Booking failed", description: error?.message || "Something went wrong.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingTutor) {
    return (
      <Layout>
        <div className="container py-16 text-center text-muted-foreground">Loading tutor details...</div>
      </Layout>
    );
  }

  if (!tutor) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground">Tutor not found</h1>
          <p className="mt-2 text-muted-foreground">This tutor is not available for bookings yet.</p>
          <Button className="mt-6" asChild>
            <Link to="/search">Back to Find Tutors</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-2xl py-8">
        <Link to={`/tutor/${id}`} className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-primary">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to tutor profile
        </Link>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="mb-2 text-2xl font-bold text-foreground">Book a lesson</h1>
          <p className="mb-2 text-muted-foreground">Booking with {tutorName}</p>
          <p className="mb-6 text-sm text-muted-foreground">Available slots shown in <span className="font-medium text-foreground">{studentTimezoneLabel}</span></p>

          {!user && (
            <div className="mb-6 flex flex-col gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 sm:flex-row sm:items-center">
              <LogIn className="h-5 w-5 shrink-0 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">Please log in to book a lesson.</p>
                <p className="text-xs text-muted-foreground">You can browse tutors freely, but booking requires a student account.</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" asChild>
                  <Link to={`/signup/student?redirect=/booking/${id}`}>Sign up</Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link to={`/login?redirect=/booking/${id}`}>Log in</Link>
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-5 rounded-xl border bg-card p-6">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                    disabled={availableDateKeys.length === 0}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? formatDateInTimeZone(date.toISOString(), "en", timezone, { weekday: "long", month: "long", day: "numeric" }) : "Select a date"}
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
              <label className="mb-1.5 block text-sm font-medium text-foreground">Available slots</label>
              <div className="rounded-xl border bg-background p-3">
                {loadingSlots ? (
                  <p className="text-sm text-muted-foreground">Loading available slots...</p>
                ) : availableDateKeys.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No available slots yet for this tutor.</p>
                ) : visibleSlots.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No available slots on this date.</p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Choose a time slot</p>
                    {visibleSlots.map((slot) => {
                      const isSelected = slot.id === selectedSlotId;
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => setSelectedSlotId(slot.id)}
                          className={cn(
                            "w-full rounded-xl border px-4 py-3 text-left transition-colors",
                            isSelected ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40 hover:bg-muted/40",
                          )}
                        >
                          <p className="text-sm font-semibold text-foreground">{formatTimeInTimeZone(slot.slot_start_at, "en", timezone)}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Tutor time: {formatTimeInTimeZone(slot.slot_start_at, "en", slot.tutor_timezone)} {tutorTimezoneLabel ? `(${tutorTimezoneLabel})` : ""}
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
                <label className="mb-1.5 block text-sm font-medium text-foreground">Your name</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(event) => setStudentName(event.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Your email</label>
                <input
                  type="email"
                  value={studentEmail}
                  onChange={(event) => setStudentEmail(event.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Message to tutor</label>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={3}
                className="w-full resize-none rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                placeholder="Share your learning goals or anything the tutor should know."
              />
            </div>

            <div className="rounded-lg bg-muted/50 p-4">
              {selectedSlot ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">{formatDateInTimeZone(selectedSlot.slot_start_at, "en", timezone, { weekday: "long", month: "long", day: "numeric" })}</span>
                    <span className="font-medium text-foreground">{duration} min</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">{formatTimeInTimeZone(selectedSlot.slot_start_at, "en", timezone)}</span>
                    <span className="font-semibold text-foreground">${price.toFixed(2)}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Pick an available slot to continue.</p>
              )}
            </div>

            <Button onClick={handleSubmit} disabled={submitting || loadingSlots || !selectedSlot} className="h-12 w-full text-base font-semibold">
              {!user ? "Sign up to book" : submitting ? "Submitting..." : "Submit Booking Request"}
            </Button>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-3.5 w-3.5" />
              Secure booking request
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
