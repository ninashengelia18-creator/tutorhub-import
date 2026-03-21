import { useRef, useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle, User, MessageCircle, Upload, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TIMEZONE_OPTIONS } from "@/contexts/AppLocaleContext";

import { supabase } from "@/integrations/supabase/client";

const TOTAL_STEPS = 2;

export default function ConvoPartnerApply() {
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
  const [timezone, setTimezone] = useState("");

  // Step 2 — About You + Verification
  const [whyPartner, setWhyPartner] = useState("");
  const [convoStyle, setConvoStyle] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [confirmIdOwnership, setConfirmIdOwnership] = useState(false);
  const [idError, setIdError] = useState<string | null>(null);
  const idInputRef = useRef<HTMLInputElement>(null);

  const fullName = [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");

  const canProceed = () => {
    if (step === 1) {
      return firstName.trim().length > 0 && lastName.trim().length > 0 && email.trim().length > 0;
    }
    if (step === 2) {
      return whyPartner.trim().length > 0 && agreeTerms && !!idFile && confirmIdOwnership;
    }
    return false;
  };

  const handleSubmit = async () => {
    if (!canProceed()) return;
    setSubmitting(true);

    try {
      // Upload ID
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

      // Insert into conversation_partner_applications
      const { error: dbError } = await supabase.from("conversation_partner_applications" as any).insert({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        country: country.trim() || null,
        timezone: timezone || null,
        motivation: whyPartner.trim(),
        conversation_style: convoStyle.trim() || null,
        video_intro_url: videoLink.trim() || null,
        id_document_url: idDocumentUrl,
        agreed_to_terms: true,
      } as any);

      if (dbError) throw dbError;

      // Send confirmation email to applicant + admin notification via Brevo
      try {
        await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-application-confirmation-email`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            },
            body: JSON.stringify({
              first_name: firstName.trim(),
              last_name: lastName.trim(),
              email: email.trim(),
              application_type: "conversation_partner",
              phone: phone.trim() || null,
              country: country.trim() || null,
              motivation: whyPartner.trim(),
              conversation_style: convoStyle.trim() || null,
              video_intro_url: videoLink.trim() || null,
            }),
          },
        );
      } catch (emailErr) {
        console.error("Failed to send confirmation email:", emailErr);
      }

      setSubmitted(true);
    } catch (error: any) {
      toast({
        title: "Submission error",
        description: error?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const stepIcons = [User, MessageCircle];

  if (submitted) {
    return (
      <Layout>
        <div className="container max-w-lg py-24 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mx-auto mb-6 h-20 w-20 rounded-full hero-gradient flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-primary-foreground" />
          </motion.div>
          <h1 className="text-3xl font-bold mb-3">Application Submitted!</h1>
          <p className="text-muted-foreground mb-8">
            Thank you for applying to become a conversation partner. We'll review your application and get back to you within 24 hours.
          </p>
          <Button asChild>
            <a href="/">Back to Home</a>
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
          <p className="text-sm text-muted-foreground">Step {step} / {TOTAL_STEPS}</p>
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
                  <h2 className="text-2xl font-bold mb-1">Personal Information</h2>
                  <p className="text-muted-foreground text-sm">Tell us a bit about yourself.</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name *</Label>
                    <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name *</Label>
                    <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Input value={country} onChange={(e) => setCountry(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONE_OPTIONS.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1">About You</h2>
                  <p className="text-muted-foreground text-sm">Tell us why you'd be a great conversation partner.</p>
                </div>

                <div className="space-y-2">
                  <Label>Why do you want to become a conversation partner? *</Label>
                  <Textarea
                    value={whyPartner}
                    onChange={(e) => setWhyPartner(e.target.value)}
                    rows={4}
                    placeholder="Share your motivation and what excites you about this role…"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Your Conversation Style</Label>
                  <Textarea
                    value={convoStyle}
                    onChange={(e) => setConvoStyle(e.target.value)}
                    rows={3}
                    placeholder="Describe how you like to hold a conversation — casual, structured, topic-based, etc."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Video Introduction Link</Label>
                  <p className="text-xs text-muted-foreground">Record a short video introducing yourself and paste the link (YouTube, Loom, Google Drive, etc.)</p>
                  <Input type="url" value={videoLink} onChange={(e) => setVideoLink(e.target.value)} placeholder="https://…" />
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

                {/* Terms */}
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="terms"
                    checked={agreeTerms}
                    onCheckedChange={(value) => setAgreeTerms(value === true)}
                  />
                  <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                    I agree to the{" "}
                    <a href="/terms-of-service" target="_blank" className="text-primary underline hover:text-primary/80">Terms of Service</a>{" "}
                    and{" "}
                    <a href="/privacy-policy" target="_blank" className="text-primary underline hover:text-primary/80">Privacy Policy</a>.
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
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          {step < TOTAL_STEPS ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canProceed()}>
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || submitting}
              className="hero-gradient text-primary-foreground border-0"
            >
              {submitting ? "Submitting…" : "Submit Application"}
            </Button>
          )}
        </div>
      </div>
    </Layout>
  );
}
