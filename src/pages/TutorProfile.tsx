import { useParams, Link } from "react-router-dom";
import { Star, Clock, Globe, BookOpen, Calendar, CheckCircle, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";

const tutorData: Record<string, any> = {
  "1": { name: "Nino Beridze", subject: "Mathematics", rating: 4.9, reviews: 127, price: 35, avatar: "NB", languages: ["Georgian", "English"], bio: "With over 10 years of experience teaching mathematics, I specialize in making complex concepts accessible and engaging. From algebra to calculus, I tailor each lesson to your learning style and goals.", experience: "10+ years", students: 340, lessons: 2800 },
  "2": { name: "Giorgi Kharadze", subject: "Physics", rating: 4.8, reviews: 98, price: 40, avatar: "GK", languages: ["Georgian", "Russian"], bio: "PhD in Physics from Tbilisi State University. I believe physics should be intuitive, not intimidating. My students consistently improve their grades and develop a genuine curiosity for science.", experience: "8 years", students: 210, lessons: 1900 },
  "3": { name: "Ana Melikishvili", subject: "English", rating: 5.0, reviews: 215, price: 30, avatar: "AM", languages: ["English", "Georgian"], bio: "IELTS & TOEFL specialist with a Cambridge CELTA certification. I help students achieve their target scores with structured preparation and real exam practice.", experience: "12 years", students: 520, lessons: 4100 },
  "4": { name: "Luka Tsiklauri", subject: "Programming", rating: 4.9, reviews: 164, price: 45, avatar: "LT", languages: ["English", "Georgian"], bio: "Full-stack developer with experience at top tech companies. I teach Python, JavaScript, React, and data science. Project-based learning approach.", experience: "6 years", students: 280, lessons: 2200 },
};

const timeSlots = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "18:00", "19:00"];

const reviewsData = [
  { name: "Sandro M.", rating: 5, text: "Excellent teacher! Very patient and clear explanations.", date: "2 days ago" },
  { name: "Natia K.", rating: 5, text: "Helped me pass my university entrance exam. Highly recommend!", date: "1 week ago" },
  { name: "Alex T.", rating: 4, text: "Great tutor, lessons are well structured and engaging.", date: "2 weeks ago" },
];

export default function TutorProfile() {
  const { id } = useParams();
  const tutor = tutorData[id || "1"] || tutorData["1"];

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content */}
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border bg-card p-6 card-shadow mb-6"
            >
              <div className="flex items-start gap-4">
                <div className="h-20 w-20 rounded-lg bg-primary-light flex items-center justify-center text-primary font-bold text-2xl shrink-0">
                  {tutor.avatar}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold">{tutor.name}</h1>
                  <p className="text-primary font-medium">{tutor.subject} Tutor</p>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-warning text-warning" />
                      <span className="font-semibold tabular-nums">{tutor.rating}</span>
                      <span className="text-sm text-muted-foreground">({tutor.reviews} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Globe className="h-3.5 w-3.5" />
                      {tutor.languages.join(", ")}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
                <div className="text-center">
                  <p className="text-xl font-bold tabular-nums">{tutor.experience}</p>
                  <p className="text-xs text-muted-foreground">Experience</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold tabular-nums">{tutor.students}</p>
                  <p className="text-xs text-muted-foreground">Students</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold tabular-nums">{tutor.lessons.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Lessons</p>
                </div>
              </div>
            </motion.div>

            {/* About */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl border bg-card p-6 card-shadow mb-6"
            >
              <h2 className="font-semibold text-lg mb-3">About me</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{tutor.bio}</p>
            </motion.div>

            {/* Reviews */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl border bg-card p-6 card-shadow"
            >
              <h2 className="font-semibold text-lg mb-4">Student Reviews</h2>
              <div className="space-y-4">
                {reviewsData.map((review, i) => (
                  <div key={i} className="pb-4 border-b last:border-b-0 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center text-xs font-medium">
                          {review.name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium">{review.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{review.date}</span>
                    </div>
                    <div className="flex gap-0.5 mb-1">
                      {Array.from({ length: review.rating }).map((_, j) => (
                        <Star key={j} className="h-3 w-3 fill-warning text-warning" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">{review.text}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Booking sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="w-full lg:w-80 shrink-0"
          >
            <div className="sticky top-20 rounded-xl border bg-card p-5 card-shadow space-y-5">
              <div className="text-center pb-4 border-b">
                <p className="text-3xl font-bold tabular-nums">${tutor.price}<span className="text-sm font-normal text-muted-foreground">/hr</span></p>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Available Times
                </h3>
                <div className="grid grid-cols-4 gap-1.5">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      className="rounded-md border px-2 py-1.5 text-xs font-medium tabular-nums hover:border-primary hover:text-primary transition-colors"
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <Button className="w-full hero-gradient text-primary-foreground border-0" asChild>
                <Link to={`/booking/${id}`}>
                  <Video className="mr-2 h-4 w-4" />
                  Book Trial Lesson
                </Link>
              </Button>

              <Button variant="outline" className="w-full">
                <BookOpen className="mr-2 h-4 w-4" />
                Send Message
              </Button>

              <div className="space-y-2 pt-3 border-t">
                {["Free trial lesson", "Cancel anytime", "AI-powered classroom"].map((feat) => (
                  <div key={feat} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-3.5 w-3.5 text-success shrink-0" />
                    {feat}
                  </div>
                ))}
              </div>
            </div>
          </motion.aside>
        </div>
      </div>
    </Layout>
  );
}
