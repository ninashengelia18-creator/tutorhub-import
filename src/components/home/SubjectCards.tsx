import { Link } from "react-router-dom";
import { BookOpen, Languages, Code, Music, GraduationCap, Calculator, ChevronRight, FlaskConical, Globe, Cpu, Palette, Lightbulb, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

const subjectCategories = [
  {
    categoryKey: "home.cat.school",
    subjects: [
      { icon: BookOpen, nameKey: "home.subj.georgianLit", href: "/search?subject=GeorgianLit", teacherCount: "245" },
      { icon: Calculator, nameKey: "home.subj.math", href: "/search?subject=Mathematics", teacherCount: "312" },
      { icon: Languages, nameKey: "home.subj.english", href: "/search?subject=English", teacherCount: "523" },
      { icon: Globe, nameKey: "home.subj.foreignLangs", href: "/search?subject=ForeignLanguages", teacherCount: "418" },
      { icon: MapPin, nameKey: "home.subj.history", href: "/search?subject=History", teacherCount: "156" },
      { icon: MapPin, nameKey: "home.subj.geography", href: "/search?subject=Geography", teacherCount: "98" },
      { icon: FlaskConical, nameKey: "home.subj.biology", href: "/search?subject=Biology", teacherCount: "187" },
      { icon: FlaskConical, nameKey: "home.subj.physics", href: "/search?subject=Physics", teacherCount: "203" },
      { icon: FlaskConical, nameKey: "home.subj.chemistry", href: "/search?subject=Chemistry", teacherCount: "164" },
    ],
  },
  {
    categoryKey: "home.cat.exams",
    subjects: [
      { icon: GraduationCap, nameKey: "home.subj.examGeorgianLit", href: "/search?subject=ExamGeorgianLit", teacherCount: "89" },
      { icon: GraduationCap, nameKey: "home.subj.examForeignLang", href: "/search?subject=ExamForeignLang", teacherCount: "134" },
      { icon: GraduationCap, nameKey: "home.subj.examHistoryMath", href: "/search?subject=ExamHistoryMath", teacherCount: "112" },
      { icon: Lightbulb, nameKey: "home.subj.generalAptitude", href: "/search?subject=GeneralAptitude", teacherCount: "76" },
    ],
  },
  {
    categoryKey: "home.cat.special",
    subjects: [
      { icon: Cpu, nameKey: "home.subj.robotics", href: "/search?subject=Robotics", teacherCount: "42" },
      { icon: Code, nameKey: "home.subj.programming", href: "/search?subject=Programming", teacherCount: "189" },
      { icon: Palette, nameKey: "home.subj.art", href: "/search?subject=Art", teacherCount: "67" },
    ],
  },
];

export function SubjectCards() {
  const { t } = useLanguage();

  return (
    <section className="container py-16 space-y-10">
      {subjectCategories.map((category) => (
        <div key={category.categoryKey}>
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xl font-bold mb-4"
          >
            {t(category.categoryKey)}
          </motion.h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {category.subjects.map((card, i) => (
              <motion.div
                key={card.nameKey}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={card.href}
                  className="flex items-center gap-4 rounded-xl border bg-card p-4 hover:border-primary/30 hover:shadow-md transition-all group"
                >
                  <card.icon className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold group-hover:text-primary transition-colors">{t(card.nameKey)}</h3>
                    <p className="text-xs text-muted-foreground">{card.teacherCount} {t("home.teachers")}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
