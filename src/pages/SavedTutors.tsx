import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Search, Trash2 } from "lucide-react";

import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { getSavedTutors, removeSavedTutor, subscribeToSavedTutors, type SavedTutor } from "@/lib/savedTutors";

export default function SavedTutors() {
  const [tutors, setTutors] = useState<SavedTutor[]>([]);

  useEffect(() => {
    const sync = () => setTutors(getSavedTutors());
    sync();
    return subscribeToSavedTutors(sync);
  }, []);

  return (
    <Layout hideFooter>
      <div className="container py-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Saved tutors</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">Keep your favourite tutors in one place and jump back in whenever you're ready.</p>
          </div>
          <Button asChild>
            <Link to="/search">
              <Search className="mr-2 h-4 w-4" />
              Find tutors
            </Link>
          </Button>
        </div>

        {tutors.length === 0 ? (
          <div className="rounded-3xl border border-border bg-card p-10 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Heart className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">No saved tutors yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">Tap the heart on a tutor card to save it here.</p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {tutors.map((tutor) => (
              <article key={tutor.id} className="flex flex-col gap-5 rounded-3xl border border-border bg-card p-5 sm:flex-row sm:items-center">
                <img src={tutor.photo} alt={tutor.name} className="h-20 w-20 rounded-2xl object-cover" loading="lazy" />
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-semibold text-foreground">{tutor.name}</p>
                  <p className="text-sm text-muted-foreground">{tutor.subject}</p>
                  <p className="mt-2 text-sm font-medium text-foreground">${tutor.price}/ hour</p>
                </div>
                <div className="flex gap-2 sm:flex-col">
                  <Button variant="outline" asChild>
                    <Link to={`/tutor/${tutor.id}`}>View profile</Link>
                  </Button>
                  <Button
                    variant="ghost"
                    className="text-muted-foreground"
                    onClick={() => {
                      removeSavedTutor(tutor.id);
                      setTutors(getSavedTutors());
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
