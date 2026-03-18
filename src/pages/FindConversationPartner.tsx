import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Search, Star } from "lucide-react";

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

const languages = [
  { name: "English", flag: "🇬🇧" },
  { name: "Spanish", flag: "🇪🇸" },
  { name: "French", flag: "🇫🇷" },
  { name: "German", flag: "🇩🇪" },
  { name: "Italian", flag: "🇮🇹" },
  { name: "Portuguese", flag: "🇵🇹" },
  { name: "Arabic", flag: "🇸🇦" },
  { name: "Mandarin Chinese", flag: "🇨🇳" },
];

const steps = [
  { num: 1, title: "Pick your language and topic", desc: "Choose from dozens of languages and pick a topic you want to discuss." },
  { num: 2, title: "Book a session", desc: "Choose a 30 or 60 minute slot that works for you." },
  { num: 3, title: "Just talk", desc: "Join via Google Meet or Zoom and have a real conversation." },
];

export default function FindConversationPartner() {
  const [tutors, setTutors] = useState<PublicTutorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [savedIds, setSavedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("public_tutor_profiles" as never)
        .select("*")
        .eq("is_published", true)
        .eq("primary_subject", "Conversation Practice")
        .order("created_at", { ascending: false });

      if (!active) return;
      setTutors((data as PublicTutorProfile[] | null) ?? []);
      setLoading(false);
    };
    void load();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const sync = () => setSavedIds(Object.fromEntries(tutors.map((t) => [t.id, isTutorSaved(t.id)])));
    sync();
    return subscribeToSavedTutors(sync);
  }, [tutors]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? tutors.filter((t) => getTutorSearchText(t).includes(q)) : tutors;
  }, [search, tutors]);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
        <div className="container relative z-10 text-center max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Search className="mx-auto mb-6 h-16 w-16 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Find a Conversation Partner
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Browse native speakers and book affordable, relaxed conversation sessions — no grammar drills, just real talk.
            </p>
            <Button size="lg" asChild>
              <a href="#browse">Browse Partners</a>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container py-16">
        <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-3xl md:text-4xl font-bold mb-12 text-foreground">
          How It Works
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="space-y-4"
            >
              <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                {step.num}
              </div>
              <h3 className="text-xl font-bold text-foreground">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Languages */}
      <section className="container py-16">
        <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-3xl md:text-4xl font-bold mb-12 text-foreground">
          Languages Available
        </motion.h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {languages.map((lang, i) => (
            <motion.div
              key={lang.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border bg-card p-5 text-center"
            >
              <span className="text-4xl">{lang.flag}</span>
              <p className="mt-2 font-medium text-foreground">{lang.name}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="container py-16 text-center max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Affordable rates from $10/hour
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Conversation Partners are not teachers — they are friendly native speakers who love helping others practice. No lesson plans, just conversation.
          </p>
        </motion.div>
      </section>

      {/* Browse */}
      <section id="browse" className="container py-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-foreground">Browse Conversation Partners</h2>

        <div className="relative max-w-md mb-8">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, language, or country" className="pl-9" />
        </div>

        <p className="mb-4 text-sm text-muted-foreground">{filtered.length} partner{filtered.length === 1 ? "" : "s"} available</p>

        {loading ? (
          <div className="rounded-3xl border bg-card p-10 text-center text-muted-foreground">Loading conversation partners...</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border bg-card p-10 text-center">
            <h3 className="text-xl font-semibold text-foreground">No conversation partners found</h3>
            <p className="mt-2 text-sm text-muted-foreground">Check back soon — we're growing fast!</p>
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {filtered.map((tutor, index) => {
              const fullName = getTutorFullName(tutor);
              const langs = getTutorLanguages(tutor);
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
                    <img src={getTutorAvatar(tutor)} alt={fullName} className="h-24 w-24 rounded-2xl object-cover" loading="lazy" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <Link to={`/tutor/${tutor.id}`} className="text-xl font-semibold text-foreground hover:text-primary">{fullName}</Link>
                          <p className="text-sm font-medium text-primary">Conversation Partner</p>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-2xl font-bold text-foreground">${Number(tutor.hourly_rate).toFixed(0)} USD</p>
                          <p className="text-xs text-muted-foreground">per hour</p>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        {tutor.country && <span>{tutor.country}</span>}
                        <span>{langs.length > 0 ? langs.join(", ") : "Languages not listed"}</span>
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-sm">
                        <Star className="h-4 w-4 fill-warning text-warning" />
                        <span className="font-semibold text-foreground">{Number(tutor.rating).toFixed(1)}</span>
                        <span className="text-muted-foreground">({tutor.review_count} reviews)</span>
                      </div>
                      <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{tutor.bio}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button asChild><Link to={`/booking/${tutor.id}`}>Book a Session</Link></Button>
                        <Button variant="outline" asChild><Link to={`/tutor/${tutor.id}`}>View Profile</Link></Button>
                        <Button
                          type="button"
                          variant="ghost"
                          className="text-muted-foreground"
                          onClick={() => {
                            toggleSavedTutor({ id: tutor.id, name: fullName, subject: "Conversation Practice", price: Number(tutor.hourly_rate), photo: getTutorAvatar(tutor) });
                            setSavedIds((c) => ({ ...c, [tutor.id]: !isSaved }));
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
      </section>
    </Layout>
  );
}
