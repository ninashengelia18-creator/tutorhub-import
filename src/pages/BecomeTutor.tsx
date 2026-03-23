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
    { qKey: "tutor.faq1.q", aKey: "tutor.faq1.a" },
    { qKey: "tutor.faq2.q", aKey: "tutor.faq2.a" },
    { qKey: "tutor.faq3.q", aKey: "tutor.faq3.a" },
    { qKey: "tutor.faq5.q", aKey: "tutor.faq5.a" },
    { qKey: "tutor.faq6.q", aKey: "tutor.faq6.a" },
    { qKey: "tutor.faq7.q", aKey: "tutor.faq7.a" },
    
  ];

  return (
    <Layout>
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

      {/* AI Whisper Section */}
      <section className="container py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
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
                src={tutorHeroImg}
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
                  {t(faq.qKey)}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {t(faq.aKey)}
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
