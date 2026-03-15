import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Clock, Calendar as CalendarIcon, GraduationCap, Plus, ChevronDown, MoreHorizontal, RefreshCw, MessageSquare, User, Ban, AlertCircle } from "lucide-react";
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

const CANCEL_REASONS = [
  "I'm not ready to start learning yet",
  "I found another tutor",
  "Schedule conflict",
  "Financial reasons",
  "Other",
];

export default function MyLessons() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"lessons" | "calendar" | "tutors">("lessons");
  const [cancelBooking, setCancelBooking] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState(CANCEL_REASONS[0]);
  const [cancelMessage, setCancelMessage] = useState("");
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .order("lesson_date", { ascending: true });
    setBookings(data || []);
    setLoading(false);
  }

  const today = new Date().toISOString().split("T")[0];
  const upcoming = bookings.filter(b => b.lesson_date >= today && b.status === "confirmed");
  const past = bookings.filter(b => b.lesson_date < today || b.status === "completed");
  const cancelled = bookings.filter(b => b.status === "cancelled");

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    const todayDate = new Date();
    const todayStr2 = todayDate.toISOString().split("T")[0];
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

  // Get unique tutors from bookings
  const tutors = Array.from(new Map(bookings.map(b => [b.tutor_name, b])).values());

  const tabs = [
    { key: "lessons" as const, label: "Lessons", icon: Clock },
    { key: "calendar" as const, label: "Calendar", icon: CalendarIcon },
    { key: "tutors" as const, label: "Tutors", icon: GraduationCap },
  ];

  return (
    <Layout>
      {/* Sub-navigation */}
      <div className="border-b bg-card">
        <div className="container flex items-center gap-8 overflow-x-auto">
          <Link to="/dashboard" className="py-3 text-sm font-medium text-muted-foreground hover:text-foreground border-b-2 border-transparent">
            Home
          </Link>
          <Link to="/messages" className="py-3 text-sm font-medium text-muted-foreground hover:text-foreground border-b-2 border-transparent">
            Messages
          </Link>
          <Link to="/my-lessons" className="py-3 text-sm font-medium border-b-2 border-primary text-primary">
            My lessons
          </Link>
          <Link to="/for-business" className="py-3 text-sm font-medium text-muted-foreground hover:text-foreground border-b-2 border-transparent">
            For business
          </Link>
        </div>
      </div>

      <div className="container py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h1 className="text-2xl font-bold">My lessons</h1>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Transfer balance or subscription
              </Button>
              <Button size="sm" className="hero-gradient text-primary-foreground border-0">
                <Plus className="h-4 w-4 mr-1" />
                Schedule lesson
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-6 border-b mb-6">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Lessons tab */}
          {activeTab === "lessons" && (
            <div className="space-y-8">
              {/* Upcoming */}
              <div>
                <h2 className="text-lg font-bold mb-4">Upcoming lessons</h2>
                {upcoming.length === 0 && !loading && (
                  <p className="text-sm text-muted-foreground">No upcoming lessons. Book a lesson to get started!</p>
                )}
                <div className="space-y-3">
                  {upcoming.map(booking => (
                    <div key={booking.id} className="rounded-xl border bg-card p-4 flex items-center gap-4">
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
                        <p className="text-sm font-medium">
                          {formatDate(booking.lesson_date)} · {formatTime(booking.start_time)} – {formatTime(booking.end_time)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {booking.tutor_name}, {booking.subject}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                            <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem className="gap-2">
                            <RefreshCw className="h-4 w-4" /> Reschedule
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2" asChild>
                            <Link to="/messages">
                              <MessageSquare className="h-4 w-4" /> Message tutor
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <User className="h-4 w-4" /> See tutor profile
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2 text-destructive focus:text-destructive"
                            onClick={() => setCancelBooking(booking)}
                          >
                            <Ban className="h-4 w-4" /> Cancel
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              </div>

              {/* Past */}
              {past.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold mb-4">Past lessons</h2>
                  <div className="space-y-3">
                    {past.map(booking => (
                      <div key={booking.id} className="rounded-xl border bg-card p-4 flex items-center gap-4 opacity-70">
                        <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-primary">
                            {booking.tutor_name.split(" ").map(n => n[0]).join("")}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {formatDate(booking.lesson_date)} · {formatTime(booking.start_time)} – {formatTime(booking.end_time)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {booking.tutor_name}, {booking.subject}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cancelled */}
              {cancelled.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold mb-4">Cancelled</h2>
                  <div className="space-y-3">
                    {cancelled.map(booking => (
                      <div key={booking.id} className="rounded-xl border bg-card p-4 flex items-center gap-4 opacity-50">
                        <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-primary">
                            {booking.tutor_name.split(" ").map(n => n[0]).join("")}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium line-through">
                            {formatDate(booking.lesson_date)} · {formatTime(booking.start_time)} – {formatTime(booking.end_time)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {booking.tutor_name}, {booking.subject}
                          </p>
                        </div>
                        <span className="text-xs text-destructive bg-destructive/10 px-2 py-1 rounded-full">Cancelled</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Calendar tab */}
          {activeTab === "calendar" && (
            <div className="text-center py-16">
              <CalendarIcon className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
              <p className="text-muted-foreground">Calendar view coming soon</p>
            </div>
          )}

          {/* Tutors tab */}
          {activeTab === "tutors" && (
            <div>
              <h2 className="text-lg font-bold mb-4">My tutors</h2>
              {tutors.length === 0 && (
                <p className="text-sm text-muted-foreground">No tutors yet. Book a lesson to get started!</p>
              )}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tutors.map(tutor => (
                  <div key={tutor.tutor_name} className="rounded-xl border bg-card p-5 text-center">
                    <div className="h-16 w-16 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-3">
                      {tutor.tutor_avatar_url ? (
                        <img src={tutor.tutor_avatar_url} alt={tutor.tutor_name} className="h-full w-full rounded-full object-cover" />
                      ) : (
                        <span className="text-lg font-bold text-primary">
                          {tutor.tutor_name.split(" ").map(n => n[0]).join("")}
                        </span>
                      )}
                    </div>
                    <p className="font-semibold">{tutor.tutor_name}</p>
                    <p className="text-sm text-muted-foreground mb-3">{tutor.subject}</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link to="/messages">Message</Link>
                      </Button>
                      <Button size="sm" className="flex-1 hero-gradient text-primary-foreground border-0">
                        Book
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Cancel Dialog */}
      <Dialog open={!!cancelBooking} onOpenChange={(open) => !open && setCancelBooking(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">
              This lesson can't be rescheduled on short notice
            </DialogTitle>
          </DialogHeader>

          {cancelBooking && (
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                {new Date(cancelBooking.lesson_date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} · {formatTime(cancelBooking.start_time)} – {formatTime(cancelBooking.end_time)}
              </p>

              <div className="bg-destructive/10 rounded-lg p-3 flex items-start gap-3 mb-6">
                <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Would you like to cancel this lesson?</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    When you cancel with less than 12 hours notice, the lesson will be deducted from your balance
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Please choose a reason for canceling</p>
                  <Select value={cancelReason} onValueChange={setCancelReason}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CANCEL_REASONS.map(reason => (
                        <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">
                    Message for {cancelBooking.tutor_name.split(" ")[0]} · Optional
                  </p>
                  <Textarea
                    value={cancelMessage}
                    onChange={(e) => setCancelMessage(e.target.value)}
                    placeholder="I need to cancel because..."
                    className="resize-none"
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleCancel}
                  disabled={cancelling}
                  variant="destructive"
                  className="w-full"
                >
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
