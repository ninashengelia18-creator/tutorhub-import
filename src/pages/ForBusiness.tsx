import { Link } from "react-router-dom";
import { Building2, BarChart3, Clock, Brain, UserCheck, BadgePercent, Globe, Code, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
};

export default function ForBusiness() {
  const { t } = useLanguage();

  const features = [
    { icon: Building2, titleKey: "biz.feat1.title", descKey: "biz.feat1.desc" },
    { icon: BarChart3, titleKey: "biz.feat2.title", descKey: "biz.feat2.desc" },
    { icon: Clock, titleKey: "biz.feat3.title", descKey: "biz.feat3.desc" },
    { icon: Brain, titleKey: "biz.feat4.title", descKey: "biz.feat4.desc" },
    { icon: UserCheck, titleKey: "biz.feat5.title", descKey: "biz.feat5.desc" },
    { icon: BadgePercent, titleKey: "biz.feat6.title", descKey: "biz.feat6.desc" },
  ];

  const stats = [
    { value: "120+", labelKey: "biz.stat1" },
    { value: "3,500+", labelKey: "biz.stat2" },
    { value: "4.9/5", labelKey: "biz.stat3" },
    { value: "12+", labelKey: "biz.stat4" },
  ];

  const useCases = [
    { icon: Globe, titleKey: "biz.use1.title", descKey: "biz.use1.desc" },
    { icon: Code, titleKey: "biz.use2.title", descKey: "biz.use2.desc" },
    { icon: Users, titleKey: "biz.use3.title", descKey: "biz.use3.desc" },
  ];

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="container relative py-20 md:py-28 text-center max-w-3xl mx-auto">
          <motion.div {...fadeUp} className="space-y-6">
            <div className="mx-auto h-14 w-14 rounded-2xl hero-gradient flex items-center justify-center">
              <Building2 className="h-7 w-7 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-balance leading-[1.1]">
              {t("biz.title")}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
              {t("biz.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button size="lg" className="hero-gradient text-primary-foreground border-0 font-semibold">
                {t("biz.cta")}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">{t("biz.ctaSub")}</p>
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

      {/* Features */}
      <section className="container py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold">{t("biz.whyTitle")}</h2>
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

      {/* Use Cases */}
      <section className="bg-muted/30 py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold">{t("biz.useCases")}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {useCases.map((uc, i) => (
              <motion.div
                key={uc.titleKey}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="rounded-xl border bg-card p-6 card-shadow text-center"
              >
                <div className="mx-auto h-12 w-12 rounded-xl hero-gradient flex items-center justify-center mb-4">
                  <uc.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{t(uc.titleKey)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(uc.descKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-16">
        <div className="rounded-2xl hero-gradient p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-3">
            {t("biz.contactTitle")}
          </h2>
          <p className="text-primary-foreground/80 mb-6 max-w-md mx-auto">
            {t("biz.contactSub")}
          </p>
          <Button size="lg" variant="secondary" className="font-semibold">
            {t("biz.contactBtn")} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>
    </Layout>
  );
}
