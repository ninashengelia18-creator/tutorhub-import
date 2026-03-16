import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Star, Globe, BookOpen, Calendar, CheckCircle, Video, Heart, Share2, MessageSquare, Shield, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { isTutorSaved, subscribeToSavedTutors, toggleSavedTutor } from "@/lib/savedTutors";

// Translation key-based tutor data
const tutorData: Record<string, {
  name: string;
  subjectKey: string;
  originKey: string;
  rating: number;
  reviewCount: number;
  price: number;
  lessonLengthKey: string;
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
    lessonLengthKey: "booking.duration50",
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
    lessonLengthKey: "booking.duration50",
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
    lessonLengthKey: "booking.duration50",
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
    lessonLengthKey: "booking.duration50",
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

const actionCopy = {
  en: {
    loginRequired: "Please log in as a student to message tutors.",
    messageFailed: "Unable to open messages right now.",
    saved: "Tutor saved",
    removed: "Tutor removed",
    shared: "Profile link copied",
  },
  ka: {
    loginRequired: "რეპეტიტორთან დასაკავშირებლად შედით სტუდენტის ანგარიშით.",
    messageFailed: "შეტყობინებების გახსნა ახლა ვერ მოხერხდა.",
    saved: "რეპეტიტორი შენახულია",
    removed: "რეპეტიტორი წაიშალა",
    shared: "პროფილის ბმული დაკოპირდა",
  },
  ru: {
    loginRequired: "Чтобы написать репетитору, войдите как студент.",
    messageFailed: "Сейчас не удалось открыть сообщения.",
    saved: "Репетитор сохранен",
    removed: "Репетитор удален",
    shared: "Ссылка на профиль скопирована",
  },
} as const;

export default function TutorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const tutor = tutorData[id || "1"] || tutorData["1"];
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const text = useMemo(() => actionCopy[lang], [lang]);
  const [saved, setSaved] = useState(() => isTutorSaved(id || "1"));

  useEffect(() => {
    setSaved(isTutorSaved(id || "1"));
    return subscribeToSavedTutors(() => setSaved(isTutorSaved(id || "1")));
  }, [id]);

  const handleMessageTutor = async () => {
    if (!user) {
      navigate(`/login?portal=student&redirect=${encodeURIComponent(`/messages?tutor=${tutor.name}`)}`);
      toast({ title: text.loginRequired });
      return;
    }

    const { error } = await supabase.from("message_conversations").upsert(
      {
        student_id: user.id,
        tutor_name: tutor.name,
        archived_by_student: false,
        deleted_by_student: false,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "student_id,tutor_name" },
    );

    if (error) {
      toast({ title: text.messageFailed, variant: "destructive" });
      return;
    }

    navigate(`/messages?tutor=${encodeURIComponent(tutor.name)}`);
  };

  const handleToggleSave = () => {
    const nextSaved = toggleSavedTutor({
      id: id || "1",
      name: tutor.name,
      subject: tutor.subjectKey,
      price: tutor.price,
      photo: tutor.photo,
    });

    setSaved(nextSaved);
    toast({ title: nextSaved ? text.saved : text.removed });
  };

  const handleShareProfile = async () => {
    const url = typeof window !== "undefined" ? window.location.href : `/tutor/${id || "1"}`;

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: `${tutor.name} · LearnEazy`,
          text: `${t(tutor.subjectKey)} · ${tutor.name}`,
          url,
        });
        return;
      }

      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        toast({ title: text.shared });
      }
    } catch {
      // Ignore cancelled native share dialogs.
    }
  };

  return (
    <Layout>
      <div className="container py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-1 text-sm text-muted-foreground">
          <Link to="/search" className="transition-colors hover:text-primary">{t("tp.findTutors")}</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link to="/search" className="transition-colors hover:text-primary">{t(tutor.subjectKey)} {t("tp.tutorsOnline")}</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-foreground">{tutor.name}</span>
        </nav>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Main content */}
          <div className="min-w-0 flex-1">
            {/* Hero card */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
              <div className="flex items-start gap-5">
                <img src={tutor.photo} alt={tutor.name} className="h-24 w-24 shrink-0 rounded-full object-cover ring-2 ring-primary/20" loading="lazy" decoding="async" />
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl font-bold text-foreground">{tutor.name}</h1>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {t(tutor.subjectKey)} {t("tp.tutorFrom")} <span className="mx-1">·</span> {t("tp.from")} {t(tutor.originKey)}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-foreground/80">{t(tutor.headlineKey)}</p>
                </div>
              </div>
            </motion.div>

            {/* Highlights */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-8">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{t("tp.highlights")}</h2>
              <p className="mb-3 text-xs text-muted-foreground">{t("tp.basedOnData")}</p>
              <div className="mb-3 flex flex-wrap gap-2">
                {tutor.highlightKeys.map((hk) => (
                  <Badge key={hk} variant="secondary" className="px-3 py-1.5 text-sm font-medium">{t(hk)}</Badge>
                ))}
              </div>
              {tutor.superTutor && (
                <div className="mt-4 flex items-start gap-2 rounded-lg border border-accent bg-accent/50 p-3">
                  <Shield className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t("tp.superTutor")}</p>
                    <p className="text-xs text-muted-foreground">{t(tutor.superTutorDescKey)} <Link to="#" className="text-primary hover:underline">{t("tp.learnMore")}</Link></p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Teaches */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="mb-8">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{t("tp.teaches")}</h2>
              <p className="text-sm text-foreground">{t(tutor.teachesKey)}</p>
            </motion.div>

            {/* About me */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
              <h2 className="mb-3 text-lg font-semibold text-foreground">{t("tp.aboutMe")}</h2>
              <div className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {t(tutor.bioKey)}
              </div>
            </motion.div>

            {/* I speak */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="mb-8">
              <h2 className="mb-3 text-lg font-semibold text-foreground">{t("tp.iSpeak")}</h2>
              <div className="space-y-1.5">
                {tutor.languages.map((language) => (
                  <div key={language.nameKey} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-foreground">{t(language.nameKey)}</span>
                    <span className="text-xs text-muted-foreground">{t(language.levelKey)}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Lesson rating */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }} className="mb-8">
              <h2 className="mb-4 text-lg font-semibold text-foreground">{t("tp.lessonRating")}</h2>
              <div className="space-y-3">
                {[
                  { label: t("tp.reassurance"), value: tutor.lessonRating.reassurance },
                  { label: t("tp.clarity"), value: tutor.lessonRating.clarity },
                  { label: t("tp.progress"), value: tutor.lessonRating.progress },
                  { label: t("tp.preparation"), value: tutor.lessonRating.preparation },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-4">
                    <span className="w-28 shrink-0 text-sm text-foreground">{item.label}</span>
                    <Progress value={item.value * 20} className="h-2 flex-1" />
                    <span className="w-8 text-right text-sm font-semibold tabular-nums">{item.value}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">{t("tp.basedOnReviews").replace("{count}", String(tutor.ratingReviewCount))}</p>
            </motion.div>

            {/* Reviews */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="mb-8">
              <h2 className="mb-1 text-lg font-semibold text-foreground">{t("tp.whatStudentsSay")}</h2>
              <div className="mb-5 flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-warning text-warning" />
                  <span className="text-lg font-bold">{tutor.rating}</span>
                </div>
                <span className="text-sm text-muted-foreground">{t("tp.basedOnStudentReviews").replace("{count}", String(tutor.reviewCount))}</span>
              </div>
              <div className="space-y-5">
                {reviewKeys.map((review, i) => {
                  const name = t(review.nameKey);
                  return (
                    <div key={i} className="border-b pb-5 last:border-b-0 last:pb-0">
                      <div className="mb-2 flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
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
                      <p className="text-sm leading-relaxed text-muted-foreground">{t(review.textKey)}</p>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Schedule */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="mb-8">
              <h2 className="mb-1 text-lg font-semibold text-foreground">{t("tp.schedule")}</h2>
              <p className="mb-4 text-sm text-muted-foreground">{t("tp.scheduleDesc")}</p>
              <div className="overflow-hidden rounded-xl border bg-card">
                <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3">
                  <p className="text-sm font-medium text-foreground">{t("td.scheduleRange")}</p>
                  <p className="text-xs text-muted-foreground">Asia/Tbilisi · GMT +4:00</p>
                </div>
                <div className="grid grid-cols-7 divide-x">
                  {dayKeys.map((dayKey, i) => (
                    <div key={dayKey} className="text-center">
                      <div className="border-b bg-muted/20 py-2">
                        <p className="text-xs text-muted-foreground">{t(dayKey)}</p>
                        <p className="text-sm font-semibold text-foreground">{dates[i]}</p>
                      </div>
                      <div className="max-h-48 space-y-1 overflow-y-auto p-1">
                        {(scheduleSlots[dates[i]] || []).map((slot) => (
                          <button
                            key={slot}
                            className="w-full rounded border px-1 py-1 text-xs font-medium tabular-nums text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
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
              <h2 className="mb-4 text-lg font-semibold text-foreground">{t("tp.resume")}</h2>
              <div className="space-y-4">
                {tutor.resume.map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <span className="w-28 shrink-0 pt-0.5 text-xs text-muted-foreground">{item.period}</span>
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
              <h2 className="mb-3 text-lg font-semibold text-foreground">{t("tp.mySpecialties")}</h2>
              <div className="flex flex-wrap gap-2">
                {tutor.specialtyKeys.map((sk) => (
                  <Badge key={sk} variant="outline" className="px-3 py-1.5 text-sm">{t(sk)}</Badge>
                ))}
              </div>
            </motion.div>

            {/* Similar tutors */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }} className="mb-8">
              <h2 className="mb-4 text-lg font-semibold text-foreground">{t("tp.youMightLike")}</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {similarTutors
                  .filter((st) => st.id !== id)
                  .slice(0, 3)
                  .map((st) => (
                    <Link
                      key={st.id}
                      to={`/tutor/${st.id}`}
                      className="group rounded-xl border bg-card p-4 transition-colors hover:border-primary/40"
                    >
                      <div className="mb-2 flex items-center gap-3">
                        <img src={st.photo} alt={st.name} className="h-10 w-10 rounded-full object-cover" loading="lazy" decoding="async" />
                        <div>
                          <p className="text-sm font-semibold text-foreground transition-colors group-hover:text-primary">{st.name}</p>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-warning text-warning" />
                            <span className="text-xs font-medium">{st.rating}</span>
                            <span className="text-xs text-muted-foreground">({st.reviewCount})</span>
                          </div>
                        </div>
                      </div>
                      <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{t(st.headlineKey)}</p>
                      <p className="mt-2 text-sm font-bold text-foreground">₾{st.price}<span className="text-xs font-normal text-muted-foreground">{t("tp.perLesson")}</span></p>
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
            className="w-full shrink-0 lg:w-[320px]"
          >
            <div className="sticky top-20 space-y-4">
              <div className="card-shadow rounded-xl border bg-card p-5">
                {/* Rating & stats */}
                <div className="mb-1 flex items-center gap-2">
                  <Star className="h-5 w-5 fill-warning text-warning" />
                  <span className="text-xl font-bold">{tutor.rating}</span>
                </div>
                <p className="mb-4 text-xs text-muted-foreground">
                  {tutor.reviewCount} {t("tp.reviews")} · {tutor.lessons.toLocaleString()} {t("tp.lessons")}
                </p>

                {/* Price */}
                <div className="mb-4 border-b pb-4">
                  <p className="text-2xl font-bold tabular-nums text-foreground">
                    ₾{tutor.price}
                    <span className="ml-1 text-sm font-normal text-muted-foreground">{t(tutor.lessonLengthKey)} {t("tp.lesson")}</span>
                  </p>
                </div>

                {/* CTAs */}
                <div className="space-y-2.5">
                  <Button className="hero-gradient w-full border-0 text-primary-foreground" asChild>
                    <Link to={`/booking/${id}`}>
                      <Video className="mr-2 h-4 w-4" />
                      {t("tp.bookTrialLesson")}
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => void handleMessageTutor()}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    {t("tp.sendMessage")}
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="flex-1 text-muted-foreground" onClick={handleToggleSave}>
                      <Heart className={`mr-1.5 h-4 w-4 ${saved ? "fill-primary text-primary" : ""}`} />
                      {t("tp.save")}
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1 text-muted-foreground" onClick={() => void handleShareProfile()}>
                      <Share2 className="mr-1.5 h-4 w-4" />
                      {t("tp.share")}
                    </Button>
                  </div>
                </div>

                {/* Free switch */}
                <div className="mt-4 rounded-lg border border-accent bg-accent/50 p-3">
                  <p className="mb-0.5 text-xs font-semibold text-foreground">{t("tp.freeSwitch")}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("tp.freeSwitchDesc").replace("{name}", tutor.name)}
                  </p>
                </div>

                {/* Responsiveness */}
                <p className="mt-4 text-center text-xs text-muted-foreground">{t(tutor.responsivenessKey)}</p>
              </div>
            </div>
          </motion.aside>
        </div>
      </div>
    </Layout>
  );
}
