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
    category: "For Students",
    questions: [
      {
        q: "How do I register as a student?",
        a: "Sign up for free at learneazy.org/signup/student. Registration takes less than a minute — you just need your name, email address, and a password.",
      },
      {
        q: "How do I find a tutor?",
        a: "After creating your account, browse tutors by subject on the LearnEazy platform. Filter by subject, availability, and price. Once you find a tutor, book a session directly through the platform.",
      },
      {
        q: "How do lessons work?",
        a: "All lessons take place online via Google Meet or Zoom. Once a session is booked, both the student and tutor receive a link to join the video call. Sessions are live, one-on-one, with real-time video and audio. No software installation is required beyond a web browser.",
      },
      {
        q: "How do I pay for lessons?",
        a: "After booking a session, students receive a secure payment link via email within one hour. Payment is made in USD via bank transfer. A Google Meet link and session confirmation are sent once payment is received.",
      },
      {
        q: "What is the cancellation policy?",
        a: "Students may cancel a booked session up to 12 hours before the scheduled start time for a full refund. Cancellations made less than 12 hours before the session are non-refundable. If a tutor or Language Buddy cancels, students receive a full refund or the option to reschedule at no additional cost.",
      },
      {
        q: "What is the refund policy?",
        a: "Refunds are issued for cancellations made at least 12 hours before the session. If a session cannot proceed due to a technical issue on the platform, students receive a full refund or a complimentary rescheduled session. Any issues should be reported to info@learneazy.org within 48 hours of the session. The team will review and respond within 3 business days. For full details see the Refund Policy at learneazy.org/refund-policy.",
      },
    ],
  },
  {
    category: "For Tutors & Language Buddies",
    questions: [
      {
        q: "What kind of tutors does LearnEazy look for?",
        a: "LearnEazy has two roles — Tutors and Language Buddies.\n\nTutors should have strong subject knowledge, excellent communication skills, and the ability to explain concepts clearly. A formal teaching certificate is not required but experience tutoring or teaching is a plus.\n\nLanguage Buddies are native or fluent speakers who want to help others practice conversation. No teaching experience or qualifications needed — just fluency, patience, and a friendly personality.",
      },
      {
        q: "What subjects can I teach?",
        a: "Tutors can teach a wide range of subjects including K-12 Math, English/ELA, Biology, Chemistry, Physics, Coding, GCSE and A-Level subjects, University level Maths and English, ESL, Business English, IELTS and TOEFL prep, and Coding for Career Change.\n\nLanguage Buddies offer conversation practice in English, Spanish, French, German, Italian, Portuguese, Arabic, and Mandarin Chinese.\n\nIf a subject or language isn't listed, mention it in the application and the team will consider it.",
      },
      {
        q: "How do I become a tutor or Language Buddy at LearnEazy?",
        a: "Click \"Become a Tutor\" or \"Become a Language Buddy\" on the website and complete the short application form. The team reviews every application and applicants hear back within 2–3 business days. Once approved, set up a profile, add availability, and start receiving bookings.",
      },
      {
        q: "Why should I teach on LearnEazy?",
        a: "LearnEazy offers full flexibility — tutors and Language Buddies set their own schedule, their own rate, and teach from anywhere in the world. Tutors also get exclusive access to AI Whisper, an AI-powered session coaching tool that provides real-time support during lessons and sends a detailed post-session report for continuous improvement. Language Buddies enjoy a relaxed, conversation-based experience with no lesson planning required. No other tutoring platform offers this level of support.",
      },
      {
        q: "What computer equipment do I need?",
        a: "A reliable computer or laptop, a stable internet connection, a webcam, and a microphone are required. A headset is recommended for better audio quality. Sessions run via Google Meet so no additional software is needed — just a browser.",
      },
      {
        q: "Is it free to create a profile on LearnEazy?",
        a: "Yes, completely free. There are no signup fees or monthly charges. LearnEazy takes a small commission only when a session is completed — so tutors and Language Buddies only pay when they earn.",
      },
      {
        q: "How does payment work?",
        a: "After booking a session, students receive a secure payment link via email within one hour. Payment is made in USD via bank transfer. A Google Meet link and session confirmation are sent once payment is received. LearnEazy takes a small commission and the remainder goes directly to the tutor or Language Buddy.",
      },
    ],
  },
  {
    category: "Support",
    questions: [
      {
        q: "How do I contact support?",
        a: "Write to Hugo AI on our website or email info@learneazy.org. We typically respond within a few hours.",
      },
      {
        q: "How do I report an issue?",
        a: "Contact our support team at info@learneazy.org with details of the issue and we will investigate promptly.",
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
