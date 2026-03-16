import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Clock, Calendar as CalendarIcon, GraduationCap, Plus, ChevronDown, ChevronLeft, ChevronRight, MoreHorizontal, RefreshCw, MessageSquare, User, Ban, AlertCircle, Check, Repeat, CalendarDays, Video, ExternalLink, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";

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
  google_meet_link: string | null;
}

const getStatusBadge = (t: (key: string) => string) => ({
  pending: { class: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30", labelKey: "myLessons.statusPending", icon: Clock },
  confirmed: { class: "bg-green-500/10 text-green-600 border-green-500/30", labelKey: "myLessons.statusConfirmed", icon: CheckCircle },
  completed: { class: "bg-blue-500/10 text-blue-600 border-blue-500/30", labelKey: "myLessons.statusCompleted", icon: Check },
  cancelled: { class: "bg-red-500/10 text-red-600 border-red-500/30", labelKey: "myLessons.statusCancelled", icon: XCircle },
});

const CANCEL_REASON_KEYS = [
  "myLessons.cancelReason1",
  "myLessons.cancelReason2",
  "myLessons.cancelReason3",
  "myLessons.cancelReason4",
  "myLessons.cancelReason5",
  "myLessons.cancelReason6",
  "myLessons.cancelReason7",
];

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7);

function CalendarView({ bookings }: { bookings: Booking[] }) {
  const { lang, t } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());

  const navigateWeek = (dir: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + dir * 7);
    setCurrentDate(d);
  };

  const goToToday = () => setCurrentDate(new Date());

  const weekDates = useMemo(() => {
    const start = new Date(currentDate);
    const day = start.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    start.setDate(start.getDate() + mondayOffset);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [currentDate]);

  const getBookingsForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return bookings.filter(b => b.lesson_date === dateStr && (b.status === "confirmed" || b.status === "pending"));
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const formatTime = (t: string) => t.slice(0, 5);

  const weekRangeLabel = useMemo(() => {
    const first = weekDates[0];
    const last = weekDates[6];
    const sameMonth = first.getMonth() === last.getMonth();
    const locale = lang === "ka" ? "ka-GE" : lang === "ru" ? "ru-RU" : "en-US";
    if (sameMonth) {
      return `${first.toLocaleDateString(locale, { month: "short" })} ${first.getDate()} – ${last.getDate()}, ${last.getFullYear()}`;
    }
    return `${first.toLocaleDateString(locale, { month: "short" })} ${first.getDate()} – ${last.toLocaleDateString(locale, { month: "short" })} ${last.getDate()}, ${last.getFullYear()}`;
  }, [weekDates, lang]);

  const tzOffset = new Date().getTimezoneOffset();
  const tzHours = -tzOffset / 60;
  const tzLabel = `GMT ${tzHours >= 0 ? "+" : ""}${tzHours}:00`;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={goToToday}>{t("myLessons.today")}</Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigateWeek(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigateWeek(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="text-base font-semibold">{weekRangeLabel}</span>
        </div>
      </div>
      <div className="border rounded-xl overflow-hidden">
        <div className="grid grid-cols-[70px_repeat(7,1fr)] border-b bg-muted/30">
          <div className="p-2 text-xs text-muted-foreground text-center">{tzLabel}</div>
          {weekDates.map((date, i) => {
            const isToday = date.toISOString().split("T")[0] === todayStr;
            return (
              <div key={i} className={`p-2 text-center border-l ${isToday ? "bg-primary/5" : ""}`}>
                <p className="text-xs text-muted-foreground">{date.toLocaleDateString(lang === "ka" ? "ka-GE" : lang === "ru" ? "ru-RU" : "en-US", { weekday: "short" })}</p>
                <p className={`text-sm font-semibold ${isToday ? "text-primary" : ""}`}>{date.getDate()}</p>
                {isToday && <div className="h-0.5 bg-primary mt-1 rounded-full" />}
              </div>
            );
          })}
        </div>
        <div className="max-h-[500px] overflow-y-auto">
          {HOURS.map(hour => (
            <div key={hour} className="grid grid-cols-[70px_repeat(7,1fr)] min-h-[48px]">
              <div className="p-1 text-right pr-3 text-xs text-muted-foreground tabular-nums border-t">
                {String(hour).padStart(2, "0")}:00
              </div>
              {weekDates.map((date, i) => {
                const dayBookings = getBookingsForDate(date).filter(b => {
                  const startHour = parseInt(b.start_time.split(":")[0]);
                  return startHour === hour;
                });
                const isToday = date.toISOString().split("T")[0] === todayStr;
                return (
                  <div key={i} className={`border-l border-t relative ${isToday ? "bg-primary/[0.02]" : ""}`}>
                    {dayBookings.map(b => (
                      <div
                        key={b.id}
                        className={`absolute inset-x-0.5 top-0.5 rounded px-1 py-0.5 overflow-hidden cursor-pointer transition-colors ${
                          b.status === "pending"
                            ? "bg-yellow-500/15 border border-yellow-500/30 hover:bg-yellow-500/25"
                            : "bg-primary/15 border border-primary/30 hover:bg-primary/25"
                        }`}
                        style={{ minHeight: `${(b.duration_minutes / 60) * 48 - 4}px` }}
                      >
                        <p className="text-[10px] font-medium truncate">{b.subject}</p>
                        <p className="text-[10px] opacity-70 truncate tabular-nums">
                          {formatTime(b.start_time)} – {formatTime(b.end_time)}
                        </p>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MyLessons() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"lessons" | "calendar" | "tutors">("lessons");
  const [cancelBooking, setCancelBooking] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState(CANCEL_REASONS[0]);
  const [cancelMessage, setCancelMessage] = useState("");
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => { fetchBookings(); }, []);

  async function fetchBookings() {
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .order("lesson_date", { ascending: true });
    setBookings((data as Booking[]) || []);
    setLoading(false);
  }

  const today = new Date().toISOString().split("T")[0];
  const upcoming = bookings.filter(b => b.lesson_date >= today && (b.status === "confirmed" || b.status === "pending"));
  const past = bookings.filter(b => b.lesson_date < today || b.status === "completed");
  const cancelled = bookings.filter(b => b.status === "cancelled");

  const lastTutor = bookings.length > 0 ? bookings[bookings.length - 1] : null;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    const todayStr2 = new Date().toISOString().split("T")[0];
    const prefix = dateStr === todayStr2 ? "Today, " : "";
    return prefix + date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatTime = (t: string) => t.slice(0, 5);

  const handleCancel = async () => {
    if (!cancelBooking) return;
    setCancelling(true);
    const { error } = await supabase
      .from("bookings")
      .update({ status: "cancelled", notes: `Cancel reason: ${cancelReason}. ${cancelMessage}` })
      .eq("id", cancelBooking.id);
    setCancelling(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Lesson cancelled" });
      setCancelBooking(null);
      setCancelMessage("");
      fetchBookings();
    }
  };

  const tutors = Array.from(new Map(bookings.map(b => [b.tutor_name, b])).values());

  const tabs = [
    { key: "lessons" as const, label: t("myLessons.lessons"), icon: Clock },
    { key: "calendar" as const, label: t("myLessons.calendar"), icon: CalendarIcon },
    { key: "tutors" as const, label: t("myLessons.tutors"), icon: GraduationCap },
  ];

  const renderBookingCard = (booking: Booking, showActions = true) => {
    const sb = statusBadge[booking.status] || statusBadge.pending;
    const StatusIcon = sb.icon;
    return (
      <div key={booking.id} className={`rounded-xl border bg-card p-4 flex items-center gap-4 ${booking.status === "cancelled" ? "opacity-50" : ""}`}>
        <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden flex items-center justify-center shrink-0">
          {booking.tutor_avatar_url ? (
            <img src={booking.tutor_avatar_url} alt={booking.tutor_name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-sm font-bold text-primary">
              {booking.tutor_name.split(" ").map(n => n[0]).join("")}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className={`gap-1 text-xs ${sb.class}`}>
              <StatusIcon className="h-3 w-3" />
              {sb.label}
            </Badge>
          </div>
          <p className="text-sm font-medium">
            {formatDate(booking.lesson_date)} · {formatTime(booking.start_time)} – {formatTime(booking.end_time)}
          </p>
          <p className="text-sm text-muted-foreground">
            {booking.tutor_name}, {booking.subject}
          </p>
          {booking.google_meet_link && booking.status === "confirmed" && (
            <a href={booking.google_meet_link} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1">
              <Video className="h-3 w-3" /> {t("myLessons.joinMeet")} <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
        {showActions && (booking.status === "pending" || booking.status === "confirmed") && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {booking.google_meet_link && booking.status === "confirmed" && (
                <DropdownMenuItem className="gap-2" asChild>
                  <a href={booking.google_meet_link} target="_blank" rel="noopener noreferrer">
                    <Video className="h-4 w-4" /> {t("myLessons.joinMeet")}
                  </a>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className="gap-2" asChild>
                <Link to="/messages">
                  <MessageSquare className="h-4 w-4" /> Message tutor
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2 text-destructive focus:text-destructive"
                onClick={() => setCancelBooking(booking)}
              >
                <Ban className="h-4 w-4" /> Cancel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    );
  };

  return (
    <Layout>
      <div className="border-b bg-card">
        <div className="container flex items-center gap-8 overflow-x-auto">
          <Link to="/dashboard" className="py-3 text-sm font-medium text-muted-foreground hover:text-foreground border-b-2 border-transparent">Home</Link>
          <Link to="/messages" className="py-3 text-sm font-medium text-muted-foreground hover:text-foreground border-b-2 border-transparent">Messages</Link>
          <Link to="/my-lessons" className="py-3 text-sm font-medium border-b-2 border-primary text-primary">My lessons</Link>
        </div>
      </div>

      <div className="container py-8">
        {lastTutor && upcoming.length === 0 && !loading && (
          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between rounded-xl border bg-card p-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-muted overflow-hidden flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-primary">
                  {lastTutor.tutor_name.split(" ").map(n => n[0]).join("")}
                </span>
              </div>
              <p className="font-semibold text-sm">Schedule your next lesson with {lastTutor.tutor_name.split(" ")[0]}.</p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/search">Schedule lesson</Link>
            </Button>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h1 className="text-2xl font-bold">{t("myLessons.title")}</h1>
            <Button size="sm" className="hero-gradient text-primary-foreground border-0" asChild>
              <Link to="/search">
                <Plus className="h-4 w-4 mr-1" />
                {t("myLessons.scheduleLesson")}
              </Link>
            </Button>
          </div>

          <div className="flex items-center gap-6 border-b mb-6">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "lessons" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-lg font-bold mb-4">{t("myLessons.upcoming")}</h2>
                {upcoming.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <p className="text-lg font-bold mb-2">{t("myLessons.noUpcoming")}</p>
                    <p className="text-sm text-muted-foreground">{t("myLessons.scheduleNow")}</p>
                  </div>
                )}
                <div className="space-y-3">
                  {upcoming.map(b => renderBookingCard(b))}
                </div>
              </div>

              {past.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold mb-4">{t("myLessons.past")}</h2>
                  <div className="space-y-3">
                    {past.map(b => renderBookingCard(b, false))}
                  </div>
                </div>
              )}

              {cancelled.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold mb-4">{t("myLessons.cancelled")}</h2>
                  <div className="space-y-3">
                    {cancelled.map(b => renderBookingCard(b, false))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "calendar" && <CalendarView bookings={bookings} />}

          {activeTab === "tutors" && (
            <div>
              {tutors.length === 0 && (
                <p className="text-sm text-muted-foreground">No tutors yet. Book a lesson to get started!</p>
              )}
              <div className="space-y-4">
                {tutors.map(tutor => (
                  <div key={tutor.tutor_name} className="flex items-center gap-6 py-4 border-b last:border-0">
                    <div className="h-14 w-14 rounded-full bg-muted overflow-hidden flex items-center justify-center shrink-0">
                      <span className="text-lg font-bold text-primary">
                        {tutor.tutor_name.split(" ").map(n => n[0]).join("")}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-primary">{tutor.tutor_name}</p>
                      <p className="text-sm text-muted-foreground">{tutor.subject}</p>
                    </div>
                    <Button variant="outline" asChild>
                      <Link to="/search">Book Again</Link>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      <Dialog open={!!cancelBooking} onOpenChange={(open) => !open && setCancelBooking(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">Cancel this lesson?</DialogTitle>
          </DialogHeader>
          {cancelBooking && (
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                {new Date(cancelBooking.lesson_date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} · {formatTime(cancelBooking.start_time)} – {formatTime(cancelBooking.end_time)}
              </p>
              <div className="bg-destructive/10 rounded-lg p-3 flex items-start gap-3 mb-6">
                <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <p className="text-sm">Cancellations with less than 12 hours notice may be charged.</p>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Reason for canceling</p>
                  <Select value={cancelReason} onValueChange={setCancelReason}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CANCEL_REASONS.map(reason => (
                        <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Message (optional)</p>
                  <Textarea value={cancelMessage} onChange={(e) => setCancelMessage(e.target.value)} placeholder="I need to cancel because..." className="resize-none" rows={3} />
                </div>
                <Button onClick={handleCancel} disabled={cancelling} variant="destructive" className="w-full">
                  {cancelling ? "Cancelling..." : "Confirm cancellation"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
