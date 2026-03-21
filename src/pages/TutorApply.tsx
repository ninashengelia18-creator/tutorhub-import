import { useMemo, useRef, useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from "@/contexts/LanguageContext";
import { TIMEZONE_OPTIONS } from "@/contexts/AppLocaleContext";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle, User, GraduationCap, BookOpen, Clock, Upload, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  getTutorApplicationErrorMessage,
  tutorApplicationSchema,
  tutorApplicationFieldSchemas,
} from "@/lib/tutorApplicationValidation";

import { supabase } from "@/integrations/supabase/client";

const TOTAL_STEPS = 4;

type FieldName =
  | "firstName"
  | "lastName"
  | "email"
  | "experience"
  | "bio"
  | "selectedSubjects"
  | "hourlyRate"
  | "availability"
  | "agreeTerms";

type FormErrors = Partial<Record<FieldName, string>>;

const experienceOptions = ["0-1 years", "1-3 years", "3-5 years", "5-10 years", "10+ years"];

export default function TutorApply() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

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

  // Step 3 — Subject & Rate
  const [subjectText, setSubjectText] = useState("");
  const selectedSubjects = useMemo(() => subjectText.split(",").map(s => s.trim()).filter(Boolean), [subjectText]);
  const [hourlyRate, setHourlyRate] = useState("");
  const [nativeLanguage, setNativeLanguage] = useState("");
  const [otherLanguages, setOtherLanguages] = useState("");

  // Step 4 — Availability
  const [availability, setAvailability] = useState("");
  const [timezone, setTimezone] = useState("");
  const [aboutTeaching, setAboutTeaching] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [confirmIdOwnership, setConfirmIdOwnership] = useState(false);
  const [idError, setIdError] = useState<string | null>(null);
  const idInputRef = useRef<HTMLInputElement>(null);

  const getFieldError = (fieldName: FieldName, value: unknown) => {
    const schema = tutorApplicationFieldSchemas[fieldName];
    if (!schema) return undefined;
    const result = schema.safeParse(value);
    return result.success ? undefined : result.error.issues[0]?.message;
  };

  const setFieldError = (fieldName: FieldName, value: unknown) => {
    setErrors((prev) => {
      const next = { ...prev };
      const message = getFieldError(fieldName, value);
      if (message) {
        next[fieldName] = message;
      } else {
        delete next[fieldName];
      }
      return next;
    });
  };

  const validateCurrentStep = () => {
    const nextErrors: FormErrors = {};

    if (step === 1) {
      nextErrors.firstName = getFieldError("firstName", firstName);
      nextErrors.lastName = getFieldError("lastName", lastName);
      nextErrors.email = getFieldError("email", email);
    }

    if (step === 2) {
      nextErrors.experience = getFieldError("experience", experience);
      nextErrors.bio = getFieldError("bio", bio);
    }

    if (step === 3) {
      nextErrors.selectedSubjects = getFieldError("selectedSubjects", selectedSubjects);
      nextErrors.hourlyRate = getFieldError("hourlyRate", hourlyRate);
    }

    if (step === 4) {
      nextErrors.availability = getFieldError("availability", availability);
      nextErrors.agreeTerms = getFieldError("agreeTerms", agreeTerms);

      if (!idFile) {
        setIdError("Please upload a photo of your government-issued ID.");
      } else if (!confirmIdOwnership) {
        setIdError("Please confirm the uploaded ID belongs to you.");
      } else {
        setIdError(null);
      }
    }

    const filteredErrors = Object.fromEntries(
      Object.entries(nextErrors).filter(([, value]) => Boolean(value))
    ) as FormErrors;

    setErrors((prev) => ({ ...prev, ...filteredErrors }));

    const hasIdError = step === 4 && (!idFile || !confirmIdOwnership);
    return Object.keys(filteredErrors).length === 0 && !hasIdError;
  };

  const clearStepErrors = (fields: FieldName[]) => {
    setErrors((prev) => {
      const next = { ...prev };
      fields.forEach((field) => delete next[field]);
      return next;
    });
  };

  const handleSubjectChange = (value: string) => {
    setSubjectText(value);
    const parsed = value.split(",").map(s => s.trim()).filter(Boolean);
    setFieldError("selectedSubjects", parsed);
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return !getFieldError("firstName", firstName) && !getFieldError("lastName", lastName) && !getFieldError("email", email);
      case 2:
        return !getFieldError("experience", experience) && !getFieldError("bio", bio);
      case 3:
        return !getFieldError("selectedSubjects", selectedSubjects) && !getFieldError("hourlyRate", hourlyRate);
      case 4:
        return !getFieldError("availability", availability) && !getFieldError("agreeTerms", agreeTerms) && !!idFile && confirmIdOwnership;
      default:
        return false;
    }
  };

  const handleNextStep = () => {
    if (!validateCurrentStep()) return;
    if (step === 1) clearStepErrors(["firstName", "lastName", "email"]);
    if (step === 2) clearStepErrors(["experience", "bio"]);
    if (step === 3) clearStepErrors(["selectedSubjects", "hourlyRate"]);
    setStep((currentStep) => currentStep + 1);
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;
    setSubmitting(true);

    try {
      // Upload ID document to storage
      let idDocumentUrl: string | null = null;
      if (idFile) {
        const fileExt = idFile.name.split(".").pop() || "jpg";
        const filePath = `${crypto.randomUUID()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("id-documents")
          .upload(filePath, idFile, { upsert: false });
        if (uploadError) throw new Error("Failed to upload ID document. Please try again.");
        idDocumentUrl = filePath;
      }

      // Insert into database for admin review — NO account created yet
      const { error: dbError } = await supabase.from("tutor_applications").insert({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        country: country.trim() || null,
        experience,
        education: education.trim() || null,
        certifications: certifications.trim() || null,
        bio: bio.trim(),
        subjects: selectedSubjects,
        hourly_rate: Number(hourlyRate),
        native_language: nativeLanguage.trim() || null,
        other_languages: otherLanguages.trim() || null,
        availability,
        timezone: timezone.trim() || null,
        about_teaching: aboutTeaching.trim() || null,
        id_document_url: idDocumentUrl,
      } as any);

      if (dbError) throw dbError;

      // Send confirmation email to applicant + admin notification via Brevo
      const emailPayload = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim().toLowerCase(),
        application_type: "tutor",
        phone: phone?.trim() || null,
        country: country.trim() || null,
        experience,
        education: education.trim() || null,
        certifications: certifications.trim() || null,
        bio: bio.trim(),
        subjects: selectedSubjects,
        hourly_rate: Number(hourlyRate),
        native_language: nativeLanguage.trim() || null,
        other_languages: otherLanguages.trim() || null,
        availability,
        timezone: timezone.trim() || null,
        about_teaching: aboutTeaching.trim() || null,
        id_document_url: idDocumentUrl,
      };

      try {
        console.log("Calling email function:", `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-application-confirmation-email`);
        const emailResponse = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-application-confirmation-email`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            },
            body: JSON.stringify(emailPayload),
          },
        );

        const responseText = await emailResponse.text();
        const responseData = responseText ? JSON.parse(responseText) : null;

        if (!emailResponse.ok || responseData?.success === false) {
          console.error("Tutor application email notification failed:", {
            status: emailResponse.status,
            body: responseData ?? responseText,
          });
        }
      } catch (emailErr) {
        console.error("Failed to call tutor application email notification endpoint:", emailErr);
      }

      clearStepErrors(["availability", "agreeTerms"]);
      setSubmitted(true);
    } catch (error: unknown) {
      toast({
        title: t("tutor.apply.error"),
        description: getTutorApplicationErrorMessage(error),
        variant: "destructive",
      });
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
                    <Input
                      value={firstName}
                      onChange={(e) => { setFirstName(e.target.value); setFieldError("firstName", e.target.value); }}
                      aria-invalid={Boolean(errors.firstName)}
                    />
                    {errors.firstName && <p className="text-sm text-destructive">{errors.firstName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>{t("tutor.apply.lastName")} *</Label>
                    <Input
                      value={lastName}
                      onChange={(e) => { setLastName(e.target.value); setFieldError("lastName", e.target.value); }}
                      aria-invalid={Boolean(errors.lastName)}
                    />
                    {errors.lastName && <p className="text-sm text-destructive">{errors.lastName}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t("tutor.apply.email")} *</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setFieldError("email", e.target.value); }}
                    aria-invalid={Boolean(errors.email)}
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
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
                  <Select value={experience} onValueChange={(value) => { setExperience(value); setFieldError("experience", value); }}>
                    <SelectTrigger aria-invalid={Boolean(errors.experience)}>
                      <SelectValue placeholder={t("tutor.apply.selectExp")} />
                    </SelectTrigger>
                    <SelectContent>
                      {experienceOptions.map((opt) => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.experience && <p className="text-sm text-destructive">{errors.experience}</p>}
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
                  <Textarea
                    value={bio}
                    onChange={(e) => { setBio(e.target.value); setFieldError("bio", e.target.value); }}
                    rows={5}
                    placeholder={t("tutor.apply.bioPlaceholder")}
                    aria-invalid={Boolean(errors.bio)}
                  />
                  {errors.bio && <p className="text-sm text-destructive">{errors.bio}</p>}
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
                  <Input
                    value={subjectText}
                    onChange={(e) => handleSubjectChange(e.target.value)}
                    placeholder="e.g. Mathematics, Physics, SAT Prep"
                    aria-invalid={Boolean(errors.selectedSubjects)}
                  />
                  <p className="text-xs text-muted-foreground">Separate multiple subjects with commas</p>
                  {errors.selectedSubjects && <p className="text-sm text-destructive">{errors.selectedSubjects}</p>}
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Price Per Lesson (USD) *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={hourlyRate}
                      onChange={(e) => { setHourlyRate(e.target.value); setFieldError("hourlyRate", e.target.value); }}
                      aria-invalid={Boolean(errors.hourlyRate)}
                    />
                    <p className="text-xs text-muted-foreground">Lessons are either 25 min or 50 min. Enter your rate for a 50-minute lesson.</p>
                    {errors.hourlyRate && <p className="text-sm text-destructive">{errors.hourlyRate}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>{t("tutor.apply.nativeLang")}</Label>
                    <Input value={nativeLanguage} onChange={(e) => setNativeLanguage(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t("tutor.apply.otherLangs")}</Label>
                  <Input value={otherLanguages} onChange={(e) => setOtherLanguages(e.target.value)} />
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
                  <Select value={availability} onValueChange={(value) => { setAvailability(value); setFieldError("availability", value); }}>
                    <SelectTrigger aria-invalid={Boolean(errors.availability)}>
                      <SelectValue placeholder={t("tutor.apply.selectAvail")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="part-time">{t("tutor.apply.availPartTime")}</SelectItem>
                      <SelectItem value="full-time">{t("tutor.apply.availFullTime")}</SelectItem>
                      <SelectItem value="flexible">{t("tutor.apply.availFlexible")}</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.availability && <p className="text-sm text-destructive">{errors.availability}</p>}
                </div>
                <div className="space-y-2">
                  <Label>{t("tutor.apply.timezone")}</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger><SelectValue placeholder={t("tutor.apply.selectTimezone")} /></SelectTrigger>
                    <SelectContent>
                      {TIMEZONE_OPTIONS.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Video introduction */}
                <div className="space-y-2">
                  <Label>{t("tutor.apply.videoLabel")}</Label>
                  <p className="text-xs text-muted-foreground">{t("tutor.apply.videoDesc")}</p>
                  <Input type="url" placeholder={t("tutor.apply.videoPlaceholder")} className="mt-1" />
                </div>

                {/* ID Verification */}
                <div className="space-y-3 rounded-lg border border-border bg-card/50 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    <Label className="text-base font-semibold">ID Verification *</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Upload a photo of your government-issued ID (passport or national ID card).
                  </p>
                  <input
                    ref={idInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      if (file && file.size > 10 * 1024 * 1024) {
                        setIdError("File is too large. Maximum size is 10 MB.");
                        setIdFile(null);
                        return;
                      }
                      setIdFile(file);
                      setIdError(null);
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-center gap-2"
                    onClick={() => idInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4" />
                    {idFile ? idFile.name : "Choose file…"}
                  </Button>

                  <div className="flex items-start gap-3 pt-1">
                    <Checkbox
                      id="confirmId"
                      checked={confirmIdOwnership}
                      onCheckedChange={(v) => {
                        setConfirmIdOwnership(v === true);
                        if (v === true && idFile) setIdError(null);
                      }}
                    />
                    <Label htmlFor="confirmId" className="text-sm leading-relaxed cursor-pointer">
                      I confirm the uploaded ID belongs to me and I agree to the{" "}
                      <a href="/privacy-policy" target="_blank" className="text-primary underline hover:text-primary/80">Privacy Policy</a>.
                    </Label>
                  </div>

                  {idError && <p className="text-sm text-destructive">{idError}</p>}

                  <p className="text-xs text-muted-foreground italic">
                    Your ID is used for verification purposes only and will not be shared publicly.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>{t("tutor.apply.aboutTeaching")}</Label>
                  <Textarea value={aboutTeaching} onChange={(e) => setAboutTeaching(e.target.value)} rows={4} placeholder={t("tutor.apply.aboutTeachingPlaceholder")} />
                </div>
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="terms"
                    checked={agreeTerms}
                    onCheckedChange={(value) => {
                      const isChecked = value === true;
                      setAgreeTerms(isChecked);
                      setFieldError("agreeTerms", isChecked);
                    }}
                    aria-invalid={Boolean(errors.agreeTerms)}
                  />
                  <div className="space-y-2">
                    <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                      {t("tutor.apply.terms")}
                    </Label>
                    {errors.agreeTerms && <p className="text-sm text-destructive">{errors.agreeTerms}</p>}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-10 pt-6 border-t">
          <Button variant="outline" onClick={() => setStep((s) => s - 1)} disabled={step === 1}>
            <ArrowLeft className="mr-2 h-4 w-4" /> {t("tutor.apply.back")}
          </Button>
          {step < TOTAL_STEPS ? (
            <Button onClick={handleNextStep} disabled={!canProceed()}>
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
