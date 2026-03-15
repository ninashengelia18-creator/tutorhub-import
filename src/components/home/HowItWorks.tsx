import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import howStep2 from "@/assets/how-step2.jpg";
import howStep3 from "@/assets/how-step3.jpg";

const howSteps = [
  { num: 1, titleKey: "home.how1.title", descKey: "home.how1.desc", image: null },
  { num: 2, titleKey: "home.how2.title", descKey: "home.how2.desc", image: howStep2 },
  { num: 3, titleKey: "home.how3.title", descKey: "home.how3.desc", image: howStep3 },
];

export function HowItWorks() {
  const { t } = useLanguage();

  return (
    <section className="container py-16">
      <motion.h2
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-3xl md:text-4xl font-bold mb-12 text-foreground"
      >
        {t("home.howTitle")}
      </motion.h2>

      <div className="space-y-16">
        {howSteps.map((step, i) => (
          <motion.div
            key={step.num}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            className="grid md:grid-cols-2 gap-8 items-center"
          >
            <div className={`space-y-4 ${i % 2 === 1 ? "md:order-2" : ""}`}>
              <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                {step.num}
              </div>
              <h3 className="text-xl font-bold text-foreground">{t(step.titleKey)}</h3>
              <p className="text-muted-foreground leading-relaxed">{t(step.descKey)}</p>
            </div>
            {step.image && (
              <div className={`${i % 2 === 1 ? "md:order-1" : ""}`}>
                <img
                  src={step.image}
                  alt={t(step.titleKey)}
                  className="rounded-2xl w-full object-cover max-h-[300px] border border-border card-glow"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
