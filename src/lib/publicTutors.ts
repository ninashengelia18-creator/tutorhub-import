export interface PublicTutorProfile {
  id: string;
  application_id: string | null;
  first_name: string;
  last_name: string;
  email: string | null;
  primary_subject: string;
  subjects: string[];
  experience: string;
  hourly_rate: number;
  country: string | null;
  native_language: string | null;
  other_languages: string | null;
  languages_spoken: string[];
  bio: string;
  education: string | null;
  certifications: string | null;
  avatar_url: string | null;
  rating: number;
  review_count: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export const TUTOR_PLACEHOLDER_IMAGE = "/placeholder.svg";

export function getTutorFullName(tutor: Pick<PublicTutorProfile, "first_name" | "last_name">) {
  return [tutor.first_name, tutor.last_name].filter(Boolean).join(" ").trim();
}

export function getTutorLanguages(tutor: Pick<PublicTutorProfile, "languages_spoken" | "native_language" | "other_languages">) {
  const direct = tutor.languages_spoken?.filter(Boolean) ?? [];
  if (direct.length > 0) return direct;

  return [tutor.native_language, tutor.other_languages]
    .flatMap((value) => (value ?? "").split(/[;,]/))
    .map((value) => value.trim())
    .filter(Boolean);
}

export function getTutorSubjects(tutor: Pick<PublicTutorProfile, "subjects" | "primary_subject">) {
  return tutor.subjects?.length ? tutor.subjects : [tutor.primary_subject];
}

export function getTutorAvatar(tutor: Pick<PublicTutorProfile, "avatar_url">) {
  return tutor.avatar_url || TUTOR_PLACEHOLDER_IMAGE;
}

export function getTutorSearchText(tutor: PublicTutorProfile) {
  return [
    getTutorFullName(tutor),
    tutor.primary_subject,
    ...getTutorSubjects(tutor),
    tutor.experience,
    tutor.country ?? "",
    ...getTutorLanguages(tutor),
  ]
    .join(" ")
    .toLowerCase();
}
