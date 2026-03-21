import { useEffect, useMemo, useState } from "react";
import { BookOpen, Clock, Globe, GraduationCap, Heart, Languages, MapPin, MessageSquare, Share2, Star } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";

import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { isTutorSaved, subscribeToSavedTutors, toggleSavedTutor } from "@/lib/savedTutors";
import {
  getTutorAvatar,
  getTutorLanguages,
  getTutorSubjects,
  type PublicTutorProfile,
} from "@/lib/publicTutors";

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
  student_id: string;
}

export default function TutorProfile() {
  const { id } = useParams();
  const { toast } = useToast();
  const [tutor, setTutor] = useState<PublicTutorProfile | null>(null);
  const [extras, setExtras] = useState<ApplicationExtras | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [similarTutors, setSimilarTutors] = useState<PublicTutorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isTutorSaved(id || ""));
    return subscribeToSavedTutors(() => setSaved(isTutorSaved(id || "")));
  }, [id]);

  useEffect(() => {
    const loadTutor = async () => {
      if (!id) return;
      setLoading(true);

      const { data } = await supabase
        .from("public_tutor_profiles" as never)
        .select("*")
        .eq("id", id)
        .eq("is_published", true)
        .maybeSingle();

      const nextTutor = (data as PublicTutorProfile | null) ?? null;
      setTutor(nextTutor);

      if (nextTutor) {
        // Fetch application extras (about_teaching, availability, timezone)
        if (nextTutor.application_id) {
          const { data: appData } = await supabase
            .from("tutor_applications")
            .select("about_teaching, availability, timezone")
            .eq("id", nextTutor.application_id)
            .maybeSingle();
          setExtras((appData as ApplicationExtras | null) ?? null);
        } else if (nextTutor.email) {
          const { data: appData } = await supabase
            .from("tutor_applications")
            .select("about_teaching, availability, timezone")
            .eq("email", nextTutor.email)
            .maybeSingle();
          setExtras((appData as ApplicationExtras | null) ?? null);
        }

        // Fetch reviews
        const tutorFullName = [nextTutor.first_name, nextTutor.last_name].filter(Boolean).join(" ").trim();
        const { data: reviewData } = await supabase
          .from("reviews")
          .select("id, rating, comment, created_at, student_id")
          .eq("tutor_name", tutorFullName)
          .order("created_at", { ascending: false })
          .limit(20);
        setReviews((reviewData as Review[] | null) ?? []);

        // Similar tutors
        const { data: similarData } = await supabase
          .from("public_tutor_profiles" as never)
          .select("*")
          .eq("is_published", true)
          .eq("primary_subject", nextTutor.primary_subject)
          .neq("id", nextTutor.id)
          .limit(3);
        setSimilarTutors((similarData as PublicTutorProfile[] | null) ?? []);
      } else {
        setSimilarTutors([]);
        setExtras(null);
        setReviews([]);
      }

      setLoading(false);
    };

    void loadTutor();
  }, [id]);

  const displayName = tutor?.first_name || "Tutor";
  const languages = useMemo(() => (tutor ? getTutorLanguages(tutor) : []), [tutor]);
  const subjects = useMemo(() => (tutor ? getTutorSubjects(tutor) : []), [tutor]);

  if (loading) {
    return (
      <Layout>
        <div className="container py-16 text-center text-muted-foreground">Loading tutor profile...</div>
      </Layout>
    );
  }

  if (!tutor) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground">Tutor not found</h1>
          <p className="mt-2 text-muted-foreground">This tutor is not published yet.</p>
          <Button className="mt-6" asChild>
            <Link to="/search">Back to Find Tutors</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : Number(tutor.rating).toFixed(1);
  const reviewCount = reviews.length > 0 ? reviews.length : tutor.review_count;

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <Button variant="ghost" asChild>
            <Link to="/search">← Back to Find Tutors</Link>
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                toggleSavedTutor({
                  id: tutor.id,
                  name: displayName,
                  subject: tutor.primary_subject,
                  price: Number(tutor.hourly_rate),
                  photo: getTutorAvatar(tutor),
                });
                setSaved(!saved);
              }}
            >
              <Heart className={`mr-2 h-4 w-4 ${saved ? "fill-primary text-primary" : ""}`} />
              {saved ? "Saved" : "Save"}
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                const shareUrl = window.location.href;
                try {
                  if (navigator.share) {
                    await navigator.share({ title: `${displayName} · LearnEazy`, url: shareUrl });
                  } else {
                    await navigator.clipboard.writeText(shareUrl);
                    toast({ title: "Profile link copied" });
                  }
                } catch {
                  // ignore dismissed share
                }
              }}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Hero card */}
            <section className="rounded-3xl border bg-card p-6">
              <div className="flex flex-col gap-5 sm:flex-row">
                <img src={getTutorAvatar(tutor)} alt={displayName} className="h-28 w-28 rounded-3xl object-cover" loading="lazy" />
                <div className="min-w-0 flex-1">
                  <h1 className="text-3xl font-bold text-foreground">{displayName}</h1>
                  <p className="mt-1 text-base font-medium text-primary">{tutor.primary_subject}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <GraduationCap className="h-4 w-4" /> {tutor.experience}
                    </span>
                    {tutor.country && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-4 w-4" /> {tutor.country}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 fill-warning text-warning" />
                    <span className="font-semibold text-foreground">{avgRating}</span>
                    <span className="text-muted-foreground">({reviewCount} {reviewCount === 1 ? "review" : "reviews"})</span>
                  </div>
                </div>
              </div>
            </section>

            {/* About */}
            <section className="rounded-3xl border bg-card p-6">
              <h2 className="text-xl font-semibold text-foreground">About {displayName}</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted-foreground">{tutor.bio}</p>
            </section>

            {/* Teaching style */}
            {extras?.about_teaching && (
              <section className="rounded-3xl border bg-card p-6">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" /> Teaching Style
                </h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted-foreground">{extras.about_teaching}</p>
              </section>
            )}

            {/* Subjects */}
            <section className="rounded-3xl border bg-card p-6">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" /> Subjects Taught
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {subjects.map((subject) => (
                  <Badge key={subject} variant="secondary">{subject}</Badge>
                ))}
              </div>
            </section>

            {/* Qualifications */}
            {(tutor.education || tutor.certifications) && (
              <section className="rounded-3xl border bg-card p-6">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" /> Qualifications
                </h2>
                {tutor.education && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Education:</span> {tutor.education}
                  </p>
                )}
                {tutor.certifications && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Certifications:</span> {tutor.certifications}
                  </p>
                )}
              </section>
            )}

            {/* Languages */}
            {languages.length > 0 && (
              <section className="rounded-3xl border bg-card p-6">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <Languages className="h-5 w-5 text-primary" /> Languages
                </h2>
                <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                  {tutor.native_language && (
                    <p><span className="font-medium text-foreground">Native:</span> {tutor.native_language}</p>
                  )}
                  {tutor.other_languages && (
                    <p><span className="font-medium text-foreground">Also speaks:</span> {tutor.other_languages}</p>
                  )}
                  {!tutor.native_language && !tutor.other_languages && (
                    <p>{languages.join(", ")}</p>
                  )}
                </div>
              </section>
            )}

            {/* Reviews */}
            <section className="rounded-3xl border bg-card p-6">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" /> Reviews ({reviewCount})
              </h2>
              {reviews.length > 0 ? (
                <div className="mt-4 space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < review.rating ? "fill-warning text-warning" : "text-muted"}`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">No reviews yet. Be the first to leave one after a lesson!</p>
              )}
            </section>
          </motion.div>

          {/* Sidebar */}
          <motion.aside initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            {/* Pricing & Book */}
            <section className="rounded-3xl border bg-card p-6">
              <p className="text-3xl font-bold text-foreground">${Number(tutor.hourly_rate).toFixed(0)}</p>
              <p className="mt-1 text-sm text-muted-foreground">per lesson (50 min)</p>
              <Button className="mt-5 w-full" asChild>
                <Link to={`/booking/${tutor.id}`}>Book a Lesson</Link>
              </Button>
            </section>

            {/* Availability & Timezone */}
            {(extras?.availability || extras?.timezone) && (
              <section className="rounded-3xl border bg-card p-6">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" /> Availability
                </h2>
                <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {extras.availability && (
                    <p className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground/70" />
                      {extras.availability}
                    </p>
                  )}
                  {extras.timezone && (
                    <p className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground/70" />
                      {extras.timezone}
                    </p>
                  )}
                </div>
              </section>
            )}

            {/* Similar tutors */}
            {similarTutors.length > 0 && (
              <section className="rounded-3xl border bg-card p-6">
                <h2 className="text-lg font-semibold text-foreground">More tutors in {tutor.primary_subject}</h2>
                <div className="mt-4 space-y-3">
                  {similarTutors.map((item) => (
                    <Link key={item.id} to={`/tutor/${item.id}`} className="flex items-center gap-3 rounded-2xl border p-3 hover:border-primary/40">
                      <img src={getTutorAvatar(item)} alt={item.first_name} className="h-12 w-12 rounded-2xl object-cover" loading="lazy" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">{item.first_name}</p>
                        <p className="text-xs text-muted-foreground">${Number(item.hourly_rate).toFixed(0)}/lesson</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </motion.aside>
        </div>
      </div>
    </Layout>
  );
}
