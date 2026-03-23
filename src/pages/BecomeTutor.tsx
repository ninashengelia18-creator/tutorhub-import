import { Link } from "react-router-dom";
import { DollarSign, Clock, TrendingUp, Users, Calendar, Monitor, Banknote, Headphones, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import tutorHeroImg from "@/assets/tutor-hero.jpg";
import aiWhisperLogo from "@/assets/ai-whisper-logo.png";
import tutorTeachingImg from "@/assets/tutor-teaching.jpg";

export default function BecomeTutor() {
  const { t } = useLanguage();

  const steps = [
    { num: 1, titleKey: "tutor.step1.title", descKey: "tutor.step1.desc" },
    { num: 2, titleKey: "tutor.step2.title", descKey: "tutor.step2.desc" },
    { num: 3, titleKey: "tutor.step3.title", descKey: "tutor.step3.desc" },
  ];

  const benefits = [
    { icon: DollarSign, titleKey: "tutor.feat1.title", descKey: "tutor.feat1.desc" },
    { icon: Clock, titleKey: "tutor.feat2.title", descKey: "tutor.feat2.desc" },
    { icon: TrendingUp, titleKey: "tutor.feat3.title", descKey: "tutor.feat3.desc" },
  ];

  const platformFeatures = [
    { icon: Users, key: "tutor.pf1" },
    { icon: Calendar, key: "tutor.pf2" },
    { icon: Monitor, key: "tutor.pf3" },
    { icon: Banknote, key: "tutor.pf4" },
    { icon: TrendingUp, key: "tutor.pf5" },
    { icon: Headphones, key: "tutor.pf6" },
  ];

  const faqs = [
    { q: "What kind of tutors does LearnEazy look for?", a: "LearnEazy has two roles — Tutors and Language Buddies.\n\nTutors should have strong subject knowledge, excellent communication skills, and the ability to explain concepts clearly. A formal teaching certificate is not required but experience tutoring or teaching is a plus.\n\nLanguage Buddies are native or fluent speakers who want to help others practice conversation. No teaching experience or qualifications needed — just fluency, patience, and a friendly personality." },
    { q: "What subjects can I teach?", a: "Tutors can teach a wide range of subjects including K-12 Math, English/ELA, Biology, Chemistry, Physics, Coding, GCSE and A-Level subjects, University level Maths and English, ESL, Business English, IELTS and TOEFL prep, and Coding for Career Change.\n\nLanguage Buddies offer conversation practice in English, Spanish, French, German, Italian, Portuguese, Arabic, and Mandarin Chinese.\n\nIf a subject or language isn't listed, mention it in the application and the team will consider it." },
    { q: "How do I become a tutor or Language Buddy at LearnEazy?", a: "Click \"Become a Tutor\" or \"Become a Language Buddy\" on the website and complete the short application form. The team reviews every application and applicants hear back within 2–3 business days. Once approved, set up a profile, add availability, and start receiving bookings." },
    { q: "Why should I teach on LearnEazy?", a: "LearnEazy offers full flexibility — tutors and Language Buddies set their own schedule, their own rate, and teach from anywhere in the world. Tutors also get exclusive access to AI Whisper, an AI-powered session coaching tool that provides real-time support during lessons and sends a detailed post-session report for continuous improvement. Language Buddies enjoy a relaxed, conversation-based experience with no lesson planning required. No other tutoring platform offers this level of support." },
    { q: "What computer equipment do I need?", a: "A reliable computer or laptop, a stable internet connection, a webcam, and a microphone are required. A headset is recommended for better audio quality. Sessions run via Google Meet so no additional software is needed — just a browser." },
    { q: "Is it free to create a profile on LearnEazy?", a: "Yes, completely free. There are no signup fees or monthly charges. LearnEazy takes a small commission only when a session is completed — so tutors and Language Buddies only pay when they earn." },
    { q: "How does payment work?", a: "After a session is completed, earnings are calculated based on the agreed lesson rate minus LearnEazy's commission. Payouts are processed via bank transfer. Full details on commission rates are available in the tutor dashboard after approval." },
    { q: "What is the cancellation policy?", a: "If a tutor or Language Buddy needs to cancel a session, students must be notified as early as possible. Repeated cancellations may affect profile visibility and standing on the platform." },
  ];

  return (
    <Layout>
      {/* AI Whisper Section — top of page */}
      <section className="container py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row items-center gap-6 rounded-2xl border border-primary/20 bg-primary/5 p-8 md:p-10"
        >
          <img src={aiWhisperLogo} alt="AI Whisper" className="h-36 w-36 object-contain flex-shrink-0" />
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl font-bold text-foreground">Powered by AI Whisper</h3>
            <p className="text-muted-foreground leading-relaxed">
              LearnEazy tutors have access to AI Whisper — an AI-powered session assistant that joins your lessons and supports you in real time. Get live coaching nudges as you teach, and receive a full post-session report covering student engagement, attention levels, and key moments. No other tutoring platform gives you this level of support.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Hero — Preply-style split layout */}
      <section className="container py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold leading-[1.1] tracking-tight">
              {t("tutor.heroHeadline")}
            </h1>

            {/* Steps timeline */}
            <div className="space-y-6">
              {steps.map((step, i) => (
                <div key={step.num} className="flex items-start gap-4">
                  <div className="relative flex flex-col items-center">
                    <div className="h-10 w-10 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-sm shrink-0">
                      {step.num}
                    </div>
                    {i < steps.length - 1 && (
                      <div className="w-0.5 h-8 bg-border mt-1" />
                    )}
                  </div>
                  <div className="pt-1.5">
                    <h3 className="font-bold text-lg">{t(step.titleKey)}</h3>
                    <p className="text-sm text-muted-foreground">{t(step.descKey)}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button size="lg" className="hero-gradient text-primary-foreground border-0 font-semibold text-base px-8" asChild>
              <Link to="/tutor-apply">{t("tutor.cta")} <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <img
              src={tutorHeroImg}
              alt="Online tutor teaching"
              className="rounded-2xl w-full object-cover shadow-lg"
              loading="lazy"
              decoding="async"
            />
          </motion.div>
        </div>
      </section>


      {/* Benefits — 3 columns */}
      <section className="container py-16">
        <div className="grid md:grid-cols-3 gap-10">
          {benefits.map((b, i) => (
            <motion.div
              key={b.titleKey}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <h3 className="text-xl md:text-2xl font-bold mb-3">{t(b.titleKey)}</h3>
              <p className="text-muted-foreground leading-relaxed">{t(b.descKey)}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Teach students — split with features list */}
      <section className="container py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-3xl md:text-4xl font-bold leading-tight">
              {t("tutor.teachStudentsTitle")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("tutor.teachStudentsDesc")}
            </p>
            <ul className="space-y-3">
              {platformFeatures.map((pf) => (
                <li key={pf.key} className="flex items-center gap-3">
                  <pf.icon className="h-5 w-5 text-primary shrink-0" />
                  <span className="font-medium">{t(pf.key)}</span>
                </li>
              ))}
            </ul>
            <Button size="lg" className="hero-gradient text-primary-foreground border-0 font-semibold" asChild>
              <Link to="/tutor-apply">{t("tutor.cta")} <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="rounded-2xl overflow-hidden">
              <img
                src={tutorTeachingImg}
                alt="Tutor teaching online"
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-8">{t("tutor.faqTitle")}</h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left font-semibold text-base">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </section>

      {/* Bottom CTA */}
      <section className="container py-16">
        <div className="rounded-2xl hero-gradient p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-3">
            {t("tutor.readyTitle")}
          </h2>
          <p className="text-primary-foreground/80 mb-6 max-w-md mx-auto">
            {t("tutor.readySub")}
          </p>
          <Button size="lg" variant="secondary" className="font-semibold" asChild>
            <Link to="/tutor-apply">{t("tutor.readyBtn")} <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}
