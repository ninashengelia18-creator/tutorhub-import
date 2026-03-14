import { Link } from "react-router-dom";
import { GraduationCap, DollarSign, Clock, Brain, Star, Shield, Users, FileText, CheckCircle, ArrowRight, UserPlus, BadgeCheck, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
};

export default function BecomeTutor() {
  const { t } = useLanguage();

  const features = [
    { icon: DollarSign, titleKey: "tutor.feat1.title", descKey: "tutor.feat1.desc" },
    { icon: Clock, titleKey: "tutor.feat2.title", descKey: "tutor.feat2.desc" },
    { icon: Brain, titleKey: "tutor.feat3.title", descKey: "tutor.feat3.desc" },
    { icon: Star, titleKey: "tutor.feat4.title", descKey: "tutor.feat4.desc" },
    { icon: Shield, titleKey: "tutor.feat5.title", descKey: "tutor.feat5.desc" },
    { icon: Users, titleKey: "tutor.feat6.title", descKey: "tutor.feat6.desc" },
  ];

  const stats = [
    { value: "5,000+", labelKey: "tutor.stat1" },
    { value: "₾2,400", labelKey: "tutor.stat2" },
    { value: "96%", labelKey: "tutor.stat3" },
    { value: "30+", labelKey: "tutor.stat4" },
  ];

  const steps = [
    { icon: FileText, titleKey: "tutor.step1.title", descKey: "tutor.step1.desc" },
    { icon: BadgeCheck, titleKey: "tutor.step2.title", descKey: "tutor.step2.desc" },
    { icon: BookOpen, titleKey: "tutor.step3.title", descKey: "tutor.step3.desc" },
  ];

  const requirements = [
    "tutor.req1", "tutor.req2", "tutor.req3", "tutor.req4", "tutor.req5",
  ];

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="container relative py-20 md:py-28 text-center max-w-3xl mx-auto">
          <motion.div {...fadeUp} className="space-y-6">
            <div className="mx-auto h-14 w-14 rounded-2xl hero-gradient flex items-center justify-center">
              <GraduationCap className="h-7 w-7 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-balance leading-[1.1]">
              {t("tutor.title")}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
              {t("tutor.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button size="lg" className="hero-gradient text-primary-foreground border-0 font-semibold">
                {t("tutor.cta")} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">{t("tutor.ctaSub")}</p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.labelKey}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="py-8 text-center border-r last:border-r-0"
              >
                <p className="text-2xl md:text-3xl font-bold text-primary tabular-nums">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{t(stat.labelKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Teach */}
      <section className="container py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold">{t("tutor.whyTitle")}</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, i) => (
            <motion.div
              key={feat.titleKey}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-xl border bg-card p-6 card-shadow hover:card-shadow-hover transition-all"
            >
              <div className="h-10 w-10 rounded-lg bg-primary-light flex items-center justify-center mb-4">
                <feat.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-base mb-2">{t(feat.titleKey)}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{t(feat.descKey)}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-muted/30 py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold">{t("tutor.howTitle")}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.titleKey}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className="mx-auto h-14 w-14 rounded-xl hero-gradient flex items-center justify-center mb-4">
                  <step.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="text-xs font-bold text-primary mb-2">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="font-semibold text-lg mb-2">{t(step.titleKey)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(step.descKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="container py-16">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">{t("tutor.reqTitle")}</h2>
          <div className="rounded-xl border bg-card p-6 card-shadow space-y-4">
            {requirements.map((reqKey, i) => (
              <motion.div
                key={reqKey}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-3"
              >
                <CheckCircle className="h-5 w-5 text-success shrink-0" />
                <p className="text-sm font-medium">{t(reqKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-16">
        <div className="rounded-2xl hero-gradient p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-3">
            {t("tutor.readyTitle")}
          </h2>
          <p className="text-primary-foreground/80 mb-6 max-w-md mx-auto">
            {t("tutor.readySub")}
          </p>
          <Button size="lg" variant="secondary" className="font-semibold">
            {t("tutor.readyBtn")} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>
    </Layout>
  );
}
