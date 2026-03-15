import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export function BottomCta() {
  const { t } = useLanguage();

  return (
    <section className="container py-16">
      <div className="rounded-2xl bg-primary p-8 md:p-12 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-3">
          {t("cta.title")}
        </h2>
        <p className="text-primary-foreground/70 mb-6 max-w-md mx-auto">
          {t("cta.subtitle")}
        </p>
        <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold rounded-full px-8" asChild>
          <Link to="/search">{t("cta.button")} <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </div>
    </section>
  );
}
