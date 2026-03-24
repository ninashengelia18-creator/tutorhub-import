import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Star, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import {
  getTutorAvatar,
  getTutorSubjects,
  type PublicTutorProfile,
} from "@/lib/publicTutors";

export function FeaturedTutors() {
  const [tutors, setTutors] = useState<PublicTutorProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("public_tutor_profiles")
        .select("*")
        .eq("is_published", true)
        .eq("is_archived", false)
        .order("rating", { ascending: false })
        .limit(3);
      setTutors((data as PublicTutorProfile[]) ?? []);
      setLoading(false);
    };
    load();
  }, []);

  const hasLiveTutors = tutors.length > 0;

  return (
    <section className="py-16 md:py-20">
      <div className="container">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-4">
          Meet Our Tutors
        </h2>
        <p className="text-center text-muted-foreground mb-12 text-lg">
          {hasLiveTutors
            ? "Learn from our top-rated, verified tutors."
            : "Our tutors are being verified — be the first to join!"}
        </p>

        {loading ? (
          <div className="py-12 text-center text-muted-foreground">Loading…</div>
        ) : hasLiveTutors ? (
          /* Real tutor cards */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {tutors.map((tutor) => {
              const subjects = getTutorSubjects(tutor);
              return (
                <Link
                  key={tutor.id}
                  to={`/tutor/${tutor.id}`}
                  className="group rounded-2xl border border-border bg-card p-6 flex flex-col items-center text-center gap-3 hover:shadow-md transition-shadow"
                >
                  <img
                    src={getTutorAvatar(tutor)}
                    alt={tutor.first_name}
                    className="h-20 w-20 rounded-full object-cover"
                    loading="lazy"
                  />
                  <p className="font-semibold text-foreground">{tutor.first_name}</p>
                  <div className="flex items-center gap-1 text-sm text-warning">
                    <Star className="h-4 w-4 fill-current" />
                    <span>{Number(tutor.rating).toFixed(1)}</span>
                    {tutor.review_count > 0 && (
                      <span className="text-muted-foreground">({tutor.review_count})</span>
                    )}
                  </div>
                  {tutor.country && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{tutor.country}</span>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1 justify-center">
                    {subjects.slice(0, 2).map((s) => (
                      <Badge key={s} variant="secondary" className="text-xs">
                        {s}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm font-bold text-foreground">
                    ${Number(tutor.hourly_rate).toFixed(0)}/hr
                  </p>
                </Link>
              );
            })}
          </div>
        ) : (
          /* Placeholder cards */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="relative bg-card border border-border rounded-2xl p-6 flex flex-col items-center text-center gap-4 select-none"
              >
                <div className="absolute inset-0 rounded-2xl bg-muted/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-3">
                  <Badge className="bg-primary text-primary-foreground text-sm px-4 py-1">
                    Launching Soon
                  </Badge>
                </div>
                <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-10 w-10 text-muted-foreground/40" />
                </div>
                <div className="space-y-2 w-full">
                  <div className="h-4 w-24 mx-auto rounded bg-muted" />
                  <div className="h-3 w-16 mx-auto rounded bg-muted" />
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div key={s} className="h-4 w-4 rounded-full bg-muted" />
                  ))}
                </div>
                <div className="h-8 w-24 rounded-full bg-muted" />
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <Button size="lg" asChild>
            <Link to={hasLiveTutors ? "/search" : "/tutor-apply"}>
              {hasLiveTutors ? "Browse All Tutors" : "Become Our First Tutor"}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
