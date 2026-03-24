import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { GraduationCap, MapPin, Search, Star } from "lucide-react";

import { Layout } from "@/components/Layout";
import { PortalHeader } from "@/components/PortalHeader";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import {
  getTutorAvatar,
  getTutorFullName,
  getTutorLanguages,
  getTutorSearchText,
  getTutorSubjects,
  type PublicTutorProfile,
} from "@/lib/publicTutors";
import { SEARCH_FILTER_SUBJECTS, getSubjectValuesForFilter } from "@/lib/subjects";

export default function TutorSearch() {
  const { user } = useAuth();
  const [tutors, setTutors] = useState<PublicTutorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("public_tutor_profiles")
        .select("*")
        .eq("is_published", true)
        .eq("is_archived", false)
        .order("rating", { ascending: false });
      setTutors((data as PublicTutorProfile[]) ?? []);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    let list = tutors;

    // Subject filter
    const filterValues = getSubjectValuesForFilter(activeFilter);
    if (filterValues) {
      list = list.filter((t) =>
        getTutorSubjects(t).some((s) =>
          filterValues.some((fv) => s.toLowerCase() === fv.toLowerCase())
        )
      );
    }

    // Text search
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((t) => getTutorSearchText(t).includes(q));
    }

    return list;
  }, [tutors, activeFilter, search]);

  const content = (
    <div className="container py-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          Find Your Perfect Tutor
        </h1>
        <p className="text-muted-foreground text-lg max-w-lg mx-auto">
          Browse our verified tutors and book your first lesson today.
        </p>
      </div>

      {/* Search bar */}
      <div className="relative max-w-md mx-auto mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, subject, language…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Subject filter pills */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {SEARCH_FILTER_SUBJECTS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-colors ${
              activeFilter === f
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:bg-accent/50"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="py-20 text-center text-muted-foreground">Loading tutors…</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 flex flex-col items-center text-center">
          <GraduationCap className="h-10 w-10 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">
            {tutors.length === 0
              ? "We're currently onboarding top tutors. Check back soon!"
              : "No tutors match your search. Try adjusting your filters."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((tutor) => (
            <TutorCard key={tutor.id} tutor={tutor} />
          ))}
        </div>
      )}
    </div>
  );

  if (user) {
    return (
      <div className="flex min-h-screen flex-col">
        <PortalHeader />
        <main className="flex-1">{content}</main>
        <Footer />
      </div>
    );
  }

  return <Layout>{content}</Layout>;
}

function TutorCard({ tutor }: { tutor: PublicTutorProfile }) {
  const subjects = getTutorSubjects(tutor);
  const languages = getTutorLanguages(tutor);

  return (
    <Link
      to={`/tutor/${tutor.id}`}
      className="group rounded-2xl border border-border bg-card p-5 flex flex-col gap-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-4">
        <img
          src={getTutorAvatar(tutor)}
          alt={tutor.first_name}
          className="h-16 w-16 rounded-xl object-cover flex-shrink-0"
          loading="lazy"
        />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-foreground truncate">{tutor.first_name}</p>
          <div className="flex items-center gap-1 text-sm text-warning mt-0.5">
            <Star className="h-3.5 w-3.5 fill-current" />
            <span>{Number(tutor.rating).toFixed(1)}</span>
            {tutor.review_count > 0 && (
              <span className="text-muted-foreground">({tutor.review_count})</span>
            )}
          </div>
          {tutor.country && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <MapPin className="h-3 w-3" />
              <span>{tutor.country}</span>
            </div>
          )}
        </div>
        <p className="text-sm font-bold text-foreground whitespace-nowrap">
          ${Number(tutor.hourly_rate).toFixed(0)}/hr
        </p>
      </div>

      <p className="text-sm text-muted-foreground line-clamp-2">{tutor.bio}</p>

      <div className="flex flex-wrap gap-1.5">
        {subjects.slice(0, 3).map((s) => (
          <Badge key={s} variant="secondary" className="text-xs">
            {s}
          </Badge>
        ))}
        {subjects.length > 3 && (
          <Badge variant="outline" className="text-xs">
            +{subjects.length - 3}
          </Badge>
        )}
      </div>

      {languages.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Speaks: {languages.join(", ")}
        </p>
      )}

      <Button size="sm" className="mt-auto w-full">
        View Profile
      </Button>
    </Link>
  );
}
