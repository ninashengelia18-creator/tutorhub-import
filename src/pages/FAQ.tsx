import { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { Layout } from "@/components/Layout";
import { motion, AnimatePresence } from "framer-motion";

const faqData = [
  {
    category: "Getting Started",
    questions: [
      { q: "How do I find a tutor?", a: "Use the search page to browse tutors by subject, language, price, and rating. You can also use the search bar on the home page to quickly find tutors for your desired subject." },
      { q: "How much does a lesson cost?", a: "Lesson prices are set by individual tutors and typically range from $20-60 per hour. Many tutors offer a free trial lesson for new students." },
      { q: "Can I try a lesson before committing?", a: "Yes! Most tutors offer a free trial lesson so you can see if they're the right fit before booking regular sessions." },
    ],
  },
  {
    category: "Payments",
    questions: [
      { q: "What payment methods are accepted?", a: "We accept payments through TBC PayGe, BOG Pay (Bank of Georgia), and international credit/debit cards (Visa, Mastercard)." },
      { q: "Can I get a refund?", a: "If you're not satisfied with a lesson, you can request a refund within 24 hours. Our support team will review your request." },
      { q: "How does billing work?", a: "You pay per lesson. The payment is processed when you book a lesson and held securely until the lesson is completed." },
    ],
  },
  {
    category: "Lessons & Classroom",
    questions: [
      { q: "What is the AI-powered classroom?", a: "Our classroom includes video chat, a shared whiteboard, AI-assisted note-taking, and smart tools that help both tutors and students during lessons." },
      { q: "How does AI Practice work?", a: "AI Practice provides daily exercises tailored to your learning goals and scenario-based practice sessions where you can practice skills with an AI tutor between lessons." },
      { q: "Can I reschedule a lesson?", a: "Yes, you can reschedule up to 4 hours before the lesson starts without any penalty." },
    ],
  },
  {
    category: "Account & Support",
    questions: [
      { q: "How do I become a tutor?", a: "Click 'Become a Tutor' in the footer, fill out your application with your qualifications and experience, and our team will review it within 48 hours." },
      { q: "In what languages is support available?", a: "Our support team operates in English, Georgian (ქართული), and Russian (Русский). Use the chat widget to reach us in your preferred language." },
      { q: "How do I delete my account?", a: "Go to Settings > Account > Delete Account. Note that this action is permanent and cannot be undone." },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <button
      onClick={() => setOpen(!open)}
      className="w-full text-left rounded-lg border bg-card p-4 card-shadow hover:border-primary/30 transition-all"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm pr-4">{q}</h3>
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}

export default function FAQ() {
  return (
    <Layout>
      <div className="container max-w-3xl py-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="mx-auto h-12 w-12 rounded-xl hero-gradient flex items-center justify-center mb-4">
            <HelpCircle className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Frequently Asked Questions</h1>
          <p className="text-muted-foreground">Find answers to common questions about TutorHub</p>
        </motion.div>

        <div className="space-y-8">
          {faqData.map((section, i) => (
            <motion.div
              key={section.category}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <h2 className="font-semibold text-lg mb-3">{section.category}</h2>
              <div className="space-y-2">
                {section.questions.map((item) => (
                  <FAQItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
