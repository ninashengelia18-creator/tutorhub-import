import { HelpCircle } from "lucide-react";
import { motion } from "framer-motion";

import { Layout } from "@/components/Layout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqSections = [
  {
    category: "Booking & Lessons",
    questions: [
      {
        q: "How do I find and book a tutor?",
        a: "Use the search page to browse tutors by subject, price, availability, and rating. Click on a tutor's profile, pick a time slot, and complete the booking.",
      },
      {
        q: "Can I try a lesson before committing?",
        a: "Yes! Most tutors offer a free trial lesson so you can see if they're the right fit.",
      },
      {
        q: "Can I reschedule a lesson?",
        a: "You can reschedule up to 4 hours before the lesson starts without any penalty.",
      },
    ],
  },
  {
    category: "Payments",
    questions: [
      {
        q: "How do I pay for lessons?",
        a: "After booking, we'll send you payment details (IBAN) via email or chat. All prices are in Georgian Lari (₾). You can also message us directly through the support chat to get payment information.",
      },
      {
        q: "Can I get a refund?",
        a: "If you're not satisfied, request a refund within 24 hours. Our support team will review your request.",
      },
    ],
  },
  {
    category: "Tutors",
    questions: [
      {
        q: "How do I become a tutor?",
        a: "Click 'Become a Tutor' in the footer, fill out your qualifications and experience, and our team reviews within 48 hours.",
      },
      {
        q: "Are tutors verified?",
        a: "Yes, all tutors go through a verification process including identity check, qualification review, and a trial teaching session.",
      },
      {
        q: "Can I choose a native speaker?",
        a: "Yes! Use the 'Native Speaker' filter on the search page to find tutors who are native speakers of the language you're learning.",
      },
    ],
  },
  {
    category: "AI Features",
    questions: [
      {
        q: "What is the AI-powered classroom?",
        a: "Our classroom includes video chat, shared whiteboard, AI-assisted note-taking, and smart lesson insights generated after each session.",
      },
      {
        q: "How does AI Practice work?",
        a: "AI Practice provides daily exercises tailored to your goals plus scenario-based conversations for job interviews, travel, and business situations.",
      },
      {
        q: "What are Lesson Insights?",
        a: "After each lesson, AI generates a summary with key topics covered, areas for improvement, and recommended exercises.",
      },
    ],
  },
  {
    category: "Technical & Support",
    questions: [
      {
        q: "What devices are supported?",
        a: "LearnEazy works on any modern browser — Chrome, Firefox, Safari, Edge — on desktop, tablet, and mobile.",
      },
      {
        q: "In what language is support available?",
        a: "Support is currently available in English. Use the chat widget or email support@learneazy.ge.",
      },
      {
        q: "How do I delete my account?",
        a: "Go to Settings > Account > Delete Account. This action is permanent and cannot be undone.",
      },
    ],
  },
] as const;

export default function FAQ() {
  return (
    <Layout>
      <div className="container max-w-3xl py-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <div className="hero-gradient mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[1.75rem] shadow-lg md:h-24 md:w-24">
            <HelpCircle className="h-10 w-10 text-primary-foreground md:h-12 md:w-12" strokeWidth={2.5} />
          </div>
          <h1 className="mb-4 text-center text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Frequently Asked Questions
          </h1>
        </motion.div>

        <div className="space-y-8">
          {faqSections.map((section, index) => (
            <motion.div
              key={section.category}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              <h2 className="mb-3 text-lg font-semibold text-foreground">{section.category}</h2>
              <Accordion type="multiple" className="space-y-2">
                {section.questions.map((item, questionIndex) => (
                  <AccordionItem
                    key={questionIndex}
                    value={`${index}-${questionIndex}`}
                    className="card-shadow rounded-lg border bg-card px-4 transition-all hover:border-primary/30"
                  >
                    <AccordionTrigger className="text-left text-sm font-medium hover:no-underline">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
