import { useEffect, useMemo, useState } from "react";
import { Heart, Search, Star } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";

import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { subscribeToSavedTutors, toggleSavedTutor, isTutorSaved } from "@/lib/savedTutors";
import {
  getTutorAvatar,
  getTutorFullName,
  getTutorLanguages,
  getTutorSearchText,
  type PublicTutorProfile,
} from "@/lib/publicTutors";
import { SEARCH_FILTER_SUBJECTS, getSubjectValuesForFilter } from "@/lib/subjects";

export default function TutorSearch() {
  const [searchParams] = useSearchParams();
  const [tutors, setTutors] = useState<PublicTutorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState(searchParams.get("filter") || "All");
  const [savedIds, setSavedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let active = true;

    const loadTutors = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("public_tutor_profiles" as never)
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (!active) return;
      setTutors(((data as PublicTutorProfile[] | null) ?? []).filter((tutor) => tutor.is_published));
      setLoading(false);
    };

    void loadTutors();

    const channel = supabase
      .channel("public-tutor-profiles")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "public_tutor_profiles" },
        () => {
          void loadTutors();
        },
      )
      .subscribe();

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const syncSaved = () => {
      setSavedIds(Object.fromEntries(tutors.map((tutor) => [tutor.id, isTutorSaved(tutor.id)])));
    };

    syncSaved();
    return subscribeToSavedTutors(syncSaved);
  }, [tutors]);

  const filteredTutors = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filterValues = getSubjectValuesForFilter(selectedSubject);

    return tutors.filter((tutor) => {
      if (filterValues) {
        const tutorSubjects = [...(tutor.subjects || []), tutor.primary_subject].map((s) => s?.toLowerCase());
        const matches = filterValues.some((fv) =>
          tutorSubjects.some((ts) => ts?.includes(fv.toLowerCase())),
        );
        if (!matches) return false;
      }
      if (query && !getTutorSearchText(tutor).includes(query)) return false;
      return true;
    });
  }, [search, selectedSubject, tutors]);

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8 space-y-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Find approved tutors</h1>
            <p className="text-sm text-muted-foreground">Browse live LearnEazy tutors approved by your admin team.</p>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by tutor, subject, language, or country"
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {subjectOptions.map((subject) => (
                <Button
                  key={subject}
                  variant={selectedSubject === subject ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedSubject(subject)}
                >
                  {subject}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <p className="mb-4 text-sm text-muted-foreground">{filteredTutors.length} tutor{filteredTutors.length === 1 ? "" : "s"} available</p>

        {loading ? (
          <div className="rounded-3xl border bg-card p-10 text-center text-muted-foreground">Loading tutors...</div>
        ) : filteredTutors.length === 0 ? (
          <div className="rounded-3xl border bg-card p-10 text-center">
            <h2 className="text-xl font-semibold text-foreground">No approved tutors found</h2>
            <p className="mt-2 text-sm text-muted-foreground">Try another subject or a broader search.</p>
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {filteredTutors.map((tutor, index) => {
              const fullName = getTutorFullName(tutor);
              const languages = getTutorLanguages(tutor);
              const isSaved = savedIds[tutor.id] ?? false;

              return (
                <motion.article
                  key={tutor.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="rounded-3xl border bg-card p-5"
                >
                  <div className="flex flex-col gap-5 sm:flex-row">
                    <img
                      src={getTutorAvatar(tutor)}
                      alt={fullName}
                      className="h-24 w-24 rounded-2xl object-cover"
                      loading="lazy"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <Link to={`/tutor/${tutor.id}`} className="text-xl font-semibold text-foreground hover:text-primary">
                            {fullName}
                          </Link>
                          <p className="text-sm font-medium text-primary">{tutor.primary_subject}</p>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-2xl font-bold text-foreground">${Number(tutor.hourly_rate).toFixed(0)} USD</p>
                          <p className="text-xs text-muted-foreground">per hour</p>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span>{tutor.experience}</span>
                        {tutor.country ? <span>• {tutor.country}</span> : null}
                        <span>• {languages.length > 0 ? languages.join(", ") : "Languages not listed"}</span>
                      </div>

                      <div className="mt-3 flex items-center gap-2 text-sm">
                        <Star className="h-4 w-4 fill-warning text-warning" />
                        <span className="font-semibold text-foreground">{Number(tutor.rating).toFixed(1)}</span>
                        <span className="text-muted-foreground">({tutor.review_count} reviews)</span>
                      </div>

                      <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{tutor.bio}</p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button asChild>
                          <Link to={`/booking/${tutor.id}`}>Book a Lesson</Link>
                        </Button>
                        <Button variant="outline" asChild>
                          <Link to={`/tutor/${tutor.id}`}>View Profile</Link>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          className="text-muted-foreground"
                          onClick={() => {
                            toggleSavedTutor({
                              id: tutor.id,
                              name: fullName,
                              subject: tutor.primary_subject,
                              price: Number(tutor.hourly_rate),
                              photo: getTutorAvatar(tutor),
                            });
                            setSavedIds((current) => ({ ...current, [tutor.id]: !isSaved }));
                          }}
                        >
                          <Heart className={`mr-2 h-4 w-4 ${isSaved ? "fill-primary text-primary" : ""}`} />
                          {isSaved ? "Saved" : "Save"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
