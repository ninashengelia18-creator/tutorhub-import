import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle, User, GraduationCap, BookOpen, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const TOTAL_STEPS = 4;

const subjects = [
  "English", "Mathematics", "Physics", "Chemistry", "Biology",
  "History", "Geography", "Computer Science", "Business",
  "Music", "Art", "French", "German", "Spanish", "Georgian", "Russian",
];

const experienceOptions = ["0-1 years", "1-3 years", "3-5 years", "5-10 years", "10+ years"];

export default function TutorApply() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Step 1 — Personal Info
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");

  // Step 2 — Qualifications
  const [experience, setExperience] = useState("");
  const [education, setEducation] = useState("");
  const [certifications, setCertifications] = useState("");
  const [bio, setBio] = useState("");

  // Step 3 — Subjects & Rate
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [hourlyRate, setHourlyRate] = useState("");
  const [nativeLanguage, setNativeLanguage] = useState("");
  const [otherLanguages, setOtherLanguages] = useState("");

  // Step 4 — Availability
  const [availability, setAvailability] = useState("");
  const [timezone, setTimezone] = useState("");
  const [aboutTeaching, setAboutTeaching] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  const toggleSubject = (sub: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
    );
  };

  const canProceed = () => {
    switch (step) {
      case 1: return firstName.trim() && lastName.trim() && email.trim();
      case 2: return experience && bio.trim();
      case 3: return selectedSubjects.length > 0 && hourlyRate;
      case 4: return availability && agreeTerms;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const applicationData = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        country: country.trim() || null,
        experience,
        education: education.trim() || null,
        certifications: certifications.trim() || null,
        bio: bio.trim(),
        subjects: selectedSubjects,
        hourly_rate: parseFloat(hourlyRate),
        native_language: nativeLanguage.trim() || null,
        other_languages: otherLanguages.trim() || null,
        availability,
        timezone: timezone.trim() || null,
        about_teaching: aboutTeaching.trim() || null,
      };

      // Submit to Formspree → forwards to info@learneazy.org
      const res = await fetch("https://formspree.io/f/mojknpqp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(applicationData),
      });
      if (!res.ok) throw new Error("Submission failed");

      setSubmitted(true);
    } catch (err: any) {
      toast({ title: t("tutor.apply.error"), variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const stepIcons = [User, GraduationCap, BookOpen, Clock];

  if (submitted) {
    return (
      <Layout>
        <div className="container max-w-lg py-24 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mx-auto mb-6 h-20 w-20 rounded-full hero-gradient flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-primary-foreground" />
          </motion.div>
          <h1 className="text-3xl font-bold mb-3">{t("tutor.apply.successTitle")}</h1>
          <p className="text-muted-foreground mb-8">{t("tutor.apply.successDesc")}</p>
          <Button asChild>
            <a href="/">{t("tutor.apply.backHome")}</a>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-2xl py-12 md:py-20">
        {/* Progress */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
              const Icon = stepIcons[i];
              const isActive = i + 1 === step;
              const isDone = i + 1 < step;
              return (
                <div key={i} className="flex items-center flex-1">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    isDone ? "hero-gradient text-primary-foreground" :
                    isActive ? "bg-primary text-primary-foreground" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {isDone ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  {i < TOTAL_STEPS - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 ${i + 1 < step ? "bg-primary" : "bg-border"}`} />
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-sm text-muted-foreground">
            {t("tutor.apply.step")} {step} / {TOTAL_STEPS}
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1">{t("tutor.apply.step1Title")}</h2>
                  <p className="text-muted-foreground text-sm">{t("tutor.apply.step1Desc")}</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("tutor.apply.firstName")} *</Label>
                    <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("tutor.apply.lastName")} *</Label>
                    <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t("tutor.apply.email")} *</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("tutor.apply.phone")}</Label>
                    <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("tutor.apply.country")}</Label>
                    <Input value={country} onChange={(e) => setCountry(e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1">{t("tutor.apply.step2Title")}</h2>
                  <p className="text-muted-foreground text-sm">{t("tutor.apply.step2Desc")}</p>
                </div>
                <div className="space-y-2">
                  <Label>{t("tutor.apply.experience")} *</Label>
                  <Select value={experience} onValueChange={setExperience}>
                    <SelectTrigger><SelectValue placeholder={t("tutor.apply.selectExp")} /></SelectTrigger>
                    <SelectContent>
                      {experienceOptions.map((opt) => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("tutor.apply.education")}</Label>
                  <Input value={education} onChange={(e) => setEducation(e.target.value)} placeholder={t("tutor.apply.educationPlaceholder")} />
                </div>
                <div className="space-y-2">
                  <Label>{t("tutor.apply.certifications")}</Label>
                  <Input value={certifications} onChange={(e) => setCertifications(e.target.value)} placeholder={t("tutor.apply.certPlaceholder")} />
                </div>
                <div className="space-y-2">
                  <Label>{t("tutor.apply.bio")} *</Label>
                  <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={5} placeholder={t("tutor.apply.bioPlaceholder")} />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1">{t("tutor.apply.step3Title")}</h2>
                  <p className="text-muted-foreground text-sm">{t("tutor.apply.step3Desc")}</p>
                </div>
                <div className="space-y-2">
                  <Label>{t("tutor.apply.subjects")} *</Label>
                  <div className="flex flex-wrap gap-2">
                    {subjects.map((sub) => (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => toggleSubject(sub)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                          selectedSubjects.includes(sub)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background text-foreground border-border hover:border-primary"
                        }`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("tutor.apply.rate")} * (USD/hr)</Label>
                    <Input type="number" min="1" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} placeholder="25" />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("tutor.apply.nativeLang")}</Label>
                    <Input value={nativeLanguage} onChange={(e) => setNativeLanguage(e.target.value)} placeholder="English" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t("tutor.apply.otherLangs")}</Label>
                  <Input value={otherLanguages} onChange={(e) => setOtherLanguages(e.target.value)} placeholder="Georgian, Russian" />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1">{t("tutor.apply.step4Title")}</h2>
                  <p className="text-muted-foreground text-sm">{t("tutor.apply.step4Desc")}</p>
                </div>
                <div className="space-y-2">
                  <Label>{t("tutor.apply.availability")} *</Label>
                  <Select value={availability} onValueChange={setAvailability}>
                    <SelectTrigger><SelectValue placeholder={t("tutor.apply.selectAvail")} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="part-time">Part-time (1-15 hrs/week)</SelectItem>
                      <SelectItem value="full-time">Full-time (15-30 hrs/week)</SelectItem>
                      <SelectItem value="flexible">Flexible (30+ hrs/week)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("tutor.apply.timezone")}</Label>
                  <Input value={timezone} onChange={(e) => setTimezone(e.target.value)} placeholder="GMT+4 (Tbilisi)" />
                </div>

                {/* Video introduction */}
                <div className="space-y-2">
                  <Label>{t("tutor.apply.videoLabel")}</Label>
                  <p className="text-xs text-muted-foreground">{t("tutor.apply.videoDesc")}</p>
                  <Input type="url" placeholder={t("tutor.apply.videoPlaceholder")} className="mt-1" />
                  <p className="text-xs text-muted-foreground italic">{t("tutor.apply.videoTip")}</p>
                </div>

                <div className="space-y-2">
                  <Label>{t("tutor.apply.aboutTeaching")}</Label>
                  <Textarea value={aboutTeaching} onChange={(e) => setAboutTeaching(e.target.value)} rows={4} placeholder={t("tutor.apply.aboutTeachingPlaceholder")} />
                </div>
                <div className="flex items-start gap-3">
                  <Checkbox id="terms" checked={agreeTerms} onCheckedChange={(v) => setAgreeTerms(v === true)} />
                  <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                    {t("tutor.apply.terms")}
                  </Label>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-10 pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 1}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> {t("tutor.apply.back")}
          </Button>
          {step < TOTAL_STEPS ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canProceed()}>
              {t("tutor.apply.next")} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || submitting}
              className="hero-gradient text-primary-foreground border-0"
            >
              {submitting ? t("tutor.apply.submitting") : t("tutor.apply.submit")}
            </Button>
          )}
        </div>
      </div>
    </Layout>
  );
}
