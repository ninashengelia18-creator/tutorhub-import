import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export interface ManualTutorFormValues {
  firstName: string;
  lastName: string;
  email: string;
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

interface ManualTutorDialogProps {
  buttonLabel: string;
  dialogTitle: string;
  submitLabel: string;
  cancelLabel: string;
  onSubmit: (values: ManualTutorFormValues) => Promise<void>;
}

const initialValues: ManualTutorFormValues = {
  firstName: "",
  lastName: "",
  email: "",
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

export function ManualTutorDialog({
  buttonLabel,
  dialogTitle,
  submitLabel,
  cancelLabel,
  onSubmit,
}: ManualTutorDialogProps) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<ManualTutorFormValues>(initialValues);
  const [subjectInput, setSubjectInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ManualTutorFormValues, string>>>({});

  const hasRequiredFields = useMemo(
    () => Boolean(values.firstName.trim() && values.lastName.trim() && values.email.trim() && values.primarySubject.trim() && values.experience.trim() && values.bio.trim() && values.hourlyRate.trim() && values.subjects.length > 0),
    [values],
  );

  const updateValue = <K extends keyof ManualTutorFormValues>(key: K, value: ManualTutorFormValues[K]) => {
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
    const nextErrors: Partial<Record<keyof ManualTutorFormValues, string>> = {};

    if (!values.firstName.trim()) nextErrors.firstName = "First name is required.";
    if (!values.lastName.trim()) nextErrors.lastName = "Last name is required.";
    if (!values.email.trim()) nextErrors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) nextErrors.email = "Enter a valid email address.";
    if (!values.primarySubject.trim()) nextErrors.primarySubject = "Primary subject is required.";
    if (values.subjects.length === 0) nextErrors.subjects = "Add at least one subject.";
    if (!values.experience.trim()) nextErrors.experience = "Teaching experience is required.";
    if (!values.bio.trim()) nextErrors.bio = "Bio is required.";
    if (!values.hourlyRate.trim()) nextErrors.hourlyRate = "Hourly rate is required.";
    else if (Number(values.hourlyRate) <= 0 || Number.isNaN(Number(values.hourlyRate))) nextErrors.hourlyRate = "Enter a valid hourly rate.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      await onSubmit(values);
      setOpen(false);
      setValues(initialValues);
      setSubjectInput("");
      setErrors({});
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>{buttonLabel}</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>First name *</Label>
            <Input value={values.firstName} onChange={(event) => updateValue("firstName", event.target.value)} aria-invalid={Boolean(errors.firstName)} />
            {errors.firstName && <p className="text-sm text-destructive">{errors.firstName}</p>}
          </div>
          <div className="space-y-2">
            <Label>Last name *</Label>
            <Input value={values.lastName} onChange={(event) => updateValue("lastName", event.target.value)} aria-invalid={Boolean(errors.lastName)} />
            {errors.lastName && <p className="text-sm text-destructive">{errors.lastName}</p>}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Email *</Label>
            <Input type="email" value={values.email} onChange={(event) => updateValue("email", event.target.value)} aria-invalid={Boolean(errors.email)} />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
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
            {values.subjects.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {values.subjects.map((subject) => (
                  <Badge key={subject} variant="secondary" className="cursor-pointer" onClick={() => removeSubject(subject)}>
                    {subject} ×
                  </Badge>
                ))}
              </div>
            )}
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
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>{cancelLabel}</Button>
          <Button type="button" onClick={handleSubmit} disabled={!hasRequiredFields || saving}>
            {saving ? "Publishing..." : submitLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
