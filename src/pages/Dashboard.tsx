import { Calendar, Clock, Video, BookOpen, MessageSquare, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const upcomingLessons = [
  { id: 1, tutor: "Nino Beridze", subject: "Mathematics", date: "Today", time: "14:00 - 15:00", status: "upcoming" },
  { id: 2, tutor: "Luka Tsiklauri", subject: "Programming", date: "Tomorrow", time: "10:00 - 11:00", status: "upcoming" },
  { id: 3, tutor: "Ana Melikishvili", subject: "English", date: "Mar 19", time: "16:00 - 17:00", status: "scheduled" },
];

const recentActivity = [
  { action: "Completed lesson with Giorgi K.", time: "2 hours ago", type: "lesson" },
  { action: "AI Practice: Solved 5 physics problems", time: "Yesterday", type: "practice" },
  { action: "New message from Ana M.", time: "Yesterday", type: "message" },
];

export default function Dashboard() {
  return (
    <Layout>
      <div className="container py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold mb-1">Welcome back, Student!</h1>
          <p className="text-muted-foreground mb-8">Here's your learning overview</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { icon: BookOpen, label: "Total Lessons", value: "24", color: "text-primary" },
            { icon: Clock, label: "Hours Learned", value: "18.5", color: "text-info" },
            { icon: TrendingUp, label: "This Week", value: "+3", color: "text-success" },
            { icon: MessageSquare, label: "Unread", value: "2", color: "text-warning" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border bg-card p-4 card-shadow"
            >
              <stat.icon className={`h-5 w-5 ${stat.color} mb-2`} />
              <p className="text-2xl font-bold tabular-nums">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Upcoming lessons */}
          <div className="lg:col-span-2">
            <h2 className="font-semibold text-lg mb-4">Upcoming Lessons</h2>
            <div className="space-y-3">
              {upcomingLessons.map((lesson, i) => (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className="rounded-xl border bg-card p-4 card-shadow flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary-light flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{lesson.subject} with {lesson.tutor}</p>
                      <p className="text-xs text-muted-foreground tabular-nums">{lesson.date} · {lesson.time}</p>
                    </div>
                  </div>
                  {lesson.status === "upcoming" ? (
                    <Button size="sm" className="hero-gradient text-primary-foreground border-0" asChild>
                      <Link to="/classroom">
                        <Video className="mr-1 h-3.5 w-3.5" />
                        Join
                      </Link>
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">Scheduled</span>
                  )}
                </motion.div>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1" asChild>
                <Link to="/search">Find More Tutors</Link>
              </Button>
              <Button variant="outline" className="flex-1" asChild>
                <Link to="/ai-practice">AI Practice</Link>
              </Button>
            </div>
          </div>

          {/* Activity */}
          <div>
            <h2 className="font-semibold text-lg mb-4">Recent Activity</h2>
            <div className="rounded-xl border bg-card p-4 card-shadow">
              <div className="space-y-3">
                {recentActivity.map((activity, i) => (
                  <div key={i} className="flex gap-3 pb-3 border-b last:border-b-0 last:pb-0">
                    <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                    <div>
                      <p className="text-sm">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
