import { Calendar, Clock, Video, BookOpen, MessageSquare, TrendingUp, Brain, CheckCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

const upcomingLessons = [
  { id: 1, tutor: "Nino Beridze", subject: "Mathematics", date: "Today", time: "14:00 - 15:00", status: "upcoming" },
  { id: 2, tutor: "Luka Tsiklauri", subject: "Programming", date: "Tomorrow", time: "10:00 - 11:00", status: "upcoming" },
  { id: 3, tutor: "Ana Melikishvili", subject: "English", date: "Mar 19", time: "16:00 - 17:00", status: "scheduled" },
];

const completedLessons = [
  { id: 4, tutor: "Giorgi Kharadze", subject: "Physics", date: "Mar 14", time: "11:00 - 12:00", insight: "Strong grasp of Newton's laws. Focus next on energy conservation." },
  { id: 5, tutor: "Nino Beridze", subject: "Mathematics", date: "Mar 12", time: "14:00 - 15:00", insight: "Great progress on derivatives. Ready for integration techniques." },
  { id: 6, tutor: "Ana Melikishvili", subject: "English", date: "Mar 10", time: "16:00 - 17:00", insight: "Fluency improving. Work on conditional sentences and subjunctive mood." },
];

const aiInsights = [
  { title: "Weekly Progress", description: "You completed 3 lessons this week — 50% more than last week!", type: "progress" },
  { title: "Strength", description: "Mathematics: Algebra skills are above average for your level.", type: "strength" },
  { title: "Recommendation", description: "Schedule an extra English session to reinforce conditionals before your IELTS.", type: "recommendation" },
];

const recentActivity = [
  { action: "Completed lesson with Giorgi K.", time: "2 hours ago", type: "lesson" },
  { action: "AI Practice: Solved 5 physics problems", time: "Yesterday", type: "practice" },
  { action: "New message from Ana M.", time: "Yesterday", type: "message" },
];

export default function Dashboard() {
  const { t } = useLanguage();

  return (
    <Layout>
      <div className="container py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold mb-1">{t("dash.welcome")}</h1>
          <p className="text-muted-foreground mb-8">{t("dash.overview")}</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { icon: BookOpen, label: t("dash.totalLessons"), value: "24", color: "text-primary" },
            { icon: Clock, label: t("dash.hoursLearned"), value: "18.5", color: "text-info" },
            { icon: TrendingUp, label: t("dash.thisWeek"), value: "+3", color: "text-success" },
            { icon: MessageSquare, label: t("dash.unread"), value: "2", color: "text-warning" },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-xl border bg-card p-4 card-shadow">
              <stat.icon className={`h-5 w-5 ${stat.color} mb-2`} />
              <p className="text-2xl font-bold tabular-nums">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="font-semibold text-lg mb-4">{t("dash.upcoming")}</h2>
              <div className="space-y-3">
                {upcomingLessons.map((lesson, i) => (
                  <motion.div key={lesson.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }} className="rounded-xl border bg-card p-4 card-shadow flex items-center justify-between">
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
                          {t("dash.join")}
                        </Link>
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">{t("dash.scheduled")}</span>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-semibold text-lg mb-4">{t("dash.completed")}</h2>
              <div className="space-y-3">
                {completedLessons.map((lesson, i) => (
                  <motion.div key={lesson.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }} className="rounded-xl border bg-card p-4 card-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-success" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{lesson.subject} with {lesson.tutor}</p>
                          <p className="text-xs text-muted-foreground tabular-nums">{lesson.date} · {lesson.time}</p>
                        </div>
                      </div>
                    </div>
                    <div className="ml-[52px] bg-primary/5 rounded-lg px-3 py-2 flex items-start gap-2">
                      <Sparkles className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                      <p className="text-xs text-muted-foreground leading-relaxed">{lesson.insight}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" asChild>
                <Link to="/search">{t("dash.findMore")}</Link>
              </Button>
              <Button variant="outline" className="flex-1" asChild>
                <Link to="/ai-practice">{t("dash.aiPractice")}</Link>
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                {t("dash.aiInsights")}
              </h2>
              <div className="rounded-xl border bg-card p-4 card-shadow space-y-3">
                {aiInsights.map((insight, i) => (
                  <div key={i} className="pb-3 border-b last:border-b-0 last:pb-0">
                    <p className="text-sm font-medium flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${insight.type === "progress" ? "bg-primary" : insight.type === "strength" ? "bg-success" : "bg-warning"}`} />
                      {insight.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{insight.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-semibold text-lg mb-4">{t("dash.recentActivity")}</h2>
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
      </div>
    </Layout>
  );
}
