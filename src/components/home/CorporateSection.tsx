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
        className="rounded-2xl p-8 md:p-12 text-primary-foreground"
        style={{ background: "linear-gradient(135deg, hsl(265, 70%, 55%), hsl(280, 60%, 60%))" }}
      >
        <div className="max-w-2xl">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">{t("home.corpTitle")}</h3>
          <p className="text-primary-foreground/80 leading-relaxed mb-6">{t("home.corpDesc")}</p>
          <div className="flex gap-3 flex-wrap">
            <Button variant="secondary" className="font-semibold" asChild>
              <Link to="/for-business">{t("home.corpCta")}</Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
