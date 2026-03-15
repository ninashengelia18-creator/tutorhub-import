import { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Clock, CreditCard, Shield, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const DURATIONS = [
  { label: "25 mins", value: 25 },
  { label: "50 mins", value: 50 },
];

const TIME_SLOTS: Record<string, string[]> = {
  Morning: ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"],
  Afternoon: ["12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30"],
  Evening: ["16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00"],
};

// Mock tutor data (in real app, fetch by id)
const MOCK_TUTOR = {
  name: "Nino Beridze",
  subject: "Mathematics",
  avatar: null as string | null,
  rating: 5,
  reviews: 42,
  students: 18,
  lessons: 312,
  yearsTeaching: 5,
  hourlyRate25: 20,
  hourlyRate50: 35,
};

function getWeekDates(startDate: Date): Date[] {
  const dates: Date[] = [];
  const day = startDate.getDay();
  const start = new Date(startDate);
  start.setDate(start.getDate() - day);
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dates.push(d);
  }
  return dates;
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();

  const [showBookingModal, setShowBookingModal] = useState(true);
  const [duration, setDuration] = useState(50);
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const weekStart = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + weekOffset * 7);
    return d;
  }, [weekOffset]);

  const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart]);

  const weekRangeLabel = useMemo(() => {
    const first = weekDates[0];
    const last = weekDates[6];
    const mo = first.toLocaleDateString("en-US", { month: "short" });
    return `${mo} ${first.getDate()} – ${last.getDate()}, ${first.getFullYear()}`;
  }, [weekDates]);

  const price = duration === 25 ? MOCK_TUTOR.hourlyRate25 : MOCK_TUTOR.hourlyRate50;

  const handleContinue = () => {
    if (!selectedTime) {
      toast({ title: "Please select a time slot", variant: "destructive" });
      return;
    }
    setShowBookingModal(false);
  };

  const handleBook = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!selectedTime) return;

    setSubmitting(true);
    const endMinutes = parseInt(selectedTime.split(":")[0]) * 60 + parseInt(selectedTime.split(":")[1]) + duration;
    const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`;
    const lessonDate = selectedDate.toISOString().split("T")[0];

    const { error } = await supabase.from("bookings").insert({
      student_id: user.id,
      tutor_name: MOCK_TUTOR.name,
      subject: MOCK_TUTOR.subject,
      duration_minutes: duration,
      lesson_date: lessonDate,
      start_time: selectedTime,
      end_time: endTime,
      price_amount: price,
      currency: "₾",
      is_trial: true,
      status: "confirmed",
    });

    setSubmitting(false);

    if (error) {
      toast({ title: "Booking failed", description: error.message, variant: "destructive" });
    } else {
      navigate("/booking-confirmation", {
        state: {
          tutorName: MOCK_TUTOR.name,
          subject: MOCK_TUTOR.subject,
          date: lessonDate,
          startTime: selectedTime,
          endTime: endTime,
          duration,
        },
      });
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <Layout>
      <div className="container max-w-4xl py-8">
        <Link to={`/tutor/${id}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6">
          <ChevronLeft className="h-4 w-4 mr-1" />
          {t("booking.back")}
        </Link>

        {/* Booking Modal */}
        <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-1">
                <div className="h-10 w-10 rounded-full bg-primary-light flex items-center justify-center text-primary text-sm font-bold">
                  {MOCK_TUTOR.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <DialogTitle className="text-lg">Book a trial lesson</DialogTitle>
                  <DialogDescription>To discuss your level and learning plan</DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {/* Duration picker */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {DURATIONS.map(d => (
                <button
                  key={d.value}
                  onClick={() => setDuration(d.value)}
                  className={`rounded-lg border py-2.5 text-sm font-medium transition-colors ${
                    duration === d.value ? "border-primary bg-primary/5 text-primary" : "border-border hover:bg-muted/50"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>

            {/* Weekly calendar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <button onClick={() => setWeekOffset(o => o - 1)} className="p-1 rounded-lg border hover:bg-muted/50">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm font-medium">{weekRangeLabel}</span>
                <button onClick={() => setWeekOffset(o => o + 1)} className="p-1 rounded-lg border hover:bg-muted/50">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {weekDates.map((date, i) => {
                  const dateStr = date.toISOString().split("T")[0];
                  const isSelected = selectedDate.toISOString().split("T")[0] === dateStr;
                  const isPast = dateStr < todayStr;
                  const isToday = dateStr === todayStr;
                  return (
                    <button
                      key={i}
                      disabled={isPast}
                      onClick={() => setSelectedDate(date)}
                      className="flex flex-col items-center gap-0.5"
                    >
                      <span className={`text-xs ${isToday ? "text-primary font-medium" : "text-muted-foreground"}`}>
                        {DAY_LABELS[i]}
                      </span>
                      <span
                        className={`h-9 w-9 flex items-center justify-center rounded-full text-sm font-medium transition-colors ${
                          isSelected
                            ? "border-2 border-primary text-primary"
                            : isPast
                              ? "text-muted-foreground/40"
                              : "hover:bg-muted"
                        }`}
                      >
                        {date.getDate()}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="text-xs text-muted-foreground mb-3">
              In your time zone, Asia/Tbilisi (GMT +4:00)
            </p>

            {/* Time slots */}
            <div className="space-y-3 max-h-40 overflow-y-auto">
              {Object.entries(TIME_SLOTS).map(([period, slots]) => (
                <div key={period}>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{period}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {slots.map(slot => (
                      <button
                        key={slot}
                        onClick={() => setSelectedTime(slot)}
                        className={`rounded-lg border py-2 text-sm font-medium tabular-nums transition-colors ${
                          selectedTime === slot
                            ? "border-primary bg-primary/5 text-primary"
                            : "hover:bg-muted/50"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={handleContinue}
              disabled={!selectedTime}
              className="w-full mt-4 h-11"
              variant="outline"
            >
              Continue
            </Button>
          </DialogContent>
        </Dialog>

        {/* Checkout page (shown after modal) */}
        {!showBookingModal && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left: Tutor summary */}
              <div className="space-y-6">
                <div className="rounded-xl border bg-card p-5">
                  <p className="text-sm font-semibold text-muted-foreground mb-3">Your tutor</p>
                  <div className="flex items-center gap-4 mb-4">
                    <div>
                      <h2 className="text-xl font-bold">{MOCK_TUTOR.name.split(" ")[0]}</h2>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                        <span className="font-medium">{MOCK_TUTOR.rating}</span>
                        <span className="text-muted-foreground">({MOCK_TUTOR.reviews} reviews)</span>
                      </div>
                    </div>
                    <div className="ml-auto h-14 w-14 rounded-lg bg-primary-light flex items-center justify-center text-primary font-bold">
                      {MOCK_TUTOR.name.split(" ").map(n => n[0]).join("")}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: MOCK_TUTOR.students, label: "students" },
                      { value: MOCK_TUTOR.lessons, label: "lessons" },
                      { value: MOCK_TUTOR.yearsTeaching, label: "years teaching" },
                    ].map(stat => (
                      <div key={stat.label} className="rounded-lg bg-muted/50 p-2.5 text-center">
                        <p className="text-lg font-bold">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border bg-card p-5">
                  <p className="font-semibold mb-3">Trial lesson details</p>
                  <div className="flex items-center gap-4 mb-2">
                    <div className="bg-primary/10 rounded-lg px-3 py-1.5 text-center">
                      <p className="text-xs text-primary font-medium uppercase">
                        {selectedDate.toLocaleDateString("en-US", { month: "short" })}
                      </p>
                      <p className="text-xl font-bold">{selectedDate.getDate()}</p>
                    </div>
                    <div>
                      <p className="font-semibold">
                        {selectedDate.toLocaleDateString("en-US", { weekday: "long" })}, {selectedTime} – {(() => {
                          const mins = parseInt(selectedTime!.split(":")[0]) * 60 + parseInt(selectedTime!.split(":")[1]) + duration;
                          return `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
                        })()}
                      </p>
                      <p className="text-sm text-muted-foreground">Time is based on your location</p>
                    </div>
                  </div>
                  <div className="bg-accent/40 rounded-lg px-3 py-2 mt-3">
                    <p className="text-xs text-primary">
                      Cancel or reschedule for free until 11:00 on {selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border bg-card p-5">
                  <p className="font-semibold mb-3">Checkout info</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{duration}-min lesson</span>
                      <span className="tabular-nums">₾{price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t font-semibold">
                      <span>Total</span>
                      <span className="tabular-nums">₾{price.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Payment */}
              <div>
                <div className="rounded-xl border bg-card p-5 space-y-4">
                  <p className="font-semibold">Choose how to pay</p>

                  <div className="grid grid-cols-2 gap-2">
                    <button className="rounded-lg border-2 border-foreground py-3 text-sm font-medium flex items-center justify-center gap-2">
                      <CreditCard className="h-4 w-4" /> Card
                    </button>
                    <button className="rounded-lg border py-3 text-sm font-medium flex items-center justify-center gap-2 text-muted-foreground">
                      🏦 TBC PayGe
                    </button>
                  </div>
                  <button className="w-full rounded-lg border py-3 text-sm font-medium flex items-center justify-center gap-2 text-muted-foreground">
                    🏛️ BOG Pay
                  </button>

                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="1234 1234 1234 1234"
                      className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-primary"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-primary"
                      />
                      <input
                        type="text"
                        placeholder="CVC"
                        className="rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleBook}
                    disabled={submitting}
                    className="w-full h-12 text-base font-semibold hero-gradient text-primary-foreground border-0"
                  >
                    {submitting ? "Booking..." : `Book lesson and pay · ₾${price.toFixed(2)}`}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    By pressing the button, you agree to LearnEazy's Refund and Payment Policy.
                  </p>

                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Shield className="h-3.5 w-3.5" />
                    It's safe to pay on LearnEazy. All transactions are protected by SSL encryption.
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
