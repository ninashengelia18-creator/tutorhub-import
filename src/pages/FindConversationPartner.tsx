import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";

const languages = [
  { name: "English", flag: "🇬🇧" },
  { name: "Spanish", flag: "🇪🇸" },
  { name: "French", flag: "🇫🇷" },
  { name: "German", flag: "🇩🇪" },
  { name: "Italian", flag: "🇮🇹" },
  { name: "Portuguese", flag: "🇵🇹" },
  { name: "Arabic", flag: "🇸🇦" },
  { name: "Mandarin Chinese", flag: "🇨🇳" },
];

const steps = [
  { num: 1, title: "Pick your language and topic", desc: "Choose from dozens of languages and pick a topic you want to discuss." },
  { num: 2, title: "Book a session", desc: "Choose a 30 or 60 minute slot that works for you." },
  { num: 3, title: "Just talk", desc: "Join via Google Meet or Zoom and have a real conversation." },
];

export default function FindConversationPartner() {

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
        <div className="container relative z-10 text-center max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Search className="mx-auto mb-6 h-16 w-16 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Find a Conversation Partner
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Browse native speakers and book affordable, relaxed conversation sessions — no grammar drills, just real talk.
            </p>
            <Button size="lg" asChild>
              <a href="#browse">Browse Partners</a>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container py-16">
        <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-3xl md:text-4xl font-bold mb-12 text-foreground">
          How It Works
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="space-y-4"
            >
              <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                {step.num}
              </div>
              <h3 className="text-xl font-bold text-foreground">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Languages */}
      <section className="container py-16">
        <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-3xl md:text-4xl font-bold mb-12 text-foreground">
          Languages Available
        </motion.h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {languages.map((lang, i) => (
            <motion.div
              key={lang.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border bg-card p-5 text-center"
            >
              <span className="text-4xl">{lang.flag}</span>
              <p className="mt-2 font-medium text-foreground">{lang.name}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="container py-16 text-center max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Affordable rates from $10/hour
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Conversation Partners are not teachers — they are friendly native speakers who love helping others practice. No lesson plans, just conversation.
          </p>
        </motion.div>
      </section>

      {/* Browse */}
      <section id="browse" className="container py-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Browse Conversation Partners</h2>
        <p className="text-muted-foreground mb-10 text-lg">
          Our tutors are being verified — be the first to join!
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="relative rounded-3xl border bg-card p-6 flex flex-col items-center text-center gap-4 select-none"
            >
              <div className="absolute inset-0 rounded-3xl bg-muted/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-3">
                <Badge className="bg-primary text-primary-foreground text-sm px-4 py-1">
                  Launching Soon
                </Badge>
              </div>
              <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center">
                <User className="h-10 w-10 text-muted-foreground/40" />
              </div>
              <div className="space-y-2 w-full">
                <div className="h-5 w-28 mx-auto rounded bg-muted" />
                <div className="h-3 w-20 mx-auto rounded bg-muted" />
              </div>
              <div className="h-3 w-32 rounded bg-muted" />
              <div className="h-8 w-24 rounded-full bg-muted" />
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button size="lg" asChild>
            <Link to="/tutor-apply">Become Our First Tutor</Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}
