import { useParams, Link } from "react-router-dom";
import { Star, Globe, BookOpen, Calendar, CheckCircle, Video, Heart, Share2, MessageSquare, Shield, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const tutorData: Record<string, any> = {
  "1": {
    name: "Nino B.",
    subject: "Mathematics",
    origin: "Georgia",
    rating: 4.9,
    reviewCount: 127,
    price: 25,
    lessonLength: "50-min",
    avatar: "NB",
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face",
    languages: [
      { name: "Georgian", level: "Native" },
      { name: "English", level: "Upper-Intermediate B2" },
    ],
    headline: "Expert Mathematics tutor with 10+ years helping students master algebra, calculus, and exam prep. Personalized approach for every learner!",
    highlights: ["Patient", "Structured", "Goal-Focused"],
    superTutor: true,
    superTutorDesc: "Nino B. is a highly rated and experienced tutor.",
    teaches: "Mathematics lessons",
    bio: `Hello! My name is Nino, and I'm a passionate mathematics teacher from Georgia.

With over 10 years of experience teaching mathematics, I specialize in making complex concepts accessible and engaging. From algebra to calculus, I tailor each lesson to your learning style and goals.

I have helped hundreds of students improve their grades, pass university entrance exams, and build genuine confidence in math. Whether you're a complete beginner or preparing for advanced exams, I'm here to guide you every step of the way.

Together, we will explore the beauty of mathematics. I am dedicated to your growth and success, ensuring that each lesson is engaging and tailored to your needs. Let's embark on this learning journey together!`,
    experience: "10+ years",
    students: 340,
    lessons: 2800,
    lessonRating: { overall: 4.9, reassurance: 5.0, clarity: 4.9, progress: 4.8, preparation: 5.0 },
    ratingReviewCount: 42,
    resume: [
      { period: "2014 — Present", org: "LearnEazy", role: "Senior Mathematics Tutor" },
      { period: "2010 — 2014", org: "Tbilisi State University", role: "Teaching Assistant" },
    ],
    specialties: ["Algebra", "Calculus", "Exam Prep"],
    responsiveness: "Usually responds in less than an hour",
  },
  "2": {
    name: "Giorgi K.",
    subject: "Physics",
    origin: "Georgia",
    rating: 4.8,
    reviewCount: 98,
    price: 30,
    lessonLength: "50-min",
    avatar: "GK",
    photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=face",
    languages: [
      { name: "Georgian", level: "Native" },
      { name: "Russian", level: "Native" },
    ],
    headline: "PhD in Physics — making physics intuitive, not intimidating. Consistent grade improvements guaranteed!",
    highlights: ["Encouraging", "Adaptable", "Clear"],
    superTutor: true,
    superTutorDesc: "Giorgi K. is a highly rated and experienced tutor.",
    teaches: "Physics lessons",
    bio: `PhD in Physics from Tbilisi State University. I believe physics should be intuitive, not intimidating. My students consistently improve their grades and develop a genuine curiosity for science.

I use real-world examples and visual demonstrations to make abstract concepts concrete. Every lesson is tailored to your current level and goals.`,
    experience: "8 years",
    students: 210,
    lessons: 1900,
    lessonRating: { overall: 4.8, reassurance: 4.9, clarity: 4.8, progress: 4.7, preparation: 4.9 },
    ratingReviewCount: 30,
    resume: [
      { period: "2016 — Present", org: "Freelance", role: "Physics Tutor" },
      { period: "2012 — 2016", org: "Tbilisi State University", role: "PhD Researcher" },
    ],
    specialties: ["Mechanics", "Thermodynamics", "Exam Prep"],
    responsiveness: "Usually responds in less than an hour",
  },
  "3": {
    name: "Ana M.",
    subject: "English",
    origin: "Georgia",
    rating: 5.0,
    reviewCount: 215,
    price: 20,
    lessonLength: "50-min",
    avatar: "AM",
    photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face",
    languages: [
      { name: "English", level: "Native" },
      { name: "Georgian", level: "Native" },
    ],
    headline: "IELTS & TOEFL specialist with Cambridge CELTA certification. Achieve your target scores with structured preparation and real exam practice!",
    highlights: ["Structured", "Patient", "Goal-Focused", "Encouraging"],
    superTutor: true,
    superTutorDesc: "Ana M. is a highly rated and experienced tutor.",
    teaches: "English lessons",
    bio: `IELTS & TOEFL specialist with a Cambridge CELTA certification. I help students achieve their target scores with structured preparation and real exam practice.

With 12 years of experience, I've guided over 500 students to their language goals. My lessons are dynamic, practical, and always tailored to your needs.`,
    experience: "12 years",
    students: 520,
    lessons: 4100,
    lessonRating: { overall: 5.0, reassurance: 5.0, clarity: 5.0, progress: 5.0, preparation: 5.0 },
    ratingReviewCount: 85,
    resume: [
      { period: "2012 — Present", org: "LearnEazy", role: "Senior English Tutor" },
      { period: "2010 — 2012", org: "British Council", role: "English Instructor" },
    ],
    specialties: ["IELTS Prep", "TOEFL Prep", "Business English", "Conversational English"],
    responsiveness: "Usually responds in less than an hour",
  },
  "4": {
    name: "Luka T.",
    subject: "Programming",
    origin: "Georgia",
    rating: 4.9,
    reviewCount: 164,
    price: 35,
    lessonLength: "50-min",
    avatar: "LT",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    languages: [
      { name: "English", level: "Upper-Intermediate B2" },
      { name: "Georgian", level: "Native" },
    ],
    headline: "Full-stack developer from top tech companies. Learn Python, JavaScript, React, and data science with project-based lessons!",
    highlights: ["Structured", "Adaptable", "Patient"],
    superTutor: false,
    superTutorDesc: "",
    teaches: "Programming lessons",
    bio: `Full-stack developer with experience at top tech companies. I teach Python, JavaScript, React, and data science. Project-based learning approach.

I believe the best way to learn programming is by building real projects. Every lesson includes hands-on coding exercises.`,
    experience: "6 years",
    students: 280,
    lessons: 2200,
    lessonRating: { overall: 4.9, reassurance: 4.8, clarity: 4.9, progress: 4.9, preparation: 4.8 },
    ratingReviewCount: 55,
    resume: [
      { period: "2020 — Present", org: "Freelance", role: "Programming Tutor" },
      { period: "2018 — 2020", org: "TBC Bank", role: "Software Developer" },
    ],
    specialties: ["Python", "JavaScript", "React", "Data Science"],
    responsiveness: "Usually responds within 2 hours",
  },
};

const reviewsData = [
  { name: "Sandro M.", lessonsCount: 39, date: "Jul 4, 2025", text: "Another great lesson! Thank you so much! The explanations are always clear and the pace is perfect.", rating: 5 },
  { name: "Natia K.", lessonsCount: 25, date: "Aug 19, 2025", text: "An amazing teacher. Wonderful personality — always cheerful, supportive, and encouraging. Very kind and patient, and always makes sure to meet all my learning needs. I'm learning faster and getting better every day.", rating: 5, edited: true },
  { name: "Alex T.", lessonsCount: 19, date: "Nov 6, 2025", text: "Extremely professional instructor. Lectures are very clear, the teaching materials are highly engaging, and the methods are flexibly adjusted according to students' individual situations. I have gained a great deal and strongly recommend this teacher.", rating: 5 },
  { name: "Anonymous", lessonsCount: 16, date: "Jun 22, 2025", text: "Top Tutor. I highly recommend to everyone who wants to learn in a very structured way.", rating: 5, edited: true },
  { name: "Mariam D.", lessonsCount: 9, date: "Jul 21, 2025", text: "Excellent teacher!", rating: 5 },
  { name: "Tamta G.", lessonsCount: 7, date: "Feb 25, 2026", text: "Very good tutor. Explains everything clearly and corrects me when I'm wrong. Lessons are engaging and tailored to my needs. I've seen great progress thanks to the guidance ☺️", rating: 5 },
];

const similarTutors = [
  { id: "2", name: "Giorgi K.", rating: 5.0, reviewCount: 98, headline: "PhD in Physics — making physics intuitive, not intimidating.", price: 100 },
  { id: "3", name: "Ana M.", rating: 5.0, reviewCount: 215, headline: "IELTS & TOEFL specialist with Cambridge CELTA. Achieve your target scores!", price: 75 },
  { id: "4", name: "Luka T.", rating: 4.9, reviewCount: 164, headline: "Full-stack developer. Learn Python, JavaScript, React with project-based lessons!", price: 110 },
];

const days = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];
const dates = [14, 15, 16, 17, 18, 19, 20];
const scheduleSlots: Record<number, string[]> = {
  14: ["18:30", "19:00", "19:30", "20:00", "20:30"],
  15: ["18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"],
  16: ["17:30", "18:00", "20:00", "20:30", "21:00", "21:30", "22:00"],
  17: ["05:30", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30"],
  18: ["05:30", "06:00", "06:30", "07:00", "07:30", "08:00", "11:00", "11:30"],
  19: ["12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00"],
  20: ["18:30", "21:30", "22:00", "22:30"],
};

export default function TutorProfile() {
  const { id } = useParams();
  const tutor = tutorData[id || "1"] || tutorData["1"];
  const { t } = useLanguage();

  return (
    <Layout>
      <div className="container py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
          <Link to="/search" className="hover:text-primary transition-colors">Find Tutors</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link to="/search" className="hover:text-primary transition-colors">{tutor.subject} Tutors Online</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-medium">{tutor.name}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Hero card */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
              <div className="flex items-start gap-5">
                <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-3xl shrink-0 ring-2 ring-primary/20">
                  {tutor.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold text-foreground">{tutor.name}</h1>
                  <p className="text-muted-foreground text-sm mt-0.5">
                    {tutor.subject} tutor <span className="mx-1">·</span> From {tutor.origin}
                  </p>
                  <p className="text-sm text-foreground/80 mt-3 leading-relaxed">{tutor.headline}</p>
                </div>
              </div>
            </motion.div>

            {/* Highlights */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-8">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Highlights</h2>
              <p className="text-xs text-muted-foreground mb-3">Based on tutor data and real student reviews</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {tutor.highlights.map((h: string) => (
                  <Badge key={h} variant="secondary" className="px-3 py-1.5 text-sm font-medium">{h}</Badge>
                ))}
              </div>
              {tutor.superTutor && (
                <div className="flex items-start gap-2 mt-4 p-3 rounded-lg bg-accent/50 border border-accent">
                  <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Super Tutor</p>
                    <p className="text-xs text-muted-foreground">{tutor.superTutorDesc} <Link to="#" className="text-primary hover:underline">Learn more</Link></p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Teaches */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="mb-8">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Teaches</h2>
              <p className="text-sm text-foreground">{tutor.teaches}</p>
            </motion.div>

            {/* About me */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
              <h2 className="text-lg font-semibold text-foreground mb-3">About me</h2>
              <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {tutor.bio}
              </div>
            </motion.div>

            {/* I speak */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="mb-8">
              <h2 className="text-lg font-semibold text-foreground mb-3">I speak</h2>
              <div className="space-y-1.5">
                {tutor.languages.map((lang: { name: string; level: string }) => (
                  <div key={lang.name} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-foreground">{lang.name}</span>
                    <span className="text-xs text-muted-foreground">{lang.level}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Lesson rating */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }} className="mb-8">
              <h2 className="text-lg font-semibold text-foreground mb-4">Lesson rating</h2>
              <div className="space-y-3">
                {[
                  { label: "Reassurance", value: tutor.lessonRating.reassurance },
                  { label: "Clarity", value: tutor.lessonRating.clarity },
                  { label: "Progress", value: tutor.lessonRating.progress },
                  { label: "Preparation", value: tutor.lessonRating.preparation },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-4">
                    <span className="text-sm text-foreground w-28 shrink-0">{item.label}</span>
                    <Progress value={item.value * 20} className="flex-1 h-2" />
                    <span className="text-sm font-semibold tabular-nums w-8 text-right">{item.value}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">Based on {tutor.ratingReviewCount} anonymous student reviews</p>
            </motion.div>

            {/* Reviews */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="mb-8">
              <h2 className="text-lg font-semibold text-foreground mb-1">What my students say</h2>
              <div className="flex items-center gap-2 mb-5">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-warning text-warning" />
                  <span className="font-bold text-lg">{tutor.rating}</span>
                </div>
                <span className="text-sm text-muted-foreground">Based on {tutor.reviewCount} student reviews</span>
              </div>
              <div className="space-y-5">
                {reviewsData.map((review, i) => (
                  <div key={i} className="pb-5 border-b last:border-b-0 last:pb-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground">
                        {review.name === "Anonymous" ? "?" : review.name.charAt(0)}
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-foreground">{review.name}</span>
                        <p className="text-xs text-muted-foreground">
                          {review.lessonsCount} lessons · {review.date}
                          {review.edited && <span className="ml-1 italic">(edited)</span>}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{review.text}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Schedule */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="mb-8">
              <h2 className="text-lg font-semibold text-foreground mb-1">Schedule</h2>
              <p className="text-sm text-muted-foreground mb-4">Choose the time for your first lesson. The timings are displayed in your local timezone.</p>
              <div className="rounded-xl border bg-card overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
                  <p className="text-sm font-medium text-foreground">Mar 14 – 20, 2026</p>
                  <p className="text-xs text-muted-foreground">Asia/Tbilisi · GMT +4:00</p>
                </div>
                <div className="grid grid-cols-7 divide-x">
                  {days.map((day, i) => (
                    <div key={day} className="text-center">
                      <div className="py-2 border-b bg-muted/20">
                        <p className="text-xs text-muted-foreground">{day}</p>
                        <p className="text-sm font-semibold text-foreground">{dates[i]}</p>
                      </div>
                      <div className="p-1 space-y-1 max-h-48 overflow-y-auto">
                        {(scheduleSlots[dates[i]] || []).map((slot) => (
                          <button
                            key={slot}
                            className="w-full rounded border px-1 py-1 text-xs tabular-nums text-primary hover:bg-primary hover:text-primary-foreground transition-colors font-medium"
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Resume */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
              <h2 className="text-lg font-semibold text-foreground mb-4">Resume</h2>
              <div className="space-y-4">
                {tutor.resume.map((item: { period: string; org: string; role: string }, i: number) => (
                  <div key={i} className="flex gap-4">
                    <span className="text-xs text-muted-foreground w-28 shrink-0 pt-0.5">{item.period}</span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.org}</p>
                      <p className="text-xs text-muted-foreground">{item.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Specialties */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }} className="mb-8">
              <h2 className="text-lg font-semibold text-foreground mb-3">My specialties</h2>
              <div className="flex flex-wrap gap-2">
                {tutor.specialties.map((s: string) => (
                  <Badge key={s} variant="outline" className="px-3 py-1.5 text-sm">{s}</Badge>
                ))}
              </div>
            </motion.div>

            {/* Similar tutors */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }} className="mb-8">
              <h2 className="text-lg font-semibold text-foreground mb-4">You might also like</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {similarTutors
                  .filter((st) => st.id !== id)
                  .slice(0, 3)
                  .map((st) => (
                    <Link
                      key={st.id}
                      to={`/tutor/${st.id}`}
                      className="rounded-xl border bg-card p-4 hover:border-primary/40 transition-colors group"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                          {st.name.charAt(0)}{st.name.split(" ")[1]?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{st.name}</p>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-warning text-warning" />
                            <span className="text-xs font-medium">{st.rating}</span>
                            <span className="text-xs text-muted-foreground">({st.reviewCount})</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{st.headline}</p>
                      <p className="text-sm font-bold text-foreground mt-2">₾{st.price}<span className="text-xs font-normal text-muted-foreground">/ lesson</span></p>
                    </Link>
                  ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="w-full lg:w-[320px] shrink-0"
          >
            <div className="sticky top-20 space-y-4">
              <div className="rounded-xl border bg-card p-5 card-shadow">
                {/* Rating & stats */}
                <div className="flex items-center gap-2 mb-1">
                  <Star className="h-5 w-5 fill-warning text-warning" />
                  <span className="text-xl font-bold">{tutor.rating}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  {tutor.reviewCount} reviews · {tutor.lessons.toLocaleString()} lessons
                </p>

                {/* Price */}
                <div className="pb-4 mb-4 border-b">
                  <p className="text-2xl font-bold text-foreground tabular-nums">
                    ₾{tutor.price}
                    <span className="text-sm font-normal text-muted-foreground ml-1">{tutor.lessonLength} lesson</span>
                  </p>
                </div>

                {/* CTAs */}
                <div className="space-y-2.5">
                  <Button className="w-full hero-gradient text-primary-foreground border-0" asChild>
                    <Link to={`/booking/${id}`}>
                      <Video className="mr-2 h-4 w-4" />
                      Book trial lesson
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Send message
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="flex-1 text-muted-foreground">
                      <Heart className="mr-1.5 h-4 w-4" />
                      Save
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1 text-muted-foreground">
                      <Share2 className="mr-1.5 h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </div>

                {/* Free switch */}
                <div className="mt-4 p-3 rounded-lg bg-accent/50 border border-accent">
                  <p className="text-xs font-semibold text-foreground mb-0.5">Free switch</p>
                  <p className="text-xs text-muted-foreground">
                    If {tutor.name} isn't a match, get 2 more free trials to find the right tutor.
                  </p>
                </div>

                {/* Responsiveness */}
                <p className="text-xs text-muted-foreground mt-4 text-center">{tutor.responsiveness}</p>
              </div>
            </div>
          </motion.aside>
        </div>
      </div>
    </Layout>
  );
}
