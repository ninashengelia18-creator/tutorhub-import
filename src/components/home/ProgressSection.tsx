import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

export function ProgressSection() {
  const { t } = useLanguage();

  return (
    <section className="bg-muted/30 py-16 md:py-20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-block text-sm font-semibold text-primary mb-3 tracking-wide uppercase">
            {t("home.progressBadge")}
          </span>
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
  );
}
