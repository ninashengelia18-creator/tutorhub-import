import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import onlineLearningImg from "@/assets/online-learning-happy.jpg";

export function BottomCta() {
  const { t } = useLanguage();

  return (
    <section className="container py-16">
      <div className="rounded-2xl bg-primary overflow-hidden">
        <div className="grid md:grid-cols-2 items-center">
          <div className="p-8 md:p-12 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-3">
              {t("cta.title")}
            </h2>
            <p className="text-primary-foreground/70 mb-6 max-w-md">
              {t("cta.subtitle")}
            </p>
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold rounded-full px-8" asChild>
              <Link to="/search">{t("cta.button")} <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="hidden md:block h-full">
            <img
              src={onlineLearningImg}
              alt="Happy children learning online"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
