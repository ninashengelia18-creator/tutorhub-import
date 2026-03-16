import { useParams, Link } from "react-router-dom";
import { Star, Globe, BookOpen, Calendar, CheckCircle, Video, Heart, Share2, MessageSquare, Shield, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Translation key-based tutor data
const tutorData: Record<string, {
  name: string;
  subjectKey: string;
  originKey: string;
  rating: number;
  reviewCount: number;
  price: number;
  lessonLength: string;
  photo: string;
  languages: { nameKey: string; levelKey: string }[];
  headlineKey: string;
  highlightKeys: string[];
  superTutor: boolean;
  superTutorDescKey: string;
  teachesKey: string;
  bioKey: string;
  experience: string;
  students: number;
  lessons: number;
  lessonRating: { overall: number; reassurance: number; clarity: number; progress: number; preparation: number };
  ratingReviewCount: number;
  resume: { period: string; orgKey: string; roleKey: string }[];
  specialtyKeys: string[];
  responsivenessKey: string;
}> = {
  "1": {
    name: "Nino B.",
    subjectKey: "td.math",
    originKey: "td.georgia",
    rating: 4.9,
    reviewCount: 127,
    price: 25,
    lessonLength: "50-min",
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face",
    languages: [
      { nameKey: "td.lang.georgian", levelKey: "td.level.native" },
      { nameKey: "td.lang.english", levelKey: "td.level.upperIntB2" },
    ],
    headlineKey: "td.nino.headline",
    highlightKeys: ["td.hl.patient", "td.hl.structured", "td.hl.goalFocused"],
    superTutor: true,
    superTutorDescKey: "td.nino.superDesc",
    teachesKey: "td.nino.teaches",
    bioKey: "td.nino.bio",
    experience: "10+",
    students: 340,
    lessons: 2800,
    lessonRating: { overall: 4.9, reassurance: 5.0, clarity: 4.9, progress: 4.8, preparation: 5.0 },
    ratingReviewCount: 42,
    resume: [
      { period: "2014 — Present", orgKey: "td.org.learneazy", roleKey: "td.role.seniorMathTutor" },
      { period: "2010 — 2014", orgKey: "td.org.tsu", roleKey: "td.role.teachingAssistant" },
    ],
    specialtyKeys: ["td.spec.algebra", "td.spec.calculus", "td.spec.examPrep"],
    responsivenessKey: "td.responds1hr",
  },
  "2": {
    name: "Giorgi K.",
    subjectKey: "td.physics",
    originKey: "td.georgia",
    rating: 4.8,
    reviewCount: 98,
    price: 30,
    lessonLength: "50-min",
    photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=face",
    languages: [
      { nameKey: "td.lang.georgian", levelKey: "td.level.native" },
      { nameKey: "td.lang.russian", levelKey: "td.level.native" },
    ],
    headlineKey: "td.giorgi.headline",
    highlightKeys: ["td.hl.encouraging", "td.hl.adaptable", "td.hl.clear"],
    superTutor: true,
    superTutorDescKey: "td.giorgi.superDesc",
    teachesKey: "td.giorgi.teaches",
    bioKey: "td.giorgi.bio",
    experience: "8",
    students: 210,
    lessons: 1900,
    lessonRating: { overall: 4.8, reassurance: 4.9, clarity: 4.8, progress: 4.7, preparation: 4.9 },
    ratingReviewCount: 30,
    resume: [
      { period: "2016 — Present", orgKey: "td.org.freelance", roleKey: "td.role.physicsTutor" },
      { period: "2012 — 2016", orgKey: "td.org.tsu", roleKey: "td.role.phdResearcher" },
    ],
    specialtyKeys: ["td.spec.mechanics", "td.spec.thermodynamics", "td.spec.examPrep"],
    responsivenessKey: "td.responds1hr",
  },
  "3": {
    name: "Ana M.",
    subjectKey: "td.english",
    originKey: "td.georgia",
    rating: 5.0,
    reviewCount: 215,
    price: 20,
    lessonLength: "50-min",
    photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face",
    languages: [
      { nameKey: "td.lang.english", levelKey: "td.level.native" },
      { nameKey: "td.lang.georgian", levelKey: "td.level.native" },
    ],
    headlineKey: "td.ana.headline",
    highlightKeys: ["td.hl.structured", "td.hl.patient", "td.hl.goalFocused", "td.hl.encouraging"],
    superTutor: true,
    superTutorDescKey: "td.ana.superDesc",
    teachesKey: "td.ana.teaches",
    bioKey: "td.ana.bio",
    experience: "12",
    students: 520,
    lessons: 4100,
    lessonRating: { overall: 5.0, reassurance: 5.0, clarity: 5.0, progress: 5.0, preparation: 5.0 },
    ratingReviewCount: 85,
    resume: [
      { period: "2012 — Present", orgKey: "td.org.learneazy", roleKey: "td.role.seniorEngTutor" },
      { period: "2010 — 2012", orgKey: "td.org.britishCouncil", roleKey: "td.role.engInstructor" },
    ],
    specialtyKeys: ["td.spec.ielts", "td.spec.toefl", "td.spec.businessEng", "td.spec.conversationalEng"],
    responsivenessKey: "td.responds1hr",
  },
  "4": {
    name: "Luka T.",
    subjectKey: "td.programming",
    originKey: "td.georgia",
    rating: 4.9,
    reviewCount: 164,
    price: 35,
    lessonLength: "50-min",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    languages: [
      { nameKey: "td.lang.english", levelKey: "td.level.upperIntB2" },
      { nameKey: "td.lang.georgian", levelKey: "td.level.native" },
    ],
    headlineKey: "td.luka.headline",
    highlightKeys: ["td.hl.structured", "td.hl.adaptable", "td.hl.patient"],
    superTutor: false,
    superTutorDescKey: "",
    teachesKey: "td.luka.teaches",
    bioKey: "td.luka.bio",
    experience: "6",
    students: 280,
    lessons: 2200,
    lessonRating: { overall: 4.9, reassurance: 4.8, clarity: 4.9, progress: 4.9, preparation: 4.8 },
    ratingReviewCount: 55,
    resume: [
      { period: "2020 — Present", orgKey: "td.org.freelance", roleKey: "td.role.progTutor" },
      { period: "2018 — 2020", orgKey: "td.org.tbcBank", roleKey: "td.role.softwareDev" },
    ],
    specialtyKeys: ["td.spec.python", "td.spec.javascript", "td.spec.react", "td.spec.dataScience"],
    responsivenessKey: "td.responds2hr",
  },
};

const reviewKeys = [
  { nameKey: "td.rev.sandro", lessonsCount: 39, date: "Jul 4, 2025", textKey: "td.rev.sandro.text", rating: 5 },
  { nameKey: "td.rev.natia", lessonsCount: 25, date: "Aug 19, 2025", textKey: "td.rev.natia.text", rating: 5, edited: true },
  { nameKey: "td.rev.alex", lessonsCount: 19, date: "Nov 6, 2025", textKey: "td.rev.alex.text", rating: 5 },
  { nameKey: "td.rev.anonymous", lessonsCount: 16, date: "Jun 22, 2025", textKey: "td.rev.anonymous.text", rating: 5, edited: true },
  { nameKey: "td.rev.mariam", lessonsCount: 9, date: "Jul 21, 2025", textKey: "td.rev.mariam.text", rating: 5 },
  { nameKey: "td.rev.tamta", lessonsCount: 7, date: "Feb 25, 2026", textKey: "td.rev.tamta.text", rating: 5 },
];

const similarTutors = [
  { id: "2", name: "Giorgi K.", rating: 5.0, reviewCount: 98, headlineKey: "td.giorgi.headline", price: 30, photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=face" },
  { id: "3", name: "Ana M.", rating: 5.0, reviewCount: 215, headlineKey: "td.ana.headline", price: 20, photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face" },
  { id: "4", name: "Luka T.", rating: 4.9, reviewCount: 164, headlineKey: "td.luka.headline", price: 35, photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face" },
];

const dayKeys = ["td.day.sat", "td.day.sun", "td.day.mon", "td.day.tue", "td.day.wed", "td.day.thu", "td.day.fri"];
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
          <Link to="/search" className="hover:text-primary transition-colors">{t("tp.findTutors")}</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link to="/search" className="hover:text-primary transition-colors">{t(tutor.subjectKey)} {t("tp.tutorsOnline")}</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-medium">{tutor.name}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Hero card */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
              <div className="flex items-start gap-5">
                <img src={tutor.photo} alt={tutor.name} className="h-24 w-24 rounded-full object-cover shrink-0 ring-2 ring-primary/20" loading="lazy" decoding="async" />
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold text-foreground">{tutor.name}</h1>
                  <p className="text-muted-foreground text-sm mt-0.5">
                    {t(tutor.subjectKey)} {t("tp.tutorFrom")} <span className="mx-1">·</span> {t("tp.from")} {t(tutor.originKey)}
                  </p>
                  <p className="text-sm text-foreground/80 mt-3 leading-relaxed">{t(tutor.headlineKey)}</p>
                </div>
              </div>
            </motion.div>

            {/* Highlights */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-8">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">{t("tp.highlights")}</h2>
              <p className="text-xs text-muted-foreground mb-3">{t("tp.basedOnData")}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {tutor.highlightKeys.map((hk) => (
                  <Badge key={hk} variant="secondary" className="px-3 py-1.5 text-sm font-medium">{t(hk)}</Badge>
                ))}
              </div>
              {tutor.superTutor && (
                <div className="flex items-start gap-2 mt-4 p-3 rounded-lg bg-accent/50 border border-accent">
                  <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t("tp.superTutor")}</p>
                    <p className="text-xs text-muted-foreground">{t(tutor.superTutorDescKey)} <Link to="#" className="text-primary hover:underline">{t("tp.learnMore")}</Link></p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Teaches */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="mb-8">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">{t("tp.teaches")}</h2>
              <p className="text-sm text-foreground">{t(tutor.teachesKey)}</p>
            </motion.div>

            {/* About me */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
              <h2 className="text-lg font-semibold text-foreground mb-3">{t("tp.aboutMe")}</h2>
              <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {t(tutor.bioKey)}
              </div>
            </motion.div>

            {/* I speak */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="mb-8">
              <h2 className="text-lg font-semibold text-foreground mb-3">{t("tp.iSpeak")}</h2>
              <div className="space-y-1.5">
                {tutor.languages.map((lang) => (
                  <div key={lang.nameKey} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-foreground">{t(lang.nameKey)}</span>
                    <span className="text-xs text-muted-foreground">{t(lang.levelKey)}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Lesson rating */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }} className="mb-8">
              <h2 className="text-lg font-semibold text-foreground mb-4">{t("tp.lessonRating")}</h2>
              <div className="space-y-3">
                {[
                  { label: t("tp.reassurance"), value: tutor.lessonRating.reassurance },
                  { label: t("tp.clarity"), value: tutor.lessonRating.clarity },
                  { label: t("tp.progress"), value: tutor.lessonRating.progress },
                  { label: t("tp.preparation"), value: tutor.lessonRating.preparation },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-4">
                    <span className="text-sm text-foreground w-28 shrink-0">{item.label}</span>
                    <Progress value={item.value * 20} className="flex-1 h-2" />
                    <span className="text-sm font-semibold tabular-nums w-8 text-right">{item.value}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">{t("tp.basedOnReviews").replace("{count}", String(tutor.ratingReviewCount))}</p>
            </motion.div>

            {/* Reviews */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="mb-8">
              <h2 className="text-lg font-semibold text-foreground mb-1">{t("tp.whatStudentsSay")}</h2>
              <div className="flex items-center gap-2 mb-5">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-warning text-warning" />
                  <span className="font-bold text-lg">{tutor.rating}</span>
                </div>
                <span className="text-sm text-muted-foreground">{t("tp.basedOnStudentReviews").replace("{count}", String(tutor.reviewCount))}</span>
              </div>
              <div className="space-y-5">
                {reviewKeys.map((review, i) => {
                  const name = t(review.nameKey);
                  return (
                    <div key={i} className="pb-5 border-b last:border-b-0 last:pb-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground">
                          {name === t("td.rev.anonymous") ? "?" : name.charAt(0)}
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-foreground">{name}</span>
                          <p className="text-xs text-muted-foreground">
                            {review.lessonsCount} {t("tp.lessons")} · {review.date}
                            {review.edited && <span className="ml-1 italic">{t("tp.edited")}</span>}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{t(review.textKey)}</p>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Schedule */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="mb-8">
              <h2 className="text-lg font-semibold text-foreground mb-1">{t("tp.schedule")}</h2>
              <p className="text-sm text-muted-foreground mb-4">{t("tp.scheduleDesc")}</p>
              <div className="rounded-xl border bg-card overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
                  <p className="text-sm font-medium text-foreground">{t("td.scheduleRange")}</p>
                  <p className="text-xs text-muted-foreground">Asia/Tbilisi · GMT +4:00</p>
                </div>
                <div className="grid grid-cols-7 divide-x">
                  {dayKeys.map((dayKey, i) => (
                    <div key={dayKey} className="text-center">
                      <div className="py-2 border-b bg-muted/20">
                        <p className="text-xs text-muted-foreground">{t(dayKey)}</p>
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
              <h2 className="text-lg font-semibold text-foreground mb-4">{t("tp.resume")}</h2>
              <div className="space-y-4">
                {tutor.resume.map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <span className="text-xs text-muted-foreground w-28 shrink-0 pt-0.5">{item.period}</span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{t(item.orgKey)}</p>
                      <p className="text-xs text-muted-foreground">{t(item.roleKey)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Specialties */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }} className="mb-8">
              <h2 className="text-lg font-semibold text-foreground mb-3">{t("tp.mySpecialties")}</h2>
              <div className="flex flex-wrap gap-2">
                {tutor.specialtyKeys.map((sk) => (
                  <Badge key={sk} variant="outline" className="px-3 py-1.5 text-sm">{t(sk)}</Badge>
                ))}
              </div>
            </motion.div>

            {/* Similar tutors */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }} className="mb-8">
              <h2 className="text-lg font-semibold text-foreground mb-4">{t("tp.youMightLike")}</h2>
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
                        <img src={st.photo} alt={st.name} className="h-10 w-10 rounded-full object-cover" loading="lazy" decoding="async" />
                        <div>
                          <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{st.name}</p>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-warning text-warning" />
                            <span className="text-xs font-medium">{st.rating}</span>
                            <span className="text-xs text-muted-foreground">({st.reviewCount})</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{t(st.headlineKey)}</p>
                      <p className="text-sm font-bold text-foreground mt-2">₾{st.price}<span className="text-xs font-normal text-muted-foreground">{t("tp.perLesson")}</span></p>
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
                  {tutor.reviewCount} {t("tp.reviews")} · {tutor.lessons.toLocaleString()} {t("tp.lessons")}
                </p>

                {/* Price */}
                <div className="pb-4 mb-4 border-b">
                  <p className="text-2xl font-bold text-foreground tabular-nums">
                    ₾{tutor.price}
                    <span className="text-sm font-normal text-muted-foreground ml-1">{tutor.lessonLength} {t("tp.lesson")}</span>
                  </p>
                </div>

                {/* CTAs */}
                <div className="space-y-2.5">
                  <Button className="w-full hero-gradient text-primary-foreground border-0" asChild>
                    <Link to={`/booking/${id}`}>
                      <Video className="mr-2 h-4 w-4" />
                      {t("tp.bookTrialLesson")}
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    {t("tp.sendMessage")}
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="flex-1 text-muted-foreground">
                      <Heart className="mr-1.5 h-4 w-4" />
                      {t("tp.save")}
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1 text-muted-foreground">
                      <Share2 className="mr-1.5 h-4 w-4" />
                      {t("tp.share")}
                    </Button>
                  </div>
                </div>

                {/* Free switch */}
                <div className="mt-4 p-3 rounded-lg bg-accent/50 border border-accent">
                  <p className="text-xs font-semibold text-foreground mb-0.5">{t("tp.freeSwitch")}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("tp.freeSwitchDesc").replace("{name}", tutor.name)}
                  </p>
                </div>

                {/* Responsiveness */}
                <p className="text-xs text-muted-foreground mt-4 text-center">{t(tutor.responsivenessKey)}</p>
              </div>
            </div>
          </motion.aside>
        </div>
      </div>
    </Layout>
  );
}
