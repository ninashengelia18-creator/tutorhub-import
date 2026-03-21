import { useEffect, useState } from "react";
import { BookOpen, Clock, Globe, GraduationCap, Languages, MapPin, MessageSquare, Star } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import type { PublicTutorProfile } from "@/lib/publicTutors";
import { getTutorAvatar, getTutorLanguages, getTutorSubjects } from "@/lib/publicTutors";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tutorId: string;
}

interface ApplicationExtras {
  about_teaching: string | null;
  availability: string | null;
  timezone: string | null;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export function TutorProfilePreviewDialog({ open, onOpenChange, tutorId }: Props) {
  const [tutor, setTutor] = useState<PublicTutorProfile | null>(null);
  const [extras, setExtras] = useState<ApplicationExtras | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !tutorId) return;
    setLoading(true);

    const load = async () => {
      const { data } = await supabase
        .from("public_tutor_profiles" as never)
        .select("*")
        .eq("id", tutorId)
        .maybeSingle();

      const t = (data as PublicTutorProfile | null) ?? null;
      setTutor(t);

      if (t?.application_id) {
        const { data: appData } = await supabase
          .from("tutor_applications")
          .select("about_teaching, availability, timezone")
          .eq("id", t.application_id)
          .maybeSingle();
        setExtras((appData as ApplicationExtras | null) ?? null);
      } else if (t?.email) {
        const { data: appData } = await supabase
          .from("tutor_applications")
          .select("about_teaching, availability, timezone")
          .eq("email", t.email)
          .maybeSingle();
        setExtras((appData as ApplicationExtras | null) ?? null);
      }

      if (t) {
        const fullName = [t.first_name, t.last_name].filter(Boolean).join(" ").trim();
        const { data: revData } = await supabase
          .from("reviews")
          .select("id, rating, comment, created_at")
          .eq("tutor_name", fullName)
          .order("created_at", { ascending: false })
          .limit(10);
        setReviews((revData as Review[] | null) ?? []);
      }

      setLoading(false);
    };

    void load();
  }, [open, tutorId]);

  if (!open) return null;

  const displayName = tutor?.first_name || "Tutor";
  const languages = tutor ? getTutorLanguages(tutor) : [];
  const subjects = tutor ? getTutorSubjects(tutor) : [];
  const reviewCount = reviews.length > 0 ? reviews.length : (tutor?.review_count ?? 0);
  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : Number(tutor?.rating ?? 5).toFixed(1);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Profile Preview — How students see you</DialogTitle>
        </DialogHeader>

        {loading || !tutor ? (
          <div className="py-12 text-center text-muted-foreground">Loading preview…</div>
        ) : (
          <div className="space-y-5">
            {/* Hero */}
            <div className="flex gap-4">
              <img src={getTutorAvatar(tutor)} alt={displayName} className="h-20 w-20 rounded-2xl object-cover" />
              <div className="min-w-0 flex-1">
                <h2 className="text-2xl font-bold text-foreground">{displayName}</h2>
                <p className="text-sm font-medium text-primary">{tutor.primary_subject}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><GraduationCap className="h-3.5 w-3.5" /> {tutor.experience}</span>
                  {tutor.country && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {tutor.country}</span>}
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-xs">
                  <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                  <span className="font-semibold">{avgRating}</span>
                  <span className="text-muted-foreground">({reviewCount} {reviewCount === 1 ? "review" : "reviews"})</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">${Number(tutor.hourly_rate).toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">per lesson</p>
              </div>
            </div>

            {/* Bio */}
            <div>
              <h3 className="text-sm font-semibold text-foreground">About {displayName}</h3>
              <p className="mt-1 whitespace-pre-line text-sm leading-6 text-muted-foreground">{tutor.bio}</p>
            </div>

            {/* Teaching style */}
            {extras?.about_teaching && (
              <div>
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4 text-primary" /> Teaching Style
                </h3>
                <p className="mt-1 whitespace-pre-line text-sm leading-6 text-muted-foreground">{extras.about_teaching}</p>
              </div>
            )}

            {/* Subjects */}
            <div>
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-primary" /> Subjects
              </h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {subjects.map((s) => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
              </div>
            </div>

            {/* Qualifications */}
            {(tutor.education || tutor.certifications) && (
              <div>
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4 text-primary" /> Qualifications
                </h3>
                {tutor.education && <p className="mt-1 text-sm text-muted-foreground"><span className="font-medium text-foreground">Education:</span> {tutor.education}</p>}
                {tutor.certifications && <p className="mt-1 text-sm text-muted-foreground"><span className="font-medium text-foreground">Certifications:</span> {tutor.certifications}</p>}
              </div>
            )}

            {/* Languages */}
            {languages.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <Languages className="h-4 w-4 text-primary" /> Languages
                </h3>
                <div className="mt-1 text-sm text-muted-foreground">
                  {tutor.native_language && <p><span className="font-medium text-foreground">Native:</span> {tutor.native_language}</p>}
                  {tutor.other_languages && <p><span className="font-medium text-foreground">Also speaks:</span> {tutor.other_languages}</p>}
                  {!tutor.native_language && !tutor.other_languages && <p>{languages.join(", ")}</p>}
                </div>
              </div>
            )}

            {/* Availability */}
            {(extras?.availability || extras?.timezone) && (
              <div>
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-primary" /> Availability
                </h3>
                <div className="mt-1 space-y-0.5 text-sm text-muted-foreground">
                  {extras.availability && <p className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {extras.availability}</p>}
                  {extras.timezone && <p className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" /> {extras.timezone}</p>}
                </div>
              </div>
            )}

            {/* Reviews */}
            {reviews.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-primary" /> Reviews
                </h3>
                <div className="mt-2 space-y-3">
                  {reviews.slice(0, 5).map((r) => (
                    <div key={r.id} className="border-b pb-3 last:border-0 last:pb-0">
                      <div className="flex items-center gap-1.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "fill-warning text-warning" : "text-muted"}`} />
                        ))}
                        <span className="ml-1 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</span>
                      </div>
                      {r.comment && <p className="mt-1 text-sm text-muted-foreground">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
