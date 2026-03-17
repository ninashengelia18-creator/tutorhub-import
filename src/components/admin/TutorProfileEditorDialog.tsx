import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { PublicTutorProfile } from "@/lib/publicTutors";

export interface TutorProfileEditorValues {
  primarySubject: string;
  subjects: string[];
  experience: string;
  hourlyRate: string;
  country: string;
  nativeLanguage: string;
  otherLanguages: string;
  bio: string;
  education: string;
  certifications: string;
  avatarUrl: string;
}

interface TutorProfileEditorDialogProps {
  open: boolean;
  tutor: PublicTutorProfile | null;
  saving?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: TutorProfileEditorValues) => Promise<void>;
}

const emptyValues: TutorProfileEditorValues = {
  primarySubject: "",
  subjects: [],
  experience: "",
  hourlyRate: "",
  country: "",
  nativeLanguage: "",
  otherLanguages: "",
  bio: "",
  education: "",
  certifications: "",
  avatarUrl: "",
};

function getInitialValues(tutor: PublicTutorProfile | null): TutorProfileEditorValues {
  if (!tutor) return emptyValues;

  return {
    primarySubject: tutor.primary_subject ?? "",
    subjects: tutor.subjects ?? [],
    experience: tutor.experience ?? "",
    hourlyRate: String(Number(tutor.hourly_rate ?? 0)),
    country: tutor.country ?? "",
    nativeLanguage: tutor.native_language ?? "",
    otherLanguages: tutor.other_languages ?? "",
    bio: tutor.bio ?? "",
    education: tutor.education ?? "",
    certifications: tutor.certifications ?? "",
    avatarUrl: tutor.avatar_url ?? "",
  };
}

export function TutorProfileEditorDialog({ open, tutor, saving = false, onOpenChange, onSubmit }: TutorProfileEditorDialogProps) {
  const [values, setValues] = useState<TutorProfileEditorValues>(emptyValues);
  const [subjectInput, setSubjectInput] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof TutorProfileEditorValues, string>>>({});

  useEffect(() => {
    if (!open) return;
    const nextValues = getInitialValues(tutor);
    setValues(nextValues);
    setSubjectInput("");
    setErrors({});
  }, [open, tutor]);

  const title = useMemo(() => {
    if (!tutor) return "Edit tutor profile";
    return `Edit ${tutor.first_name} ${tutor.last_name}`.trim();
  }, [tutor]);

  const updateValue = <K extends keyof TutorProfileEditorValues>(key: K, value: TutorProfileEditorValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const addSubject = () => {
    const nextSubject = subjectInput.trim();
    if (!nextSubject || values.subjects.includes(nextSubject)) return;
    updateValue("subjects", [...values.subjects, nextSubject]);
    setSubjectInput("");
  };

  const removeSubject = (subject: string) => {
    updateValue("subjects", values.subjects.filter((value) => value !== subject));
  };

  const validate = () => {
    const nextErrors: Partial<Record<keyof TutorProfileEditorValues, string>> = {};

    if (!values.primarySubject.trim()) nextErrors.primarySubject = "Primary subject is required.";
    if (!values.experience.trim()) nextErrors.experience = "Teaching experience is required.";
    if (!values.bio.trim()) nextErrors.bio = "Bio is required.";
    if (values.subjects.length === 0) nextErrors.subjects = "Add at least one subject.";
    if (!values.hourlyRate.trim()) nextErrors.hourlyRate = "Hourly rate is required.";
    else if (Number(values.hourlyRate) <= 0 || Number.isNaN(Number(values.hourlyRate))) nextErrors.hourlyRate = "Enter a valid hourly rate.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const hasRequiredFields = Boolean(
    values.primarySubject.trim() && values.experience.trim() && values.bio.trim() && values.hourlyRate.trim() && values.subjects.length > 0,
  );

  const handleSubmit = async () => {
    if (!validate()) return;
    await onSubmit(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>Name</Label>
            <Input value={tutor ? `${tutor.first_name} ${tutor.last_name}`.trim() : ""} disabled />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label>Email</Label>
            <Input value={tutor?.email ?? ""} disabled />
          </div>

          <div className="space-y-2">
            <Label>Primary subject *</Label>
            <Input value={values.primarySubject} onChange={(event) => updateValue("primarySubject", event.target.value)} aria-invalid={Boolean(errors.primarySubject)} />
            {errors.primarySubject && <p className="text-sm text-destructive">{errors.primarySubject}</p>}
          </div>

          <div className="space-y-2">
            <Label>Hourly rate (USD) *</Label>
            <Input type="number" min="1" value={values.hourlyRate} onChange={(event) => updateValue("hourlyRate", event.target.value)} aria-invalid={Boolean(errors.hourlyRate)} />
            {errors.hourlyRate && <p className="text-sm text-destructive">{errors.hourlyRate}</p>}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label>Subjects *</Label>
            <div className="flex gap-2">
              <Input
                value={subjectInput}
                onChange={(event) => setSubjectInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addSubject();
                  }
                }}
                placeholder="Type a subject and press Enter"
              />
              <Button type="button" variant="outline" onClick={addSubject}>Add</Button>
            </div>
            {values.subjects.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {values.subjects.map((subject) => (
                  <button
                    key={subject}
                    type="button"
                    onClick={() => removeSubject(subject)}
                    className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
                  >
                    {subject} ×
                  </button>
                ))}
              </div>
            ) : null}
            {errors.subjects && <p className="text-sm text-destructive">{errors.subjects}</p>}
          </div>

          <div className="space-y-2">
            <Label>Teaching experience *</Label>
            <Input value={values.experience} onChange={(event) => updateValue("experience", event.target.value)} aria-invalid={Boolean(errors.experience)} />
            {errors.experience && <p className="text-sm text-destructive">{errors.experience}</p>}
          </div>

          <div className="space-y-2">
            <Label>Country</Label>
            <Input value={values.country} onChange={(event) => updateValue("country", event.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Native language</Label>
            <Input value={values.nativeLanguage} onChange={(event) => updateValue("nativeLanguage", event.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Other languages</Label>
            <Input value={values.otherLanguages} onChange={(event) => updateValue("otherLanguages", event.target.value)} />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label>Bio *</Label>
            <Textarea value={values.bio} onChange={(event) => updateValue("bio", event.target.value)} rows={4} aria-invalid={Boolean(errors.bio)} />
            {errors.bio && <p className="text-sm text-destructive">{errors.bio}</p>}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label>Education</Label>
            <Input value={values.education} onChange={(event) => updateValue("education", event.target.value)} />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label>Certifications</Label>
            <Input value={values.certifications} onChange={(event) => updateValue("certifications", event.target.value)} />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label>Profile photo URL</Label>
            <Input type="url" value={values.avatarUrl} onChange={(event) => updateValue("avatarUrl", event.target.value)} placeholder="https://..." />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button type="button" onClick={handleSubmit} disabled={!hasRequiredFields || saving}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
