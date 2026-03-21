export interface PublicPartnerProfile {
  id: string;
  application_id: string | null;
  first_name: string;
  last_name: string;
  email: string | null;
  avatar_url: string | null;
  native_language: string | null;
  other_languages: string | null;
  languages_spoken: string[];
  country: string | null;
  bio: string;
  topics: string[];
  price_per_session: number;
  availability: string | null;
  timezone: string | null;
  video_intro_url: string | null;
  rating: number;
  review_count: number;
  is_published: boolean;
  source: string;
  created_at: string;
  updated_at: string;
}

export const PARTNER_PLACEHOLDER_IMAGE = "/placeholder.svg";

export function getPartnerAvatar(p: Pick<PublicPartnerProfile, "avatar_url">) {
  return p.avatar_url || PARTNER_PLACEHOLDER_IMAGE;
}

export function getPartnerLanguages(p: Pick<PublicPartnerProfile, "languages_spoken" | "native_language" | "other_languages">) {
  const direct = p.languages_spoken?.filter(Boolean) ?? [];
  if (direct.length > 0) return direct;
  return [p.native_language, p.other_languages]
    .flatMap((v) => (v ?? "").split(/[;,]/))
    .map((v) => v.trim())
    .filter(Boolean);
}
