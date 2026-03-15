import { useState, useEffect } from "react";
import { Clock, Video, MoreHorizontal, TrendingUp, Monitor, ChevronRight, BookOpen, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";

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
  const { t } = useLanguage();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Student";

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
  const nextBooking = upcomingBookings[0];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    if (dateStr === todayStr) return "Today";
    if (dateStr === tomorrowStr) return "Tomorrow";
    return date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
  };

  const formatTime = (time: string) => time.slice(0, 5);

  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", { weekday: "long" });
  };

  return (
    <Layout>
      {/* Sub-navigation */}
      <div className="border-b bg-card">
        <div className="container flex items-center gap-8 overflow-x-auto">
          <Link to="/dashboard" className="py-3 text-sm font-medium border-b-2 border-primary text-primary">
            Home
          </Link>
          <Link to="/messages" className="py-3 text-sm font-medium text-muted-foreground hover:text-foreground border-b-2 border-transparent">
            Messages
          </Link>
          <Link to="/dashboard" className="py-3 text-sm font-medium text-muted-foreground hover:text-foreground border-b-2 border-transparent">
            My lessons
          </Link>
          <Link to="/for-business" className="py-3 text-sm font-medium text-muted-foreground hover:text-foreground border-b-2 border-transparent">
            For business
          </Link>
        </div>
      </div>

      {/* Hero section with pink bg */}
      <div className="bg-primary/10 pb-8">
        <div className="container pt-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-muted-foreground mb-1">Good to see you, {displayName}!</p>
            <h1 className="text-2xl md:text-3xl font-bold mb-6">
              {nextBooking?.is_trial
                ? "Let's get you ready for your trial lesson"
                : upcomingBookings.length > 0
                  ? "Your next lesson is coming up"
                  : "Find your perfect tutor"}
            </h1>

            {/* Next lesson card */}
            {nextBooking && (
              <Card className="max-w-2xl">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden flex items-center justify-center">
                        {nextBooking.tutor_avatar_url ? (
                          <img src={nextBooking.tutor_avatar_url} alt={nextBooking.tutor_name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-sm font-bold text-primary">
                            {nextBooking.tutor_name.split(" ").map(n => n[0]).join("")}
                          </span>
                        )}
                      </div>
                    </div>
                    <button className="text-muted-foreground hover:text-foreground">
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                  </div>

                  <p className="text-sm text-muted-foreground mb-1">{formatDate(nextBooking.lesson_date)}</p>
                  <p className="text-lg font-bold mb-1">
                    {getDayName(nextBooking.lesson_date)} · {formatTime(nextBooking.start_time)} – {formatTime(nextBooking.end_time)}
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {nextBooking.subject} with {nextBooking.tutor_name}
                  </p>

                  <Button variant="outline" size="lg" asChild>
                    <Link to="/classroom">
                      <Video className="h-4 w-4 mr-2" />
                      Join lesson
                    </Link>
                  </Button>

                  {/* Before your lesson section */}
                  <div className="mt-6 pt-4 border-t">
                    <p className="font-semibold text-sm mb-3">Before your lesson</p>
                    <div className="space-y-2">
                      <button className="w-full flex items-center gap-3 rounded-lg border p-3 text-left hover:bg-muted/50 transition-colors">
                        <TrendingUp className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm flex-1">Share your learning needs</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </button>
                      <button className="w-full flex items-center gap-3 rounded-lg border p-3 text-left hover:bg-muted/50 transition-colors">
                        <Monitor className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm flex-1">Test your classroom</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>

                  {/* Trial preview banner */}
                  {nextBooking.is_trial && (
                    <div className="mt-4 bg-muted rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-sm">Get a preview of your trial lesson</p>
                        <Button size="sm" className="mt-2 hero-gradient text-primary-foreground border-0">
                          See what to expect
                        </Button>
                      </div>
                      <BookOpen className="h-12 w-12 text-primary/30" />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {!nextBooking && !loading && (
              <Card className="max-w-2xl">
                <CardContent className="p-8 text-center">
                  <BookOpen className="h-12 w-12 text-primary/40 mx-auto mb-4" />
                  <p className="font-semibold mb-2">No upcoming lessons</p>
                  <p className="text-sm text-muted-foreground mb-4">Book a lesson with a tutor to get started</p>
                  <Button className="hero-gradient text-primary-foreground border-0" asChild>
                    <Link to="/search">
                      <Search className="h-4 w-4 mr-2" />
                      Find a tutor
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>

      {/* Up next section */}
      <div className="container py-8">
        {upcomingBookings.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h2 className="text-xl font-bold mb-4">Up next</h2>
            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
                <div key={booking.id} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-2.5 w-2.5 rounded-full bg-foreground mt-1.5" />
                    <div className="w-px h-full bg-border min-h-[40px]" />
                  </div>
                  <div className="flex-1 flex items-center justify-between pb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">{formatDate(booking.lesson_date)}</p>
                      <p className="font-bold">
                        {getDayName(booking.lesson_date)} · {formatTime(booking.start_time)} – {formatTime(booking.end_time)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {booking.subject} with{" "}
                        <span className="inline-flex items-center gap-1">
                          {booking.tutor_avatar_url && (
                            <img src={booking.tutor_avatar_url} alt="" className="h-4 w-4 rounded-full inline" />
                          )}
                          {booking.tutor_name}
                        </span>
                      </p>
                    </div>
                    <button className="text-muted-foreground hover:text-foreground">
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Subscriptions section */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-10">
          <h2 className="text-xl font-bold mb-4">Subscriptions</h2>
          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl">
            {upcomingBookings.length > 0 && (
              <Card className="overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="h-16 w-16 rounded-lg bg-muted overflow-hidden flex items-center justify-center">
                      {upcomingBookings[0].tutor_avatar_url ? (
                        <img src={upcomingBookings[0].tutor_avatar_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-lg font-bold text-primary">
                          {upcomingBookings[0].tutor_name.split(" ").map(n => n[0]).join("")}
                        </span>
                      )}
                    </div>
                    <span className="text-xs border rounded-full px-2 py-0.5">Not started</span>
                  </div>
                  <p className="font-semibold text-sm mb-1">
                    Want to continue learning with {upcomingBookings[0].tutor_name.split(" ")[0]}?
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">Start a monthly subscription and set up your schedule</p>
                  <Button variant="outline" className="w-full">Subscribe</Button>
                </CardContent>
              </Card>
            )}

            <Card className="overflow-hidden">
              <CardContent className="p-5">
                <div className="flex -space-x-2 mb-4">
                  {["NB", "LT", "AM"].map((initials, i) => (
                    <div key={i} className="h-12 w-12 rounded-lg bg-muted border-2 border-card flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">{initials}</span>
                    </div>
                  ))}
                </div>
                <p className="font-semibold text-sm mb-1">Want to find another tutor?</p>
                <p className="text-xs text-muted-foreground mb-4">Try different teaching styles to choose your perfect tutor match</p>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/search">Find another tutor</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Guarantee */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 max-w-2xl bg-accent/40 rounded-xl p-4 flex items-start gap-3"
        >
          <div className="h-6 w-6 rounded-full bg-success/20 flex items-center justify-center shrink-0 mt-0.5">
            <svg className="h-3.5 w-3.5 text-success" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-sm text-muted-foreground">
            We guarantee that your lesson will be amazing. If not, you can try 2 more tutors for free.
          </p>
        </motion.div>
      </div>
    </Layout>
  );
}
