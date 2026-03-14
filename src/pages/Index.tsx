import { Link } from "react-router-dom";
import { ArrowRight, Star, Landmark, BookOpen, Languages, Code, Music, Palette, Calculator, ChevronRight, Users, Briefcase, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import heroImage from "@/assets/hero-tutor.jpg";

const stats = [
  { value: "5,000+", labelKey: "stats.tutors" },
  { value: "50,000+", labelKey: "stats.reviews" },
  { value: "120+", labelKey: "stats.subjects" },
  { value: "30+", labelKey: "stats.nationalities" },
  { value: "4.8", labelKey: "stats.appRating", isStar: true },
];

const subjectCards = [
  { icon: Languages, nameKey: "home.subj.english", count: "2,450", href: "/search?subject=English" },
  { icon: Languages, nameKey: "home.subj.georgian", count: "860", href: "/search?subject=Georgian" },
  { icon: Languages, nameKey: "home.subj.russian", count: "1,120", href: "/search?subject=Russian" },
  { icon: Calculator, nameKey: "home.subj.math", count: "980", href: "/search?subject=Mathematics" },
  { icon: Code, nameKey: "home.subj.programming", count: "740", href: "/search?subject=Programming" },
  { icon: BookOpen, nameKey: "home.subj.physics", count: "520", href: "/search?subject=Physics" },
  { icon: Music, nameKey: "home.subj.music", count: "310", href: "/search?subject=Music" },
  { icon: Palette, nameKey: "home.subj.art", count: "280", href: "/search?subject=Art" },
  { icon: Briefcase, nameKey: "home.subj.business", count: "640", href: "/search?subject=Business" },
];

const howSteps = [
  { num: 1, titleKey: "home.how1.title", descKey: "home.how1.desc" },
  { num: 2, titleKey: "home.how2.title", descKey: "home.how2.desc" },
  { num: 3, titleKey: "home.how3.title", descKey: "home.how3.desc" },
];

const Index = () => {
  const { t } = useLanguage();

  return (
    <Layout>
      {/* Hero — Preply style: left text, right image, pink-ish bg */}
      <section className="relative bg-[hsl(var(--primary-light))]">
        <div className="container py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold leading-[1.1] tracking-tight">
                {t("home.heroTitle")}
              </h1>
              <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 font-semibold text-base px-8 rounded-xl" asChild>
                <Link to="/search">{t("home.heroCta")} <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden md:block"
            >
              <img
                src={heroImage}
                alt="Students learning online"
                className="rounded-2xl w-full object-cover shadow-lg"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y bg-background">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-5">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.labelKey}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="py-8 text-center border-r last:border-r-0"
              >
                <div className="flex items-center justify-center gap-1">
                  <p className="text-2xl md:text-3xl font-bold tabular-nums">{stat.value}</p>
                  {stat.isStar && (
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className="h-4 w-4 fill-warning text-warning" />
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{t(stat.labelKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Subject cards grid */}
      <section className="container py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjectCards.map((card, i) => (
            <motion.div
              key={card.nameKey}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={card.href}
                className="flex items-center gap-4 rounded-xl border bg-card p-5 hover:border-primary/30 hover:shadow-md transition-all group"
              >
                <card.icon className="h-6 w-6 text-muted-foreground shrink-0" />
                <div className="flex-1">
                  <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{t(card.nameKey)}</h3>
                  <p className="text-sm text-muted-foreground">{card.count} {t("home.teachers")}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Verified Results Platform */}
      <section className="bg-muted/30 py-16 md:py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <span className="inline-block text-sm font-semibold text-primary mb-3 tracking-wide uppercase">{t("home.progressBadge")}</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("home.progressTitle")}</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">{t("home.progressDesc")}</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: "📊", titleKey: "home.progressFeat1Title", descKey: "home.progressFeat1Desc" },
              { icon: "🎯", titleKey: "home.progressFeat2Title", descKey: "home.progressFeat2Desc" },
              { icon: "✅", titleKey: "home.progressFeat3Title", descKey: "home.progressFeat3Desc" },
            ].map((feat, i) => (
              <motion.div
                key={feat.titleKey}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl border bg-card p-6 text-center space-y-3"
              >
                <span className="text-3xl">{feat.icon}</span>
                <h3 className="font-bold text-lg">{t(feat.titleKey)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(feat.descKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How TutorHub Works — 3 steps */}
      <section className="container py-16">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold mb-12"
        >
          {t("home.howTitle")}
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-8">
          {howSteps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="space-y-4"
            >
              <div className="h-12 w-12 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-lg">
                {step.num}
              </div>
              <h3 className="text-xl font-bold">{t(step.titleKey)}</h3>
              <p className="text-muted-foreground leading-relaxed">{t(step.descKey)}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Guarantee */}
      <section className="container py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl bg-muted/50 p-8 md:p-12 text-center"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-3">{t("home.guaranteeTitle")}</h2>
          <p className="text-muted-foreground max-w-md mx-auto">{t("home.guaranteeDesc")}</p>
        </motion.div>
      </section>

      {/* Become a tutor CTA */}
      <section className="container py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-3xl md:text-4xl font-bold">{t("home.becomeTutorTitle")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("home.becomeTutorDesc")}</p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary shrink-0" />
                <span className="font-medium">{t("home.tutorBenefit1")}</span>
              </li>
              <li className="flex items-center gap-3">
                <Briefcase className="h-5 w-5 text-primary shrink-0" />
                <span className="font-medium">{t("home.tutorBenefit2")}</span>
              </li>
              <li className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-primary shrink-0" />
                <span className="font-medium">{t("home.tutorBenefit3")}</span>
              </li>
            </ul>
            <div className="flex gap-3 flex-wrap">
              <Button size="lg" className="hero-gradient text-primary-foreground border-0 font-semibold" asChild>
                <Link to="/become-tutor">{t("home.becomeTutorBtn")} <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/become-tutor">{t("home.howPlatformWorks")}</Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="hidden md:block"
          >
            <div className="rounded-2xl hero-gradient p-8 md:p-10 text-primary-foreground">
              <h3 className="text-2xl font-bold mb-4">{t("home.corpTitle")}</h3>
              <p className="text-primary-foreground/80 leading-relaxed mb-6">{t("home.corpDesc")}</p>
              <Button variant="secondary" className="font-semibold" asChild>
                <Link to="/for-business">{t("home.corpCta")}</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="container py-16">
        <div className="rounded-2xl bg-foreground p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-background mb-3">
            {t("cta.title")}
          </h2>
          <p className="text-background/70 mb-6 max-w-md mx-auto">
            {t("cta.subtitle")}
          </p>
          <Button size="lg" variant="secondary" className="font-semibold" asChild>
            <Link to="/search">{t("cta.button")} <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
