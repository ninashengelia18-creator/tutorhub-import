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
        a: "Payments are made securely in USD by credit or debit card through the LearnEazy platform. You pay in advance when booking a session. All major cards are accepted.",
      },
      {
        q: "Can I cancel or reschedule a lesson?",
        a: "Yes. You can cancel or reschedule through your student dashboard. Please cancel at least 24 hours before the session to avoid cancellation fees.",
      },
    ],
  },
  {
    category: "For Tutors",
    questions: [
      {
        q: "How do I register as a tutor?",
        a: "Apply at learneazy.org/tutor-apply. Fill in your application with your name, subjects, experience, and qualifications. Our team reviews all applications and responds within a few business days.",
      },
      {
        q: "Is it free to join as a tutor?",
        a: "Yes. It is completely free to sign up and create a tutor profile on LearnEazy. We only charge a commission when you earn from lessons.",
      },
      {
        q: "What commission does LearnEazy charge?",
        a: "The first lesson with any new student (trial lesson) is charged at 100% commission. For subsequent lessons, the rate depends on your total teaching hours: 0–20 hours = 22%, 20–50 hours = 19%, 50–100 hours = 17%, 100+ hours = 15%. The more you teach, the lower your commission.",
      },
      {
        q: "What is a trial lesson?",
        a: "A trial lesson is your first session with a new student. Spend the first 10 minutes understanding the student's level and goals, outline a basic study plan, and agree on a learning routine. Trial lessons have 100% commission, but students who enjoy their trial often become regular clients.",
      },
      {
        q: "How and when do I get paid?",
        a: "Earnings are paid out weekly in USD to your preferred payment method. You can track your earnings in your tutor dashboard.",
      },
      {
        q: "Can I set my own schedule and price?",
        a: "Yes. You have full control over your availability and hourly rate. You can update these at any time from your tutor profile.",
      },
      {
        q: "How do I improve my profile visibility?",
        a: "Add a clear, professional profile photo. Write a detailed profile description highlighting your experience and teaching style. Add your qualifications and certificates. Keep your availability up to date. Encourage students to leave reviews after sessions.",
      },
    ],
  },
  {
    category: "Support",
    questions: [
      {
        q: "How do I contact support?",
        a: "Chat with us directly on the website or email hello@learneazy.org. We typically respond within a few hours.",
      },
      {
        q: "How do I report an issue?",
        a: "Contact our support team at hello@learneazy.org with details of the issue and we will investigate promptly.",
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
