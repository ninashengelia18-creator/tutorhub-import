import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

export function GuaranteeSection() {
  const { t } = useLanguage();

  return (
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
  );
}
