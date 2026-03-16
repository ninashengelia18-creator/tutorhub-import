import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, Star, Filter, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useLanguage } from "@/contexts/LanguageContext";

const allTutors = [
  { id: 1, name: "Nino Beridze", subject: "Mathematics", rating: 4.9, reviews: 127, price: 25, avatar: "NB", languages: ["Georgian", "English"], bio: "10+ years teaching mathematics. Specializing in calculus and algebra.", nativeSpeaker: true, availability: "morning", photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face" },
  { id: 2, name: "Giorgi Kharadze", subject: "Physics", rating: 4.8, reviews: 98, price: 30, avatar: "GK", languages: ["Georgian", "Russian"], bio: "PhD in Physics. Making complex concepts simple and fun.", nativeSpeaker: true, availability: "afternoon", photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=face" },
  { id: 3, name: "Ana Melikishvili", subject: "English", rating: 5.0, reviews: 215, price: 20, avatar: "AM", languages: ["English", "Georgian"], bio: "IELTS & TOEFL specialist. Native-level English teacher.", nativeSpeaker: true, availability: "morning", photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face" },
  { id: 4, name: "Luka Tsiklauri", subject: "Programming", rating: 4.9, reviews: 164, price: 35, avatar: "LT", languages: ["English", "Georgian"], bio: "Full-stack developer teaching Python, JavaScript, and more.", nativeSpeaker: false, availability: "evening", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face" },
  { id: 5, name: "Mariam Jashi", subject: "Chemistry", rating: 4.7, reviews: 89, price: 22, avatar: "MJ", languages: ["Georgian", "English"], bio: "University professor with a passion for organic chemistry.", nativeSpeaker: true, availability: "afternoon", photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face" },
  { id: 6, name: "Davit Lomidze", subject: "Georgian", rating: 4.9, reviews: 201, price: 15, avatar: "DL", languages: ["Georgian", "Russian", "English"], bio: "Georgian language specialist for foreigners and native speakers.", nativeSpeaker: true, availability: "morning", photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face" },
  { id: 7, name: "Elena Ivanova", subject: "Russian", rating: 4.8, reviews: 156, price: 18, avatar: "EI", languages: ["Russian", "English"], bio: "Certified Russian teacher with 8 years of experience.", nativeSpeaker: true, availability: "evening", photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face" },
  { id: 8, name: "Tamta Gogua", subject: "Music", rating: 5.0, reviews: 73, price: 40, avatar: "TG", languages: ["Georgian", "English"], bio: "Conservatory graduate. Piano and vocal lessons for all levels.", nativeSpeaker: true, availability: "afternoon", photo: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=200&fit=crop&crop=face" },
];

const subjectEntries: { value: string; labelKey: string }[] = [
  { value: "All", labelKey: "search.all" },
  { value: "GeorgianLit", labelKey: "home.subj.georgianLit" },
  { value: "Mathematics", labelKey: "home.subj.math" },
  { value: "English", labelKey: "home.subj.english" },
  { value: "ForeignLanguages", labelKey: "home.subj.foreignLangs" },
  { value: "History", labelKey: "home.subj.history" },
  { value: "Geography", labelKey: "home.subj.geography" },
  { value: "Biology", labelKey: "home.subj.biology" },
  { value: "Physics", labelKey: "home.subj.physics" },
  { value: "Chemistry", labelKey: "home.subj.chemistry" },
  { value: "ExamGeorgianLit", labelKey: "home.subj.examGeorgianLit" },
  { value: "ExamForeignLang", labelKey: "home.subj.examForeignLang" },
  { value: "ExamHistoryMath", labelKey: "home.subj.examHistoryMath" },
  { value: "GeneralAptitude", labelKey: "home.subj.generalAptitude" },
  { value: "Robotics", labelKey: "home.subj.robotics" },
  { value: "Programming", labelKey: "home.subj.programming" },
  { value: "Art", labelKey: "home.subj.art" },
];
const ratingKeys = ["search.any", "4.5+", "4.7+", "4.9+"];
const availabilityKeys = ["search.any", "search.morning", "search.afternoon", "search.evening"];

export default function TutorSearch() {
  const [searchParams] = useSearchParams();
  const initialSubject = searchParams.get("subject") || "All";
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState(initialSubject);
  const [priceRange, setPriceRange] = useState([0, 50]);
  const [selectedRating, setSelectedRating] = useState("search.any");
  const [selectedAvailability, setSelectedAvailability] = useState("search.any");
  const [nativeSpeakerOnly, setNativeSpeakerOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const { t } = useLanguage();

  // Build a map of subject value -> translated label for search matching
  const subjectTranslationMap = Object.fromEntries(
    subjectEntries.map((s) => [s.value, t(s.labelKey).toLowerCase()])
  );

  const filtered = allTutors.filter((tutor) => {
    if (selectedSubject !== "All" && tutor.subject !== selectedSubject) return false;
    if (search) {
      const q = search.toLowerCase();
      const nameMatch = tutor.name.toLowerCase().includes(q);
      const subjectEngMatch = tutor.subject.toLowerCase().includes(q);
      const subjectTransMatch = (subjectTranslationMap[tutor.subject] || "").includes(q);
      if (!nameMatch && !subjectEngMatch && !subjectTransMatch) return false;
    }
    if (tutor.price < priceRange[0] || tutor.price > priceRange[1]) return false;
    if (selectedRating === "4.5+" && tutor.rating < 4.5) return false;
    if (selectedRating === "4.7+" && tutor.rating < 4.7) return false;
    if (selectedRating === "4.9+" && tutor.rating < 4.9) return false;
    if (selectedAvailability !== "Any" && tutor.availability !== selectedAvailability.toLowerCase()) return false;
    
    return true;
  });

  const FilterSection = ({ title, options, value, onChange }: { title: string; options: string[]; value: string; onChange: (v: string) => void }) => (
    <div className="mb-6">
      <h4 className="text-sm font-semibold mb-3">{title}</h4>
      <div className="space-y-1.5">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`block w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors ${
              value === opt ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 flex items-center gap-2 rounded-lg border bg-card px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("search.placeholder")}
              className="flex-1 bg-transparent outline-none text-sm"
            />
            {search && (
              <button onClick={() => setSearch("")}>
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="md:hidden"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-4 w-4 mr-1" />
            {t("search.filters")}
          </Button>
        </div>

        <div className="flex gap-6">
          <aside className={`w-56 shrink-0 ${showFilters ? "block" : "hidden"} md:block`}>
            <div className="sticky top-20 rounded-xl border bg-card p-4">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm">{t("search.filters")}</h3>
              </div>
              <div className="mb-6">
                <h4 className="text-sm font-semibold mb-3">{t("search.subject")}</h4>
                <div className="space-y-1.5">
                  {subjectEntries.map((subj) => (
                    <button
                      key={subj.value}
                      onClick={() => setSelectedSubject(subj.value)}
                      className={`block w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors ${
                        selectedSubject === subj.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {t(subj.labelKey)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-semibold mb-3">{t("search.pricePerHour")}</h4>
                <Slider value={priceRange} onValueChange={setPriceRange} min={0} max={50} step={5} className="mb-2" />
                <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
                  <span>₾{priceRange[0]}</span>
                  <span>₾{priceRange[1]}</span>
                </div>
              </div>

              <FilterSection title={t("search.rating")} options={ratings} value={selectedRating} onChange={setSelectedRating} />
              <FilterSection title={t("search.availability")} options={availabilityOptions} value={selectedAvailability} onChange={setSelectedAvailability} />

            </div>
          </aside>

          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-4">
              {filtered.length} {filtered.length !== 1 ? t("search.tutors") : t("search.tutor")} {t("search.found")}
            </p>
            <div className="space-y-3">
              {filtered.map((tutor, i) => (
                <motion.div key={tutor.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link
                    to={`/tutor/${tutor.id}`}
                    className="flex gap-4 rounded-xl border bg-card p-4 card-shadow hover:card-shadow-hover hover:border-primary/30 transition-all group"
                  >
                    <img src={tutor.photo} alt={tutor.name} className="h-16 w-16 rounded-lg object-cover shrink-0" loading="lazy" decoding="async" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold group-hover:text-primary transition-colors">{tutor.name}</h3>
                          <p className="text-sm text-primary font-medium">{tutor.subject}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xl font-bold tabular-nums">₾{tutor.price}<span className="text-xs font-normal text-muted-foreground">/hr</span></p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{tutor.bio}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                          <span className="text-sm font-medium tabular-nums">{tutor.rating}</span>
                          <span className="text-xs text-muted-foreground">({tutor.reviews})</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{tutor.languages.join(" · ")}</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
              {filtered.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-lg font-medium">{t("search.noResults")}</p>
                  <p className="text-sm mt-1">{t("search.adjustFilters")}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
