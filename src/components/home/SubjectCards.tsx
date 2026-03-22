import { Link } from "react-router-dom";
import {
  BookOpen, Code, GraduationCap, Calculator, ChevronRight,
  FlaskConical, Cpu, Globe, Atom, Leaf, PenLine, Languages,
  FileText, BarChart3, MessageCircle, Briefcase,
} from "lucide-react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Maths: Calculator,
  Science: FlaskConical,
  English: BookOpen,
  "Coding & Computer Science": Cpu,
  "Maths & Stats": BarChart3,
  Sciences: Atom,
  "Academic Skills": PenLine,
  "Programming & Data": Code,
  "ESL & Business English": Globe,
  "Coding for Career Change": Briefcase,
};

const homepageSubjects = [
  {
    category: "K‑12",
    items: [
      { label: "Maths", icon: Calculator, href: "/search?filter=Maths", desc: "Algebra, Geometry, Trigonometry, Calculus" },
      { label: "Science", icon: Atom, href: "/search?filter=Science", desc: "Biology, Chemistry, Physics" },
      { label: "English", icon: BookOpen, href: "/search?filter=English", desc: "ELA, Reading & Writing" },
      { label: "Coding & CS", icon: Cpu, href: "/search?filter=Computer+Science", desc: "Coding for Kids/Teens, AP CS" },
    ],
  },
  {
    category: "GCSE",
    items: [
      { label: "GCSE Maths", icon: Calculator, href: "/search?filter=Maths", desc: "Maths & Higher Tier" },
      { label: "GCSE Science", icon: Atom, href: "/search?filter=Science", desc: "Combined & Triple Science" },
      { label: "GCSE English", icon: BookOpen, href: "/search?filter=English", desc: "English Language & Literature" },
    ],
  },
  {
    category: "A‑Level",
    items: [
      { label: "A‑Level Maths", icon: Calculator, href: "/search?filter=Maths", desc: "Maths & Further Maths" },
      { label: "A‑Level Sciences", icon: Atom, href: "/search?filter=Science", desc: "Physics, Chemistry, Biology" },
      { label: "A‑Level English", icon: BookOpen, href: "/search?filter=English", desc: "English Language & Literature" },
    ],
  },
  {
    category: "University",
    items: [
      { label: "Maths & Stats", icon: BarChart3, href: "/search?filter=Maths", desc: "Calculus, Statistics, Linear Algebra" },
      { label: "English", icon: BookOpen, href: "/search?filter=English", desc: "English Language & Literature" },
    ],
  },
  {
    category: "Professionals",
    items: [
      { label: "ESL & Business English", icon: Globe, href: "/for-professionals", desc: "General English, Interview Prep" },
      { label: "IELTS / TOEFL", icon: Languages, href: "/for-professionals", desc: "Academic & General test prep" },
      { label: "Career‑Change Coding", icon: Briefcase, href: "/for-professionals", desc: "Python, Web Dev, Data Skills" },
    ],
  },
];
export function SubjectCards() {
  return (
    <section className="container py-16 space-y-10">
      {homepageSubjects.map((category) => (
        <div key={category.category}>
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xl font-bold mb-4 text-foreground"
          >
            {category.category}
          </motion.h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {category.items.map((card, i) => (
              <motion.div
                key={card.label}
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
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{card.label}</h3>
                    <p className="text-xs text-muted-foreground truncate">{card.desc}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
