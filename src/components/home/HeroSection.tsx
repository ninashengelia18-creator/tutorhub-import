import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import heroImage from "@/assets/hero-students.jpg";

export function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="relative" style={{ backgroundColor: "hsl(265, 50%, 96%)" }}>
      <div className="container py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold leading-[1.1] tracking-tight text-foreground">
              {t("home.heroTitle")}
            </h1>
            <Button
              size="lg"
              className="bg-foreground text-background hover:bg-foreground/90 font-semibold text-base px-8 rounded-xl"
              asChild
            >
              <Link to="/search">
                {t("home.heroCta")} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
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
              className="rounded-2xl w-full object-cover shadow-lg max-h-[400px]"
              loading="eager"
              decoding="async"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
