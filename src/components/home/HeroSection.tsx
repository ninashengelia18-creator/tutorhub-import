import { Link } from "react-router-dom";
import { ArrowRight, Radio, FileBarChart, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import aiWhisperLogo from "@/assets/ai-whisper-logo.png";

const whisperFeatures = [
  { icon: Radio, label: "Real-time coaching nudges" },
  { icon: FileBarChart, label: "Post-session reports" },
  { icon: Users, label: "Student engagement tracking" },
];

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

      {/* AI Whisper full-width banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="relative border-t border-b border-primary/15 bg-primary/5"
      >
        <div className="container py-14 md:py-20">
          <div className="flex flex-col items-center text-center space-y-6">
            <img
              src={aiWhisperLogo}
              alt="AI Whisper"
              className="h-44 w-44 md:h-52 md:w-52 object-contain"
            />
            <div className="max-w-2xl space-y-3">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Powered by AI Whisper
              </h2>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                Our proprietary AI tool that monitors student engagement in real time and delivers live coaching nudges to tutors, so every lesson stays on track.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-6 w-full max-w-xl">
              {whisperFeatures.map((feat) => (
                <div key={feat.label} className="flex flex-col items-center gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <feat.icon className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{feat.label}</span>
                </div>
              ))}
            </div>

            <a
              href="https://aiwhisper.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline pt-2"
            >
              Learn more <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
