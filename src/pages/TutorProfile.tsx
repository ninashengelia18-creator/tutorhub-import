import { useEffect, useMemo, useState } from "react";
import { Heart, MapPin, Share2, Star } from "lucide-react";
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
  getTutorFullName,
  getTutorLanguages,
  getTutorSubjects,
  type PublicTutorProfile,
} from "@/lib/publicTutors";

export default function TutorProfile() {
  const { id } = useParams();
  const { toast } = useToast();
  const [tutor, setTutor] = useState<PublicTutorProfile | null>(null);
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
      }

      setLoading(false);
    };

    void loadTutor();
  }, [id]);

  const fullName = useMemo(() => (tutor ? getTutorFullName(tutor) : ""), [tutor]);
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
                  name: fullName,
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
                    await navigator.share({ title: `${fullName} · LearnEazy`, url: shareUrl });
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
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <section className="rounded-3xl border bg-card p-6">
              <div className="flex flex-col gap-5 sm:flex-row">
                <img src={getTutorAvatar(tutor)} alt={fullName} className="h-28 w-28 rounded-3xl object-cover" loading="lazy" />
                <div className="min-w-0 flex-1">
                  <h1 className="text-3xl font-bold text-foreground">{fullName}</h1>
                  <p className="mt-1 text-base font-medium text-primary">{tutor.primary_subject}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span>{tutor.experience}</span>
                    {tutor.country ? (
                      <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />{tutor.country}</span>
                    ) : null}
                    <span>{languages.length > 0 ? languages.join(", ") : "Languages not listed"}</span>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 fill-warning text-warning" />
                    <span className="font-semibold text-foreground">{Number(tutor.rating).toFixed(1)}</span>
                    <span className="text-muted-foreground">({tutor.review_count} reviews)</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border bg-card p-6">
              <h2 className="text-xl font-semibold text-foreground">About this tutor</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted-foreground">{tutor.bio}</p>
            </section>

            <section className="rounded-3xl border bg-card p-6">
              <h2 className="text-xl font-semibold text-foreground">Subjects taught</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {subjects.map((subject) => (
                  <Badge key={subject} variant="secondary">{subject}</Badge>
                ))}
              </div>
            </section>

            {(tutor.education || tutor.certifications) && (
              <section className="rounded-3xl border bg-card p-6">
                <h2 className="text-xl font-semibold text-foreground">Qualifications</h2>
                {tutor.education ? <p className="mt-3 text-sm text-muted-foreground"><span className="font-medium text-foreground">Education:</span> {tutor.education}</p> : null}
                {tutor.certifications ? <p className="mt-3 text-sm text-muted-foreground"><span className="font-medium text-foreground">Certifications:</span> {tutor.certifications}</p> : null}
              </section>
            )}
          </motion.div>

          <motion.aside initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <section className="rounded-3xl border bg-card p-6">
              <p className="text-3xl font-bold text-foreground">${Number(tutor.hourly_rate).toFixed(0)}</p>
              <p className="mt-1 text-sm text-muted-foreground">Hourly rate in USD</p>
              <Button className="mt-5 w-full" asChild>
                <Link to={`/booking/${tutor.id}`}>Book a Lesson</Link>
              </Button>
            </section>

            {similarTutors.length > 0 && (
              <section className="rounded-3xl border bg-card p-6">
                <h2 className="text-lg font-semibold text-foreground">More tutors in {tutor.primary_subject}</h2>
                <div className="mt-4 space-y-3">
                  {similarTutors.map((item) => (
                    <Link key={item.id} to={`/tutor/${item.id}`} className="flex items-center gap-3 rounded-2xl border p-3 hover:border-primary/40">
                      <img src={getTutorAvatar(item)} alt={getTutorFullName(item)} className="h-12 w-12 rounded-2xl object-cover" loading="lazy" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">{getTutorFullName(item)}</p>
                        <p className="text-xs text-muted-foreground">${Number(item.hourly_rate).toFixed(0)}/hr</p>
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
