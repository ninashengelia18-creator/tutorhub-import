import { useLocation, Link } from "react-router-dom";
import { BookOpen, Clock, Monitor, CheckCircle, Video, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useAppLocale } from "@/contexts/AppLocaleContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  formatDateInTimeZone,
  formatTimeInTimeZone,
  getTimeZoneDisplayLabel,
  getTimeZoneInlineLabel,
} from "@/lib/datetime";

function formatGoogleCalendarDate(value?: string | null) {
  if (!value) return "";
  return new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

export default function BookingConfirmation() {
  const location = useLocation();
  const { user } = useAuth();
  const { timezone } = useAppLocale();
  const { lang } = useLanguage();
  const state = location.state as {
    tutorName: string;
    subject: string;
    date: string;
    startTime: string;
    endTime: string;
    duration: number;
    lessonStartAt?: string | null;
    lessonEndAt?: string | null;
    studentTimezone?: string;
    tutorTimezone?: string;
    meetLink?: string | null;
    priceAmount?: number;
    currency?: string;
  } | null;

  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Student";

  if (!state) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <p className="text-muted-foreground">No booking data found.</p>
          <Button asChild className="mt-4">
            <Link to="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const WISE_PAYMENT_LINK = "https://wise.com/pay/YOUR_LINK_HERE"; // TODO: Replace with your actual Wise payment link

  const studentTimezone = state.studentTimezone || timezone;
  const tutorTimezone = state.tutorTimezone || "UTC";
  const lessonStartAt = state.lessonStartAt ?? null;
  const lessonEndAt = state.lessonEndAt ?? null;
  const priceAmount = state.priceAmount ?? 0;
  const currency = state.currency ?? "USD";
  const lessonDateLabel = lessonStartAt
    ? formatDateInTimeZone(lessonStartAt, lang, studentTimezone, {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    : state.date;
  const yourTimeLabel = lessonStartAt
    ? `${formatTimeInTimeZone(lessonStartAt, lang, studentTimezone)} ${getTimeZoneDisplayLabel(studentTimezone, lessonStartAt)}`
    : `${state.startTime} ${getTimeZoneDisplayLabel(studentTimezone)}`;
  const tutorTimeLabel = lessonStartAt
    ? `${formatTimeInTimeZone(lessonStartAt, lang, tutorTimezone)} ${getTimeZoneInlineLabel(tutorTimezone, lessonStartAt)}`
    : `${state.startTime} ${getTimeZoneInlineLabel(tutorTimezone)}`;

  return (
    <Layout>
      <div className="bg-primary/10 py-12 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="mb-4 flex items-center justify-center">
            <div className="flex h-14 w-14 -rotate-6 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">
              {displayName[0]?.toUpperCase()}
            </div>
            <div className="-ml-3 flex h-14 w-14 rotate-6 items-center justify-center rounded-xl border-2 border-card bg-muted text-lg font-bold text-primary">
              {state.tutorName.split(" ").map((name) => name[0]).join("")}
            </div>
          </div>
          <p className="mb-2 text-sm font-medium text-primary">Awesome, {displayName}!</p>
          <h1 className="text-2xl font-bold md:text-3xl">
            We&apos;ll tell {state.tutorName.split(" ")[0]} you&apos;re ready to start!
          </h1>
        </motion.div>
      </div>

      <div className="container max-w-lg py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="mb-4 space-y-4 rounded-xl border bg-card p-5">
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">{state.subject}</span>
            </div>
            <div className="flex items-center gap-3">
              <Monitor className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">Take your lesson online in the LearnEazy classroom</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">{lessonDateLabel}</span>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-sm">
              <p className="font-medium text-foreground">Your time: <span className="font-semibold">{yourTimeLabel}</span></p>
              <p className="mt-2 text-muted-foreground">Tutor time: <span className="font-medium text-foreground">{tutorTimeLabel}</span></p>
            </div>

            {state.meetLink && (
              <Button className="w-full hero-gradient border-0 text-primary-foreground font-semibold" asChild>
                <a href={state.meetLink} target="_blank" rel="noopener noreferrer">
                  <Video className="mr-2 h-5 w-5" />
                  Join Session
                </a>
              </Button>
            )}

            <Button variant="outline" className="w-full" asChild>
              <a
                href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`${state.subject} with ${state.tutorName}`)}&dates=${formatGoogleCalendarDate(lessonStartAt)}/${formatGoogleCalendarDate(lessonEndAt)}&details=${encodeURIComponent("LearnEazy lesson")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src="https://www.gstatic.com/images/branding/product/2x/calendar_2020q4_48dp.png" alt="Google Calendar" className="mr-2 h-5 w-5" />
                Add to Google Calendar
              </a>
            </Button>
          </div>

          {/* Payment Section */}
          {!state.meetLink && (
            <div className="mb-4 rounded-xl border-2 border-warning/30 bg-warning/5 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/10">
                    <Clock className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Complete Your Payment</h3>
                  </div>
                </div>
                <Badge className="border-warning/30 bg-warning/10 text-warning">Awaiting Payment</Badge>
              </div>

              <div className="rounded-lg bg-card border p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">Lesson Amount</p>
                <p className="text-3xl font-bold text-foreground">${priceAmount.toFixed(2)} <span className="text-base font-normal text-muted-foreground">{currency}</span></p>
              </div>

              <p className="text-sm text-muted-foreground text-center">
                To confirm your session, our team will send you a secure payment link to your email within the next hour. Please complete payment to receive your Google Meet link and session confirmation.
              </p>

              <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  Check your inbox at <strong>{user?.email || "your registered email"}</strong> for the payment link.
                </p>
              </div>
            </div>
          )}

          <div className="mb-6 flex items-start gap-3 rounded-xl bg-accent/40 p-4">
            <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-success" />
            <p className="text-sm text-muted-foreground">
              We guarantee that your lesson will be amazing. If not, you can try 2 more tutors for free.
            </p>
          </div>

          <Button className="hero-gradient h-12 w-full border-0 text-base font-semibold text-primary-foreground" asChild>
            <Link to="/dashboard">Get ready for your lesson</Link>
          </Button>
        </motion.div>
      </div>
    </Layout>
  );
}
