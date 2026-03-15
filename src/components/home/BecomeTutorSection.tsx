import { Link } from "react-router-dom";
import { ArrowRight, Users, Briefcase, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import tutorImage from "@/assets/tutor-become.jpg";

export function BecomeTutorSection() {
  const { t } = useLanguage();

  return (
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
            <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 font-semibold" asChild>
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
          <img
            src={tutorImage}
            alt="Become a tutor"
            className="rounded-2xl w-full object-cover shadow-md max-h-[400px]"
            loading="lazy"
            decoding="async"
          />
        </motion.div>
      </div>
    </section>
  );
}
