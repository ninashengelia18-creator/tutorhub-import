import { useLocation, Link } from "react-router-dom";
import { BookOpen, Clock, Monitor, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

export default function BookingConfirmation() {
  const location = useLocation();
  const { user } = useAuth();
  const state = location.state as {
    tutorName: string;
    subject: string;
    date: string;
    startTime: string;
    endTime: string;
    duration: number;
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

  const dateObj = new Date(state.date + "T00:00:00");
  const dayName = dateObj.toLocaleDateString("en-US", { weekday: "long" });
  const monthName = dateObj.toLocaleDateString("en-US", { month: "long" });

  return (
    <Layout>
      {/* Pink hero */}
      <div className="bg-primary/10 py-12 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="flex items-center justify-center mb-4">
            <div className="h-14 w-14 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg -rotate-6">
              {displayName[0]?.toUpperCase()}
            </div>
            <div className="h-14 w-14 rounded-xl bg-muted flex items-center justify-center text-primary font-bold text-lg rotate-6 -ml-3 border-2 border-card">
              {state.tutorName.split(" ").map(n => n[0]).join("")}
            </div>
          </div>
          <p className="text-primary text-sm font-medium mb-2">Awesome, {displayName}!</p>
          <h1 className="text-2xl md:text-3xl font-bold">
            We'll tell {state.tutorName.split(" ")[0]} you're ready to start!
          </h1>
        </motion.div>
      </div>

      <div className="container max-w-lg py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          {/* Lesson details card */}
          <div className="rounded-xl border bg-card p-5 mb-4 space-y-4">
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
              <span className="text-sm">
                {dayName}, {monthName} {dateObj.getDate()} · {state.startTime} – {state.endTime}
              </span>
            </div>

            <Button variant="outline" className="w-full" asChild>
              <a
                href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(state.subject + " with " + state.tutorName)}&dates=${state.date.replace(/-/g, "")}T${state.startTime.replace(":", "")}00/${state.date.replace(/-/g, "")}T${state.endTime.replace(":", "")}00&details=LearnEazy+lesson`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src="https://www.gstatic.com/images/branding/product/2x/calendar_2020q4_48dp.png" alt="Google Calendar" className="h-5 w-5 mr-2" />
                Add to Google Calendar
              </a>
            </Button>
          </div>

          {/* Guarantee */}
          <div className="bg-accent/40 rounded-xl p-4 flex items-start gap-3 mb-6">
            <CheckCircle className="h-5 w-5 text-success shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              We guarantee that your lesson will be amazing. If not, you can try 2 more tutors for free.
            </p>
          </div>

          <Button className="w-full h-12 text-base font-semibold hero-gradient text-primary-foreground border-0" asChild>
            <Link to="/dashboard">Get ready for your lesson</Link>
          </Button>
        </motion.div>
      </div>
    </Layout>
  );
}
