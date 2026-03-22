import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Globe, Languages, Briefcase, Code, MessageCircle,
  BookOpen, ChevronRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Layout } from "@/components/Layout";
import { PortalHeader } from "@/components/PortalHeader";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { SUBJECT_TAXONOMY } from "@/lib/subjects";

const categoryIcons: Record<string, LucideIcon> = {
  "ESL & Business English": Globe,
  "Coding for Career Change": Briefcase,
};

export default function ForProfessionals() {
  const { user } = useAuth();
  const proCategory = SUBJECT_TAXONOMY.find((c) => c.key === "professionals");

  const content = (
    <div className="container py-12 space-y-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto text-center space-y-4"
      >
        <h1 className="text-4xl font-bold text-foreground">For Professionals</h1>
        <p className="text-lg text-muted-foreground">
          Advance your career with expert 1‑to‑1 tutoring in English, exam prep, and coding.
        </p>
        <Button size="lg" asChild>
          <Link to="/search?filter=Business+English">Browse Professional Tutors</Link>
        </Button>
      </motion.div>

      {proCategory?.groups.map((group, gi) => {
        const Icon = categoryIcons[group.label] || BookOpen;
        return (
          <motion.section
            key={group.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: gi * 0.1 }}
          >
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Icon className="h-5 w-5 text-primary" />
              {group.label}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {group.subjects.map((subject, si) => (
                <motion.div
                  key={subject.value}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: si * 0.04 }}
                >
                  <Link
                    to={`/search?subject=${encodeURIComponent(subject.value)}`}
                    className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 hover:border-primary/40 transition-all group"
                  >
                    <Icon className="h-5 w-5 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {subject.label}
                      </h3>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.section>
        );
      })}
    </div>
  );

  if (user) {
    return (
      <div className="flex min-h-screen flex-col">
        <PortalHeader />
        <main className="flex-1">{content}</main>
        <Footer />
      </div>
    );
  }

  return <Layout>{content}</Layout>;
}
