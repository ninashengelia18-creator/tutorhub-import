import { Link } from "react-router-dom";
import { Building2, BarChart3, Clock, Brain, UserCheck, BadgePercent, Globe, Code, Users, ArrowRight, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { submitFormspree } from "@/lib/formspree";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";
import { TIMEZONE_OPTIONS } from "@/contexts/AppLocaleContext";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
};

const inquirySchema = z.object({
  company_name: z.string().trim().min(1).max(200),
  contact_name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  team_size: z.string().trim().max(50).optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
});

export default function ForBusiness() {
  const { t } = useLanguage();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    company_name: "",
    contact_name: "",
    email: "",
    phone: "",
    team_size: "",
    message: "",
    timezone: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = inquirySchema.safeParse(formData);
    if (!parsed.success) {
      toast({ title: t("biz.form.error"), variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const row = {
        company_name: parsed.data.company_name,
        contact_name: parsed.data.contact_name,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        team_size: parsed.data.team_size || null,
        message: parsed.data.message || null,
        timezone: formData.timezone || null,
      };
      const { error } = await supabase.from("business_inquiries").insert([row]);
      if (error) throw error;

      // Also send via Formspree so it arrives in the inbox
      await submitFormspree({
        email: parsed.data.email,
        company_name: parsed.data.company_name,
        contact_name: parsed.data.contact_name,
        phone: parsed.data.phone || "Not provided",
        team_size: parsed.data.team_size || "Not provided",
        message: parsed.data.message || "No message",
        _subject: `Business enquiry from ${parsed.data.company_name}`,
      }).catch(() => {/* DB insert succeeded, email is best-effort */});

      toast({ title: t("biz.form.success") });
      setFormData({ company_name: "", contact_name: "", email: "", phone: "", team_size: "", message: "", timezone: "" });
    } catch {
      toast({ title: t("biz.form.error"), variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const features = [
    { icon: Building2, titleKey: "biz.feat1.title", descKey: "biz.feat1.desc" },
    { icon: BarChart3, titleKey: "biz.feat2.title", descKey: "biz.feat2.desc" },
    { icon: Clock, titleKey: "biz.feat3.title", descKey: "biz.feat3.desc" },
    { icon: Brain, titleKey: "biz.feat4.title", descKey: "biz.feat4.desc" },
    { icon: UserCheck, titleKey: "biz.feat5.title", descKey: "biz.feat5.desc" },
    { icon: BadgePercent, titleKey: "biz.feat6.title", descKey: "biz.feat6.desc" },
  ];

  const stats = [
    { value: "120+", labelKey: "biz.stat1" },
    { value: "3,500+", labelKey: "biz.stat2" },
    { value: "4.9/5", labelKey: "biz.stat3" },
    { value: "12+", labelKey: "biz.stat4" },
  ];

  const useCases = [
    { icon: Globe, titleKey: "biz.use1.title", descKey: "biz.use1.desc" },
    { icon: Code, titleKey: "biz.use2.title", descKey: "biz.use2.desc" },
    { icon: Users, titleKey: "biz.use3.title", descKey: "biz.use3.desc" },
  ];

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="container relative py-20 md:py-28 text-center max-w-3xl mx-auto">
          <motion.div {...fadeUp} className="space-y-6">
            <div className="mx-auto h-14 w-14 rounded-2xl hero-gradient flex items-center justify-center">
              <Building2 className="h-7 w-7 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-balance leading-[1.1]">
              {t("biz.title")}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
              {t("biz.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button size="lg" className="hero-gradient text-primary-foreground border-0 font-semibold" asChild>
                <a href="#contact-form">{t("biz.cta")}</a>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">{t("biz.ctaSub")}</p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.labelKey}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="py-8 text-center border-r last:border-r-0"
              >
                <p className="text-2xl md:text-3xl font-bold text-primary tabular-nums">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{t(stat.labelKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold">{t("biz.whyTitle")}</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, i) => (
            <motion.div
              key={feat.titleKey}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-xl border bg-card p-6 card-shadow hover:card-shadow-hover transition-all"
            >
              <div className="h-10 w-10 rounded-lg bg-primary-light flex items-center justify-center mb-4">
                <feat.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-base mb-2">{t(feat.titleKey)}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{t(feat.descKey)}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Use Cases */}
      <section className="bg-muted/30 py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold">{t("biz.useCases")}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {useCases.map((uc, i) => (
              <motion.div
                key={uc.titleKey}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="rounded-xl border bg-card p-6 card-shadow text-center"
              >
                <div className="mx-auto h-12 w-12 rounded-xl hero-gradient flex items-center justify-center mb-4">
                  <uc.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{t(uc.titleKey)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(uc.descKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact-form" className="container py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold">{t("biz.contactTitle")}</h2>
            <p className="text-muted-foreground mt-2">{t("biz.contactSub")}</p>
          </div>
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border bg-card p-6 md:p-8 card-shadow space-y-5"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">{t("biz.form.company")} *</Label>
                <Input id="company_name" name="company_name" value={formData.company_name} onChange={handleChange} required maxLength={200} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_name">{t("biz.form.name")} *</Label>
                <Input id="contact_name" name="contact_name" value={formData.contact_name} onChange={handleChange} required maxLength={200} />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("biz.form.email")} *</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required maxLength={255} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{t("biz.form.phone")}</Label>
                <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} maxLength={30} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="team_size">{t("biz.form.teamSize")}</Label>
              <Input id="team_size" name="team_size" value={formData.team_size} onChange={handleChange} placeholder={t("biz.form.teamSizePlaceholder")} maxLength={50} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">{t("biz.form.message")}</Label>
              <Textarea id="message" name="message" value={formData.message} onChange={handleChange} rows={4} maxLength={2000} placeholder={t("biz.form.messagePlaceholder")} />
            </div>
            <Button type="submit" size="lg" className="w-full hero-gradient text-primary-foreground border-0 font-semibold" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              {t("biz.form.submit")}
            </Button>
          </motion.form>
        </div>
      </section>
    </Layout>
  );
}
