import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Search, Trash2 } from "lucide-react";

import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { getSavedTutors, removeSavedTutor, subscribeToSavedTutors, type SavedTutor } from "@/lib/savedTutors";

const copy = {
  en: {
    title: "Saved tutors",
    subtitle: "Keep your favorite tutors in one place and jump back in whenever you're ready.",
    emptyTitle: "No saved tutors yet",
    emptySubtitle: "Tap the heart on a tutor profile to save them here.",
    findTutors: "Find tutors",
    remove: "Remove",
    viewProfile: "View profile",
    priceSuffix: "/ lesson",
  },
  ka: {
    title: "შენახული რეპეტიტორები",
    subtitle: "შეინახეთ რჩეული რეპეტიტორები ერთ ადგილას და დაბრუნდით მათთან როცა მოგინდებათ.",
    emptyTitle: "შენახული რეპეტიტორები ჯერ არ არის",
    emptySubtitle: "რეპეტიტორის პროფილზე დააჭირეთ გულს, რომ აქ შეინახოთ.",
    findTutors: "რეპეტიტორების პოვნა",
    remove: "წაშლა",
    viewProfile: "პროფილის ნახვა",
    priceSuffix: "/ გაკვეთილი",
  },
  ru: {
    title: "Избранные репетиторы",
    subtitle: "Храните понравившихся репетиторов в одном месте и возвращайтесь к ним в любой момент.",
    emptyTitle: "Избранных репетиторов пока нет",
    emptySubtitle: "Нажмите на сердце в профиле репетитора, чтобы сохранить его здесь.",
    findTutors: "Найти репетиторов",
    remove: "Удалить",
    viewProfile: "Открыть профиль",
    priceSuffix: "/ урок",
  },
} as const;

export default function SavedTutors() {
  const { lang, t } = useLanguage();
  const text = useMemo(() => copy[lang], [lang]);
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
            <h1 className="text-3xl font-bold text-foreground">{text.title}</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">{text.subtitle}</p>
          </div>
          <Button className="hero-gradient border-0 text-primary-foreground" asChild>
            <Link to="/search">
              <Search className="mr-2 h-4 w-4" />
              {text.findTutors}
            </Link>
          </Button>
        </div>

        {tutors.length === 0 ? (
          <div className="rounded-3xl border border-border bg-card p-10 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Heart className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">{text.emptyTitle}</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{text.emptySubtitle}</p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {tutors.map((tutor) => (
              <article key={tutor.id} className="flex flex-col gap-5 rounded-3xl border border-border bg-card p-5 sm:flex-row sm:items-center">
                <img src={tutor.photo} alt={tutor.name} className="h-20 w-20 rounded-2xl object-cover" loading="lazy" />
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-semibold text-foreground">{tutor.name}</p>
                  <p className="text-sm text-muted-foreground">{t(tutor.subject)}</p>
                  <p className="mt-2 text-sm font-medium text-foreground">₾{tutor.price}{text.priceSuffix}</p>
                </div>
                <div className="flex gap-2 sm:flex-col">
                  <Button variant="outline" asChild>
                    <Link to={`/tutor/${tutor.id}`}>{text.viewProfile}</Link>
                  </Button>
                  <Button variant="ghost" className="text-muted-foreground" onClick={() => {
                    removeSavedTutor(tutor.id);
                    setTutors(getSavedTutors());
                  }}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    {text.remove}
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
