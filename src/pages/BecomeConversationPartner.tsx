import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageCircle, Users, Globe, Briefcase, GraduationCap, Plane, DollarSign, Clock, Heart } from "lucide-react";

import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const benefits = [
  { icon: DollarSign, title: "Set Your Own Rate", desc: "Choose your hourly rate — most partners charge $10–25/hr." },
  { icon: Clock, title: "Flexible Schedule", desc: "Work when you want. Set your own availability and take breaks anytime." },
  { icon: Globe, title: "Work from Anywhere", desc: "All sessions are online. Teach from home, a café, or while travelling." },
  { icon: Heart, title: "Do What You Love", desc: "Get paid to have conversations in your native language." },
];

const whoCards = [
  { icon: Plane, title: "Travellers", desc: "Preparing for a trip abroad" },
  { icon: Briefcase, title: "Professionals", desc: "Needing conversational fluency for work" },
  { icon: GraduationCap, title: "Students", desc: "Wanting extra speaking practice outside formal lessons" },
  { icon: Globe, title: "Language Learners", desc: "Wanting to maintain fluency" },
];

const steps = [
  { num: 1, title: "Apply online", desc: "Fill out a short application telling us about yourself and the languages you speak." },
  { num: 2, title: "Get approved", desc: "Our team reviews your application — most are approved within 24 hours." },
  { num: 3, title: "Start earning", desc: "Set your schedule, accept bookings, and start having conversations." },
];

const faqs = [
  { q: "Do I need teaching experience?", a: "No! You just need to be a native or fluent speaker who enjoys conversation." },
  { q: "How much can I earn?", a: "That depends on your rate and availability. Many partners earn $100–300/week with just a few hours per day." },
  { q: "What do I need to get started?", a: "A computer with a webcam, stable internet, and a quiet space for calls." },
  { q: "Can I also be a tutor?", a: "Absolutely. If you have teaching qualifications, you can apply as a tutor for higher rates." },
];

export default function BecomeConversationPartner() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
        <div className="container relative z-10 text-center max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <MessageCircle className="mx-auto mb-6 h-16 w-16 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Become a Conversation Partner
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Earn money doing what you love — just having conversations. Help language learners practise speaking with a native speaker like you.
            </p>
            <Button size="lg" asChild>
              <Link to="/convo-partner-apply">Apply Now</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="container py-16">
        <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-3xl md:text-4xl font-bold mb-12 text-foreground text-center">
          Why Become a Conversation Partner?
        </motion.h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="h-full text-center">
                <CardContent className="pt-6 space-y-3">
                  <item.icon className="mx-auto h-10 w-10 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
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

      {/* Who You'll Help */}
      <section className="container py-16">
        <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-3xl md:text-4xl font-bold mb-12 text-foreground">
          Who You'll Help
        </motion.h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {whoCards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="h-full text-center">
                <CardContent className="pt-6 space-y-3">
                  <card.icon className="mx-auto h-10 w-10 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">{card.title}</h3>
                  <p className="text-sm text-muted-foreground">{card.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="container py-16 max-w-3xl mx-auto">
        <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-3xl md:text-4xl font-bold mb-12 text-foreground">
          Frequently Asked Questions
        </motion.h2>
        <div className="space-y-6">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border bg-card p-6"
            >
              <h3 className="text-lg font-semibold text-foreground mb-2">{faq.q}</h3>
              <p className="text-muted-foreground">{faq.a}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container py-16 text-center max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-3xl border bg-card p-10 space-y-4">
          <Users className="mx-auto h-12 w-12 text-primary" />
          <h2 className="text-3xl font-bold text-foreground">Ready to get started?</h2>
          <p className="text-muted-foreground text-lg">
            Join our growing community of conversation partners and start earning today.
          </p>
          <Button size="lg" asChild>
            <Link to="/convo-partner-apply">Apply as a Conversation Partner</Link>
          </Button>
        </motion.div>
      </section>
    </Layout>
  );
}
