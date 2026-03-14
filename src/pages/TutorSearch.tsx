import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Star, Filter, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

const allTutors = [
  { id: 1, name: "Nino Beridze", subject: "Mathematics", rating: 4.9, reviews: 127, price: 85, avatar: "NB", languages: ["Georgian", "English"], bio: "10+ years teaching mathematics. Specializing in calculus and algebra.", nativeSpeaker: true, availability: "morning" },
  { id: 2, name: "Giorgi Kharadze", subject: "Physics", rating: 4.8, reviews: 98, price: 100, avatar: "GK", languages: ["Georgian", "Russian"], bio: "PhD in Physics. Making complex concepts simple and fun.", nativeSpeaker: true, availability: "afternoon" },
  { id: 3, name: "Ana Melikishvili", subject: "English", rating: 5.0, reviews: 215, price: 75, avatar: "AM", languages: ["English", "Georgian"], bio: "IELTS & TOEFL specialist. Native-level English teacher.", nativeSpeaker: true, availability: "morning" },
  { id: 4, name: "Luka Tsiklauri", subject: "Programming", rating: 4.9, reviews: 164, price: 110, avatar: "LT", languages: ["English", "Georgian"], bio: "Full-stack developer teaching Python, JavaScript, and more.", nativeSpeaker: false, availability: "evening" },
  { id: 5, name: "Mariam Jashi", subject: "Chemistry", rating: 4.7, reviews: 89, price: 85, avatar: "MJ", languages: ["Georgian", "English"], bio: "University professor with a passion for organic chemistry.", nativeSpeaker: true, availability: "afternoon" },
  { id: 6, name: "Davit Lomidze", subject: "Georgian", rating: 4.9, reviews: 201, price: 60, avatar: "DL", languages: ["Georgian", "Russian", "English"], bio: "Georgian language specialist for foreigners and native speakers.", nativeSpeaker: true, availability: "morning" },
  { id: 7, name: "Elena Ivanova", subject: "Russian", rating: 4.8, reviews: 156, price: 70, avatar: "EI", languages: ["Russian", "English"], bio: "Certified Russian teacher with 8 years of experience.", nativeSpeaker: true, availability: "evening" },
  { id: 8, name: "Tamta Gogua", subject: "Music", rating: 5.0, reviews: 73, price: 125, avatar: "TG", languages: ["Georgian", "English"], bio: "Conservatory graduate. Piano and vocal lessons for all levels.", nativeSpeaker: true, availability: "afternoon" },
];

const subjects = ["All", "Mathematics", "Physics", "English", "Programming", "Chemistry", "Georgian", "Russian", "Music"];
const ratings = ["Any", "4.5+", "4.7+", "4.9+"];
const availabilityOptions = ["Any", "Morning", "Afternoon", "Evening"];

export default function TutorSearch() {
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [selectedRating, setSelectedRating] = useState("Any");
  const [selectedAvailability, setSelectedAvailability] = useState("Any");
  const [nativeSpeakerOnly, setNativeSpeakerOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = allTutors.filter((t) => {
    if (selectedSubject !== "All" && t.subject !== selectedSubject) return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.subject.toLowerCase().includes(search.toLowerCase())) return false;
    if (t.price < priceRange[0] || t.price > priceRange[1]) return false;
    if (selectedRating === "4.5+" && t.rating < 4.5) return false;
    if (selectedRating === "4.7+" && t.rating < 4.7) return false;
    if (selectedRating === "4.9+" && t.rating < 4.9) return false;
    if (selectedAvailability !== "Any" && t.availability !== selectedAvailability.toLowerCase()) return false;
    if (nativeSpeakerOnly && !t.nativeSpeaker) return false;
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
        {/* Search header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 flex items-center gap-2 rounded-lg border bg-card px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tutors by name or subject..."
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
            Filters
          </Button>
        </div>

        <div className="flex gap-6">
          {/* Sidebar filters */}
          <aside className={`w-56 shrink-0 ${showFilters ? "block" : "hidden"} md:block`}>
            <div className="sticky top-20 rounded-xl border bg-card p-4">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm">Filters</h3>
              </div>
              <FilterSection title="Subject" options={subjects} value={selectedSubject} onChange={setSelectedSubject} />

              {/* Price range slider */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold mb-3">Price per hour (₾)</h4>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  min={0}
                  max={200}
                  step={5}
                  className="mb-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
                  <span>₾{priceRange[0]}</span>
                  <span>₾{priceRange[1]}</span>
                </div>
              </div>

              <FilterSection title="Rating" options={ratings} value={selectedRating} onChange={setSelectedRating} />
              <FilterSection title="Availability" options={availabilityOptions} value={selectedAvailability} onChange={setSelectedAvailability} />

              {/* Native speaker toggle */}
              <div className="mb-4 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <Label htmlFor="native-toggle" className="text-sm font-semibold">Native Speaker</Label>
                  <Switch
                    id="native-toggle"
                    checked={nativeSpeakerOnly}
                    onCheckedChange={setNativeSpeakerOnly}
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-4">
              {filtered.length} tutor{filtered.length !== 1 ? "s" : ""} found
            </p>
            <div className="space-y-3">
              {filtered.map((tutor, i) => (
                <motion.div
                  key={tutor.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={`/tutor/${tutor.id}`}
                    className="flex gap-4 rounded-xl border bg-card p-4 card-shadow hover:card-shadow-hover hover:border-primary/30 transition-all group"
                  >
                    <div className="h-16 w-16 rounded-lg bg-primary-light flex items-center justify-center text-primary font-bold shrink-0">
                      {tutor.avatar}
                    </div>
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
                        <span className="text-xs text-muted-foreground">
                          {tutor.languages.join(" · ")}
                        </span>
                        {tutor.nativeSpeaker && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Native</span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
              {filtered.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-lg font-medium">No tutors found</p>
                  <p className="text-sm mt-1">Try adjusting your filters</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
