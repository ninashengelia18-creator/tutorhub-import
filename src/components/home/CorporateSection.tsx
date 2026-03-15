import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

export function CorporateSection() {
  const { t } = useLanguage();

  return (
    <section className="container py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-2xl p-8 md:p-12 text-primary-foreground border border-primary/30"
        style={{ background: "linear-gradient(135deg, hsl(271, 81%, 56%), hsl(280, 70%, 45%))" }}
      >
        <div className="max-w-2xl">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">{t("home.corpTitle")}</h3>
          <p className="text-primary-foreground/80 leading-relaxed mb-6">{t("home.corpDesc")}</p>
          <Button className="bg-white text-primary hover:bg-white/90 font-semibold rounded-full px-8" asChild>
            <Link to="/for-business">{t("home.corpCta")}</Link>
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
