import { Link } from "react-router-dom";
import { BookOpen, Languages, Code, GraduationCap, Calculator, ChevronRight, FlaskConical, Globe, Cpu, Briefcase, Scale, BarChart3, Megaphone, MapPin, Atom, Leaf, PenLine, BookMarked, Dumbbell, Church } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

const subjectCategories = [
  {
    categoryKey: "home.cat.k12",
    subjects: [
      { icon: Calculator, nameKey: "home.subj.math", href: "/search?subject=Mathematics", teacherCount: "24" },
      { icon: BookOpen, nameKey: "home.subj.english", href: "/search?subject=English", teacherCount: "32" },
      { icon: FlaskConical, nameKey: "home.subj.science", href: "/search?subject=Science", teacherCount: "41" },
      { icon: MapPin, nameKey: "home.subj.history", href: "/search?subject=History", teacherCount: "18" },
      { icon: Languages, nameKey: "home.subj.foreignLangs", href: "/search?subject=ForeignLanguages", teacherCount: "26" },
      { icon: Cpu, nameKey: "home.subj.computerScience", href: "/search?subject=ComputerScience", teacherCount: "15" },
    ],
  },
  {
    categoryKey: "home.cat.gcse",
    subjects: [
      { icon: GraduationCap, nameKey: "home.subj.gcseCore", href: "/search?subject=GCSE", teacherCount: "20" },
      { icon: GraduationCap, nameKey: "home.subj.aLevel", href: "/search?subject=ALevel", teacherCount: "17" },
      { icon: GraduationCap, nameKey: "home.subj.examPrep", href: "/search?subject=ExamPrep", teacherCount: "14" },
    ],
  },
  {
    categoryKey: "home.cat.professional",
    subjects: [
      { icon: Briefcase, nameKey: "home.subj.businessFinance", href: "/search?subject=BusinessFinance", teacherCount: "10" },
      { icon: Code, nameKey: "home.subj.programming", href: "/search?subject=Programming", teacherCount: "12" },
      { icon: BarChart3, nameKey: "home.subj.dataScience", href: "/search?subject=DataScience", teacherCount: "8" },
      { icon: Megaphone, nameKey: "home.subj.marketing", href: "/search?subject=Marketing", teacherCount: "6" },
      { icon: Scale, nameKey: "home.subj.law", href: "/search?subject=Law", teacherCount: "5" },
      { icon: Globe, nameKey: "home.subj.businessEnglish", href: "/search?subject=BusinessEnglish", teacherCount: "9" },
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
            className="text-xl font-bold mb-4 text-foreground"
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
                  className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 hover:border-primary/40 transition-all group card-glow"
                >
                  <card.icon className="h-5 w-5 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{t(card.nameKey)}</h3>
                    
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
