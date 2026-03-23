import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import aiWhisperLogo from "@/assets/ai-whisper-logo.png";

export function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden">
      {/* Abstract gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary to-background" />
        <div className="absolute top-1/4 -right-20 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-0 -left-20 w-[400px] h-[400px] rounded-full bg-primary/8 blur-[100px]" />
        <div className="absolute top-10 left-1/3 w-[300px] h-[300px] rounded-full bg-primary/5 blur-[80px]" />
      </div>

      <div className="container relative py-24 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center space-y-8"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-sm text-foreground font-medium max-w-2xl text-center"
          >
            <img src={aiWhisperLogo} alt="AI Whisper" className="h-6 w-6 object-contain flex-shrink-0" />
            <span>
              <strong>Powered by AI Whisper</strong> — our proprietary AI tool that monitors student engagement in real time and delivers live coaching nudges to tutors, so every lesson stays on track.
            </span>
          </motion.div>

          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-wide text-foreground"
            style={{ fontFamily: "'Kaushan Script', cursive" }}
          >
            {t("home.heroTitle")}
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            {t("hero.subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary-hover font-semibold text-base px-8 rounded-full shadow-lg shadow-primary/25"
              asChild
            >
              <Link to="/search">
                {t("cta.button")} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-foreground/30 text-foreground hover:bg-foreground/10 font-semibold text-base px-8 rounded-full"
              asChild
            >
              <Link to="/become-tutor">
                {t("home.becomeTutorBtn")}
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
