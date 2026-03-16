import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ChevronLeft, CheckCircle, Shield, Calendar as CalendarIcon, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { formatLocalizedDate, localizeSubjectLabel } from "@/lib/localization";

const FORMSPREE_URL = "https://formspree.io/f/mojknpqp";

const DURATIONS = [
  { labelKey: "booking.duration30", value: 30 },
  { labelKey: "booking.duration45", value: 45 },
  { labelKey: "booking.duration60", value: 60 },
  { labelKey: "booking.duration90", value: 90 },
];

const TIME_OPTIONS = Array.from({ length: 27 }, (_, index) => {
  const totalMinutes = 8 * 60 + index * 30;
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const minutes = String(totalMinutes % 60).padStart(2, "0");
  return `${hours}:${minutes}`;
});

const tutorData: Record<string, { name: string; subject: string; price: number }> = {
  "1": { name: "Nino B.", subject: "Mathematics", price: 25 },
  "2": { name: "Giorgi K.", subject: "Physics", price: 30 },
  "3": { name: "Ana M.", subject: "English", price: 20 },
  "4": { name: "Luka T.", subject: "Programming", price: 35 },
};

export default function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();

  const tutor = tutorData[id || "1"] || tutorData["1"];
  const localizedTutorSubject = localizeSubjectLabel(tutor.subject, t);

  const [subject, setSubject] = useState(localizedTutorSubject);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(60);
  const [message, setMessage] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState(user?.email || "");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const price = (tutor.price / 60) * duration;

  const handleSubmit = async () => {
    // If not logged in, redirect to login with return URL
    if (!user) {
      navigate(`/login?redirect=/booking/${id}`);
      return;
    }

    if (!date || !time || !studentName.trim() || !studentEmail.trim()) {
      toast({ title: t("booking.failed"), description: t("booking.fillRequired"), variant: "destructive" });
      return;
    }

    setSubmitting(true);

    const lessonDate = format(date, "yyyy-MM-dd");
    const [hours, minutes] = time.split(":").map(Number);
    const endMinutes = hours * 60 + minutes + duration;
    const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`;

    try {
      const { error } = await supabase.from("bookings").insert({
        student_id: user.id,
        tutor_name: tutor.name,
        subject,
        lesson_date: lessonDate,
        start_time: time,
        end_time: endTime,
        duration_minutes: duration,
        price_amount: price,
        status: "pending",
        student_name: studentName.trim(),
        student_email: studentEmail.trim(),
        student_message: message.trim() || null,
        notes: message.trim() || null,
      });
      if (error) throw error;

      // Send email via Formspree
      await fetch(FORMSPREE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: studentName.trim(),
          studentEmail: studentEmail.trim(),
          tutorName: tutor.name,
          subject,
          lessonDate,
          startTime: time,
          endTime,
          duration: `${duration} min`,
          price: `₾${price.toFixed(2)}`,
          message: message.trim(),
          language: lang,
          _subject: `New Booking Request: ${subject} with ${tutor.name}`,
        }),
      });

      setSubmitted(true);

      // Open Tawk.to chat automatically
      if (typeof window !== "undefined" && (window as any).Tawk_API) {
        (window as any).Tawk_API.maximize();
      }
    } catch (err: any) {
      toast({ title: t("booking.failed"), description: err?.message || "Something went wrong", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Layout>
        <div className="bg-primary/10 py-12 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{t("booking.thankYouTitle")}</h1>
          </motion.div>
        </div>
        <div className="container max-w-lg py-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="rounded-xl border bg-card p-6 mb-6">
              <p className="text-muted-foreground leading-relaxed">{t("booking.thankYouMsg")}</p>
            </div>
            <div className="flex gap-3">
              <Button asChild className="flex-1 hero-gradient text-primary-foreground border-0">
                <Link to="/">{t("booking.backHome")}</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link to="/my-lessons">{t("booking.viewLessons")}</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-2xl py-8">
        <Link to={`/tutor/${id}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6">
          <ChevronLeft className="h-4 w-4 mr-1" />
          {t("booking.back")}
        </Link>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold mb-2">{t("booking.title")}</h1>
          <p className="text-muted-foreground mb-6">
            {t("booking.bookingWith")} {tutor.name}
          </p>

          {/* Auth prompt banner for guests */}
          {!user && (
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
              <LogIn className="h-5 w-5 text-primary shrink-0" />
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

          <div className="rounded-xl border bg-card p-6 space-y-5">
            {/* Subject */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">{t("booking.subject")}</label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>

            {/* Date */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">{t("booking.date")}</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
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
                    disabled={(d) => d < new Date()}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">{t("booking.time")}</label>
              <Select value={time} onValueChange={setTime}>
                <SelectTrigger className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:ring-primary">
                  <SelectValue placeholder={t("booking.selectTime")} />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border bg-popover text-popover-foreground">
                  {TIME_OPTIONS.map((slot) => (
                    <SelectItem key={slot} value={slot} className="rounded-lg">
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Duration */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">{t("booking.duration")}</label>
              <div className="grid grid-cols-4 gap-2">
                {DURATIONS.map(d => (
                  <button
                    key={d.value}
                    onClick={() => setDuration(d.value)}
                    className={`rounded-lg border py-2.5 text-sm font-medium transition-colors ${
                      duration === d.value ? "border-primary bg-primary/5 text-primary" : "border-border hover:bg-muted/50"
                    }`}
                  >
                    {t(d.labelKey)}
                  </button>
                ))}
              </div>
            </div>

            {/* Student Name */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">{t("booking.studentName")}</label>
              <input
                type="text"
                value={studentName}
                onChange={e => setStudentName(e.target.value)}
                placeholder={t("booking.studentNamePlaceholder")}
                className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                required
              />
            </div>

            {/* Student Email */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">{t("booking.studentEmail")}</label>
              <input
                type="email"
                value={studentEmail}
                onChange={e => setStudentEmail(e.target.value)}
                placeholder={t("booking.studentEmailPlaceholder")}
                className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                required
              />
            </div>

            {/* Message */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">{t("booking.messageToTutor")}</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder={t("booking.notesPlaceholder")}
                rows={3}
                className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary resize-none"
              />
            </div>

            {/* Price summary */}
            <div className="rounded-lg bg-muted/50 p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t(`booking.duration${duration}`)} {t("booking.lessonWith")} {tutor.name}</span>
                <span className="font-semibold tabular-nums">₾{price.toFixed(2)}</span>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full h-12 text-base font-semibold hero-gradient text-primary-foreground border-0"
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
