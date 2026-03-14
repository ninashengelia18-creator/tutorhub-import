import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Star, Users, BookOpen, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import heroImage from "@/assets/hero-tutor.jpg";

const subjects = ["Mathematics", "English", "Physics", "Chemistry", "Georgian", "Russian", "Programming", "Music"];

const featuredTutors = [
  { id: 1, name: "Nino Beridze", subject: "Mathematics", rating: 4.9, reviews: 127, price: 85, avatar: "NB", language: "Georgian, English" },
  { id: 2, name: "Giorgi Kharadze", subject: "Physics", rating: 4.8, reviews: 98, price: 100, avatar: "GK", language: "Georgian, Russian" },
  { id: 3, name: "Ana Melikishvili", subject: "English", rating: 5.0, reviews: 215, price: 75, avatar: "AM", language: "English, Georgian" },
  { id: 4, name: "Luka Tsiklauri", subject: "Programming", rating: 4.9, reviews: 164, price: 110, avatar: "LT", language: "English, Georgian" },
];

const stats = [
  { value: "5,000+", label: "Expert Tutors" },
  { value: "50,000+", label: "Lessons Completed" },
  { value: "4.8", label: "Average Rating" },
  { value: "30+", label: "Subjects" },
];

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
};

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="container relative py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeUp} className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary-light px-4 py-1.5 text-sm font-medium text-accent-foreground">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse-dot" />
                Trusted by 50,000+ students
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-balance leading-[1.1]">
                Find the perfect
                <span className="block text-primary"> tutor for you</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
                Connect with expert tutors in any subject. Personalized 1-on-1 lessons that fit your schedule and learning goals.
              </p>

              {/* Search bar */}
              <div className="flex items-center gap-2 rounded-xl border bg-card p-2 card-shadow max-w-lg">
                <Search className="h-5 w-5 text-muted-foreground ml-2" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="What do you want to learn?"
                  className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground py-2"
                />
                <Button className="hero-gradient text-primary-foreground border-0" asChild>
                  <Link to={`/search${searchQuery ? `?q=${searchQuery}` : ""}`}>
                    Search
                  </Link>
                </Button>
              </div>

              {/* Subject tags */}
              <div className="flex flex-wrap gap-2">
                {subjects.slice(0, 5).map((s) => (
                  <Link
                    key={s}
                    to={`/search?subject=${s}`}
                    className="rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    {s}
                  </Link>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              className="hidden md:block"
            >
              <div className="relative rounded-2xl overflow-hidden card-shadow-hover">
                <img
                  src={heroImage}
                  alt="Tutor teaching student online"
                  className="w-full h-auto object-cover rounded-2xl"
                />
                <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-card/90 backdrop-blur-sm border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">Next Lesson</p>
                      <p className="text-xs text-muted-foreground">Mathematics with Nino B.</p>
                    </div>
                    <Button size="sm" className="hero-gradient text-primary-foreground border-0">
                      Join Now
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="py-8 text-center border-r last:border-r-0"
              >
                <p className="text-2xl md:text-3xl font-bold text-primary tabular-nums">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tutors */}
      <section className="container py-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-8"
        >
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Featured Tutors</h2>
            <p className="text-muted-foreground mt-1">Top-rated educators ready to help you succeed</p>
          </div>
          <Button variant="ghost" className="text-primary" asChild>
            <Link to="/search">View all <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredTutors.map((tutor, i) => (
            <motion.div
              key={tutor.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                to={`/tutor/${tutor.id}`}
                className="block rounded-xl border bg-card p-4 card-shadow hover:card-shadow-hover hover:border-primary/30 transition-all duration-300 group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-12 w-12 rounded-lg bg-primary-light flex items-center justify-center text-primary font-bold text-sm">
                    {tutor.avatar}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{tutor.name}</h3>
                    <p className="text-xs text-muted-foreground">{tutor.subject}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 mb-2">
                  <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                  <span className="text-sm font-medium tabular-nums">{tutor.rating}</span>
                  <span className="text-xs text-muted-foreground">({tutor.reviews} reviews)</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{tutor.language}</p>
                <div className="flex items-center justify-between pt-3 border-t">
                  <span className="text-lg font-bold tabular-nums">₾{tutor.price}<span className="text-xs font-normal text-muted-foreground">/hr</span></span>
                  <Button size="sm" variant="outline" className="text-xs h-7 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground">
                    Book Trial
                  </Button>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted/30 py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold">How TutorHub Works</h2>
            <p className="text-muted-foreground mt-2">Start learning in 3 simple steps</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Search, title: "Find Your Tutor", desc: "Browse expert tutors by subject, price, and availability." },
              { icon: BookOpen, title: "Book a Lesson", desc: "Choose a time that works for you and book with one click." },
              { icon: CheckCircle, title: "Start Learning", desc: "Join your AI-powered classroom and achieve your goals." },
            ].map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className="mx-auto h-14 w-14 rounded-xl hero-gradient flex items-center justify-center mb-4">
                  <step.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-16">
        <div className="rounded-2xl hero-gradient p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-3">
            Ready to start learning?
          </h2>
          <p className="text-primary-foreground/80 mb-6 max-w-md mx-auto">
            Join thousands of students already learning with TutorHub. Your first trial lesson is free.
          </p>
          <Button size="lg" variant="secondary" className="font-semibold" asChild>
            <Link to="/search">Find a Tutor <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
