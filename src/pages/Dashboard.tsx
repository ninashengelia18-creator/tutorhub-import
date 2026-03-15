import { useState, useEffect } from "react";
import { Clock, Video, MoreHorizontal, TrendingUp, Monitor, ChevronRight, BookOpen, Search, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
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
  const lastTutor = bookings.length > 0 ? bookings[bookings.length - 1] : null;

  const formatTime = (time: string) => time.slice(0, 5);

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
          <Link to="/my-lessons" className="py-3 text-sm font-medium text-muted-foreground hover:text-foreground border-b-2 border-transparent">
            My lessons
          </Link>
          <Link to="/for-business" className="py-3 text-sm font-medium text-muted-foreground hover:text-foreground border-b-2 border-transparent">
            For business
          </Link>
        </div>
      </div>

      <div className="container py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {/* Returning user with tutor */}
          {lastTutor && upcomingBookings.length === 0 && !loading && (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-1">
                {displayName === "Student" ? "Welcome back!" : `Welcome back, ${displayName}!`}
              </p>
              <h1 className="text-2xl md:text-3xl font-bold mb-8">
                Ready to continue learning with {lastTutor.tutor_name.split(" ")[0]}?
              </h1>

              {/* Tutor card */}
              <div className="max-w-sm mx-auto">
                <div className="h-40 w-40 rounded-lg bg-muted overflow-hidden flex items-center justify-center mx-auto mb-4">
                  {lastTutor.tutor_avatar_url ? (
                    <img src={lastTutor.tutor_avatar_url} alt={lastTutor.tutor_name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-4xl font-bold text-primary">
                      {lastTutor.tutor_name.split(" ").map(n => n[0]).join("")}
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold mb-2">{lastTutor.tutor_name.split(" ")[0]}</h2>
                <div className="flex items-center justify-center gap-3 text-sm mb-4">
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-foreground" /> 5
                  </span>
                  <span className="text-muted-foreground">0 reviews</span>
                  <span>{lastTutor.currency}{lastTutor.price_amount.toFixed(2)}</span>
                  <span className="text-muted-foreground">per lesson</span>
                </div>
                <Button className="hero-gradient text-primary-foreground border-0 px-8" asChild>
                  <Link to="/search">Subscribe to continue</Link>
                </Button>
              </div>

              {/* Continue learning */}
              <div className="mt-12 text-left max-w-2xl mx-auto">
                <h3 className="font-semibold text-lg mb-4">Continue learning</h3>
                <div className="rounded-xl border bg-card p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden flex items-center justify-center shrink-0">
                      {lastTutor.tutor_avatar_url ? (
                        <img src={lastTutor.tutor_avatar_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold text-primary">
                          {lastTutor.tutor_name.split(" ").map(n => n[0]).join("")}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{lastTutor.tutor_name} · {lastTutor.subject}</p>
                      <p className="text-xs text-primary">Trial lesson booked</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Subscribe</Button>
                </div>
              </div>
            </div>
          )}

          {/* New user with no bookings */}
          {bookings.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-1">
                {displayName === "Student" ? "What's new?" : `What's new, ${displayName}?`}
              </p>
              <h1 className="text-2xl md:text-3xl font-bold mb-8">Find your perfect tutor</h1>
              <Card className="max-w-md mx-auto">
                <CardContent className="p-8 text-center">
                  <BookOpen className="h-12 w-12 text-primary/40 mx-auto mb-4" />
                  <p className="font-semibold mb-2">No lessons yet</p>
                  <p className="text-sm text-muted-foreground mb-4">Book a lesson with a tutor to get started</p>
                  <Button className="hero-gradient text-primary-foreground border-0" asChild>
                    <Link to="/search">
                      <Search className="h-4 w-4 mr-2" />
                      Find a tutor
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Has upcoming lessons */}
          {upcomingBookings.length > 0 && (
            <div>
              <p className="text-muted-foreground mb-1">Good to see you, {displayName}!</p>
              <h1 className="text-2xl md:text-3xl font-bold mb-6">Your next lesson is coming up</h1>

              {/* Next lesson card */}
              <Card className="max-w-2xl">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden flex items-center justify-center">
                        {upcomingBookings[0].tutor_avatar_url ? (
                          <img src={upcomingBookings[0].tutor_avatar_url} alt={upcomingBookings[0].tutor_name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-sm font-bold text-primary">
                            {upcomingBookings[0].tutor_name.split(" ").map(n => n[0]).join("")}
                          </span>
                        )}
                      </div>
                    </div>
                    <button className="text-muted-foreground hover:text-foreground">
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                  </div>

                  <p className="text-lg font-bold mb-1">
                    {formatTime(upcomingBookings[0].start_time)} – {formatTime(upcomingBookings[0].end_time)}
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {upcomingBookings[0].subject} with {upcomingBookings[0].tutor_name}
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
                </CardContent>
              </Card>

              {/* Up next timeline */}
              {upcomingBookings.length > 1 && (
                <div className="mt-8">
                  <h2 className="text-xl font-bold mb-4">Up next</h2>
                  <div className="space-y-4">
                    {upcomingBookings.slice(1).map((booking) => (
                      <div key={booking.id} className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          <div className="h-2.5 w-2.5 rounded-full bg-foreground mt-1.5" />
                          <div className="w-px h-full bg-border min-h-[40px]" />
                        </div>
                        <div className="flex-1 flex items-center justify-between pb-4">
                          <div>
                            <p className="font-bold">
                              {formatTime(booking.start_time)} – {formatTime(booking.end_time)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {booking.subject} with {booking.tutor_name}
                            </p>
                          </div>
                          <button className="text-muted-foreground hover:text-foreground">
                            <MoreHorizontal className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
