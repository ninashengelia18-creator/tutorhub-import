import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

const stats = [
  { value: "5,000+", labelKey: "stats.tutors" },
  { value: "50,000+", labelKey: "stats.reviews" },
  { value: "120+", labelKey: "stats.subjects" },
  { value: "30+", labelKey: "stats.nationalities" },
  { value: "4.8", labelKey: "stats.appRating", isStar: true },
];

export function StatsBar() {
  const { t } = useLanguage();

  return (
    <section className="border-y bg-background">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-5">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.labelKey}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="py-8 text-center border-r last:border-r-0"
            >
              <div className="flex items-center justify-center gap-1">
                <p className="text-2xl md:text-3xl font-bold tabular-nums">{stat.value}</p>
                {stat.isStar && (
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-warning text-warning" />
                    ))}
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{t(stat.labelKey)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
