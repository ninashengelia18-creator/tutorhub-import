import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Bell,
  ChevronDown,
  Heart,
  HelpCircle,
  LogOut,
  Mail,
  Menu,
  UserCircle,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/owl-logo.png";
import { PortalHeader } from "@/components/PortalHeader";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { labelKey: "nav.home", href: "/" },
  { labelKey: "nav.findTutors", href: "/search" },
  { labelKey: "nav.findLanguageBuddy", href: "/conversation-partners" },
  { labelKey: "nav.becomeLanguageBuddy", href: "/become-conversation-partner" },
  { labelKey: "nav.forProfessionals", href: "/for-professionals" },
] as const;

const k12Subjects = [
  { label: "US School Math", href: "/search?subject=US+School+Math" },
  { label: "Algebra", href: "/search?subject=Algebra" },
  { label: "Geometry", href: "/search?subject=Geometry" },
  { label: "Trigonometry", href: "/search?subject=Trigonometry" },
  { label: "Calculus", href: "/search?subject=Calculus" },
  { label: "Biology", href: "/search?subject=Biology" },
  { label: "Chemistry", href: "/search?subject=Chemistry" },
  { label: "Physics", href: "/search?subject=Physics" },
  { label: "Reading & Writing Support", href: "/search?subject=Reading+%26+Writing+Support" },
  { label: "US English / ELA", href: "/search?subject=US+English%2FELA" },
  { label: "Coding for Kids", href: "/search?subject=Coding+for+Kids" },
  { label: "Coding for Teens", href: "/search?subject=Coding+for+Teens" },
  { label: "AP Computer Science", href: "/search?subject=AP+Computer+Science" },
];

const gcseSubjects = [
  { label: "GCSE Maths", href: "/search?subject=GCSE+Maths" },
  { label: "GCSE Maths (Higher Tier)", href: "/search?subject=GCSE+Maths+Higher+Tier" },
  { label: "IGCSE Maths", href: "/search?subject=IGCSE+Maths" },
  { label: "GCSE Combined Science", href: "/search?subject=GCSE+Combined+Science" },
  { label: "GCSE Biology", href: "/search?subject=GCSE+Biology" },
  { label: "GCSE Chemistry", href: "/search?subject=GCSE+Chemistry" },
  { label: "GCSE Physics", href: "/search?subject=GCSE+Physics" },
  { label: "GCSE English Language", href: "/search?subject=GCSE+English+Language" },
  { label: "GCSE English Literature", href: "/search?subject=GCSE+English+Literature" },
];

const aLevelSubjects = [
  { label: "A‑Level Maths", href: "/search?subject=A-Level+Maths" },
  { label: "Further Maths", href: "/search?subject=Further+Maths" },
  { label: "A‑Level Physics", href: "/search?subject=A-Level+Physics" },
  { label: "A‑Level Chemistry", href: "/search?subject=A-Level+Chemistry" },
  { label: "A‑Level Biology", href: "/search?subject=A-Level+Biology" },
  { label: "A‑Level English Language", href: "/search?subject=A-Level+English+Language" },
  { label: "A‑Level English Literature", href: "/search?subject=A-Level+English+Literature" },
];

const universitySubjects = [
  { label: "Calculus", href: "/search?subject=University+Calculus" },
  { label: "Statistics & Data Analysis", href: "/search?subject=Statistics+%26+Data+Analysis" },
  { label: "Linear Algebra", href: "/search?subject=Linear+Algebra" },
  { label: "University Maths", href: "/search?subject=University+Maths" },
  { label: "English Language", href: "/search?subject=University+English+Language" },
  { label: "English Literature", href: "/search?subject=University+English+Literature" },
];

const professionalSubjects = [
  { label: "General English", href: "/search?subject=General+English" },
  { label: "Business English", href: "/search?subject=Business+English" },
  { label: "Conversation Practice", href: "/search?subject=Conversation+Practice" },
  { label: "Interview Prep", href: "/search?subject=Interview+Prep" },
  { label: "IELTS Academic", href: "/search?subject=IELTS+Academic" },
  { label: "IELTS General", href: "/search?subject=IELTS+General" },
  { label: "TOEFL", href: "/search?subject=TOEFL" },
  { label: "Python for Beginners", href: "/search?subject=Python+for+Beginners" },
  { label: "Web Development Basics", href: "/search?subject=Web+Development+Basics" },
  { label: "Data Skills for Professionals", href: "/search?subject=Data+Skills+for+Professionals" },
];

const forStudentsMenu = [
  { label: "K‑12", href: "/search?filter=Maths", children: k12Subjects },
  { label: "GCSE", href: "/search?filter=Maths", children: gcseSubjects },
  { label: "A‑Level", href: "/search?filter=Maths", children: aLevelSubjects },
  { label: "University", href: "/search?filter=Maths", children: universitySubjects },
];

function initialsFromValue(value: string) {
  return (
    value
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U"
  );
}

function MegaMenuColumn({ title, items }: { title: string; items: { label: string; href: string; children?: { label: string; href: string }[] }[] }) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <div>
      {title && <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-3">{title}</h4>}
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li
            key={item.href + item.label}
            className="relative"
            onMouseEnter={() => item.children && setHoveredItem(item.label)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <Link
              to={item.href}
              className="flex items-center justify-between text-sm text-foreground/80 hover:text-primary transition-colors py-0.5"
            >
              {item.label}
              {item.children && <ChevronDown className="h-3 w-3 -rotate-90" />}
            </Link>
            {item.children && hoveredItem === item.label && (
              <div className="absolute left-full top-0 z-50 ml-2 w-56 rounded-xl border border-border/70 bg-popover p-3 shadow-lg">
                <ul className="space-y-1">
                  {item.children.map((child) => (
                    <li key={child.href + child.label}>
                      <Link
                        to={child.href}
                        className="block text-sm text-foreground/80 hover:text-primary transition-colors py-0.5"
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [convDropdownOpen, setConvDropdownOpen] = useState(false);
  const [proDropdownOpen, setProDropdownOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, signOut, isTutor, isConvoPartner } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }

    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data }) => {
      setIsAdmin(!!data);
    });
  }, [user]);

  // Close mega menu on route change
  useEffect(() => {
    setMegaOpen(false);
    setConvDropdownOpen(false);
    setProDropdownOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  const portalPaths = [
      "/dashboard",
      "/messages",
      "/my-lessons",
      "/profile",
      "/saved-tutors",
      "/tutor-settings",
      "/tutor-dashboard",
      "/tutor-messages",
      "/tutor-schedule",
      "/lesson-planner",
      "/tutor-profile-edit",
      "/partner-dashboard",
      "/partner-messages",
      "/partner-schedule",
      "/partner-settings",
      "/partner-profile-edit",
      "/faq",
    ];

  const isPortalHeaderRoute = user && (isTutor || isConvoPartner) && portalPaths.includes(location.pathname);
  const isStudentPortalRoute = user && !isTutor && !isConvoPartner && portalPaths.includes(location.pathname);

  const profilePath = isConvoPartner ? "/partner-settings" : isTutor ? "/tutor-settings" : "/profile";
  const dashboardPath = isConvoPartner ? "/partner-dashboard" : isTutor ? "/tutor-dashboard" : "/dashboard";
  const visibleNavLinks =
    user && !isTutor
      ? navLinks.filter((link) => !["/for-professionals", "/become-tutor", "/conversation-partners", "/become-conversation-partner"].includes(link.href))
      : navLinks;

  const authDisplayName = user?.email?.split("@")[0] || "User";

  if (isPortalHeaderRoute || isStudentPortalRoute) {
    return <PortalHeader />;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-header text-white">
      <div className="container flex h-18 items-center justify-between py-2">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex flex-col items-center gap-1">
            <img src={logo} alt="LearnEazy owl" className="h-[80px] w-auto" loading="eager" decoding="async" />
            <span
              className="text-white uppercase tracking-[0.25em] font-bold"
              style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px" }}
            >
              LearnEazy
            </span>
          </Link>
          <span className="hidden lg:flex flex-col border-l border-border pl-4 text-sm font-bold italic leading-tight tracking-wide text-white">
            {t("brand.tagline")
              .split(". ")
              .map((line, index, items) => (
                <span key={index}>
                  {line}
                  {index < items.length - 1 ? "." : ""}
                </span>
              ))}
          </span>
        </div>

        <div className="hidden items-center gap-10 md:flex">
          <nav className="flex items-center gap-6" style={{ fontFamily: "'Playfair Display', serif" }}>
            <Link
              to="/"
              className={`text-sm font-bold transition-colors hover:text-primary ${
                location.pathname === "/" ? "text-primary" : "text-white"
              }`}
            >
              {t("nav.home")}
            </Link>

            {/* For Students mega-menu trigger — hide for tutors/partners */}
            {!isTutor && !isConvoPartner && (
              <div
                className="relative"
                onMouseEnter={() => setMegaOpen(true)}
                onMouseLeave={() => setMegaOpen(false)}
              >
                <button
                  type="button"
                  className="flex items-center gap-1 text-sm font-bold text-white transition-colors hover:text-primary"
                  onClick={() => setMegaOpen((v) => !v)}
                >
                  Find a Tutor <ChevronDown className={`h-3.5 w-3.5 transition-transform ${megaOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {megaOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 top-full z-50 mt-2 w-64 rounded-2xl border border-border/70 bg-popover p-5 shadow-xl"
                    >
                      <MegaMenuColumn title="" items={forStudentsMenu} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {!user && (
              <>
                <div
                  className="relative"
                  onMouseEnter={() => setConvDropdownOpen(true)}
                  onMouseLeave={() => setConvDropdownOpen(false)}
                >
                  <button
                    type="button"
                    className={`flex items-center gap-1 text-sm font-bold transition-colors hover:text-primary ${
                      ["/conversation-partners", "/become-conversation-partner"].includes(location.pathname) ? "text-primary" : "text-white"
                    }`}
                    onClick={() => setConvDropdownOpen((v) => !v)}
                  >
                    Find a Language Buddy <ChevronDown className={`h-3.5 w-3.5 transition-transform ${convDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {convDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 top-full z-50 mt-2 w-60 rounded-xl border border-border/70 bg-popover p-2 shadow-xl"
                      >
                        <Link
                          to="/conversation-partners"
                          className="block rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-primary"
                        >
                          Find a Buddy
                          <span className="block text-xs font-normal text-muted-foreground">Browse & book conversation sessions</span>
                        </Link>
                        <Link
                          to="/become-conversation-partner"
                          className="block rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-primary"
                        >
                          Become a Buddy
                          <span className="block text-xs font-normal text-muted-foreground">Earn money having conversations</span>
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div
                  className="relative"
                  onMouseEnter={() => setProDropdownOpen(true)}
                  onMouseLeave={() => setProDropdownOpen(false)}
                >
                  <Link
                    to="/for-professionals"
                    className={`flex items-center gap-1 text-sm font-bold transition-colors hover:text-primary ${
                      location.pathname === "/for-professionals" ? "text-primary" : "text-white"
                    }`}
                  >
                    For Professionals <ChevronDown className={`h-3.5 w-3.5 transition-transform ${proDropdownOpen ? "rotate-180" : ""}`} />
                  </Link>

                  <AnimatePresence>
                    {proDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 top-full z-50 mt-2 w-72 rounded-2xl border border-border/70 bg-popover p-4 shadow-xl"
                      >
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">ESL & Business English</p>
                        <div className="space-y-0.5">
                          {professionalSubjects.slice(0, 7).map((s) => (
                            <Link
                              key={s.label}
                              to={s.href}
                              className="block rounded-lg px-3 py-1.5 text-sm text-foreground/80 transition-colors hover:bg-accent hover:text-primary"
                            >
                              {s.label}
                            </Link>
                          ))}
                        </div>
                        <div className="my-2 border-t border-border/50" />
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Coding for Career Change</p>
                        <div className="space-y-0.5">
                          {professionalSubjects.slice(7).map((s) => (
                            <Link
                              key={s.label}
                              to={s.href}
                              className="block rounded-lg px-3 py-1.5 text-sm text-foreground/80 transition-colors hover:bg-accent hover:text-primary"
                            >
                              {s.label}
                            </Link>
                          ))}
                        </div>
                        <div className="my-2 border-t border-border/50" />
                        <Link
                          to="/for-professionals"
                          className="block rounded-lg px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-accent"
                        >
                          View All Professional Subjects →
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <Link
                  to="/faq"
                  className="flex items-center justify-center transition-all hover:scale-110"
                  aria-label="FAQ"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full border-[2.5px] border-white">
                    <span className="text-sm font-bold leading-none text-white">?</span>
                  </div>
                </Link>
              </>
            )}

            {user && !isTutor && !isConvoPartner && (
              <>
                <Link
                  to="/search"
                  className={`text-sm font-bold transition-colors hover:text-primary ${
                    location.pathname === "/search" ? "text-primary" : "text-white"
                  }`}
                >
                  {t("nav.findTutors")}
                </Link>
                <Link
                  to={dashboardPath}
                  className={`text-sm font-bold transition-colors hover:text-primary ${
                    location.pathname === dashboardPath ? "text-primary" : "text-white"
                  }`}
                >
                  {t("auth.dashboard")}
                </Link>
                <Link
                  to="/my-lessons"
                  className={`text-sm font-bold transition-colors hover:text-primary ${
                    location.pathname === "/my-lessons" ? "text-primary" : "text-white"
                  }`}
                >
                  {t("msg.myLessons")}
                </Link>
              </>
            )}
            {user && (isTutor || isConvoPartner) && (
              <>
                <Link
                  to={dashboardPath}
                  className={`text-sm font-bold transition-colors hover:text-primary ${
                    location.pathname === dashboardPath ? "text-primary" : "text-white"
                  }`}
                >
                  {t("auth.dashboard")}
                </Link>
                <Link
                  to={isTutor ? "/tutor-messages" : "/partner-messages"}
                  className={`text-sm font-bold transition-colors hover:text-primary ${
                    ["/tutor-messages", "/partner-messages"].includes(location.pathname) ? "text-primary" : "text-white"
                  }`}
                >
                  {t("msg.messages")}
                </Link>
                <Link
                  to={isTutor ? "/tutor-schedule" : "/partner-schedule"}
                  className={`text-sm font-bold transition-colors hover:text-primary ${
                    ["/tutor-schedule", "/partner-schedule"].includes(location.pathname) ? "text-primary" : "text-white"
                  }`}
                >
                  {t("nav.schedule")}
                </Link>
                {isTutor && (
                  <Link
                    to="/lesson-planner"
                    className={`text-sm font-bold transition-colors hover:text-primary ${
                      location.pathname === "/lesson-planner" ? "text-primary" : "text-white"
                    }`}
                  >
                    {t("nav.lessonPlanner")}
                  </Link>
                )}
                <Link
                  to={profilePath}
                  className={`text-sm font-bold transition-colors hover:text-primary ${
                    location.pathname === profilePath ? "text-primary" : "text-white"
                  }`}
                >
                  Account Settings
                </Link>
              </>
            )}
          </nav>

          {user ? (
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-14 w-14 rounded-2xl border border-border bg-secondary/60 text-primary-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                asChild
              >
                <Link to={isTutor ? "/tutor-messages" : "/messages"} aria-label={t("msg.messages")}>
                  <Mail className="h-5 w-5" />
                </Link>
              </Button>

              {!isTutor ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-14 w-14 rounded-2xl border border-border bg-secondary/60 text-primary-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                  asChild
                >
                  <Link to="/saved-tutors" aria-label="Saved tutors">
                    <Heart className="h-5 w-5" />
                  </Link>
                </Button>
              ) : null}

              <Button
                variant="ghost"
                size="icon"
                className="h-14 w-14 rounded-2xl border border-border bg-secondary/60 text-primary-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                asChild
              >
                <Link to="/faq" aria-label="FAQ">
                  <HelpCircle className="h-5 w-5" />
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-14 w-14 rounded-2xl border border-border bg-secondary/60 text-primary-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                    aria-label="Notifications"
                  >
                    <Bell className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-2xl border-border/70 bg-popover p-2">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="rounded-xl px-3 py-3 text-sm text-muted-foreground">
                    No new notifications
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-border bg-primary text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                    aria-label={t("nav.profile")}
                  >
                    <Avatar className="h-14 w-14">
                      <AvatarFallback className="bg-primary text-sm font-semibold text-primary-foreground">
                        {initialsFromValue(authDisplayName)}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-2xl border-border/70 bg-popover p-2">
                  <DropdownMenuLabel className="truncate px-3 py-2">{authDisplayName}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {isAdmin ? (
                    <DropdownMenuItem className="rounded-xl px-3 py-3" onClick={() => navigate("/admin")}>
                      {t("nav.admin")}
                    </DropdownMenuItem>
                  ) : null}
                  <DropdownMenuItem className="rounded-xl px-3 py-3" onClick={() => navigate(dashboardPath)}>
                    {t("auth.dashboard")}
                  </DropdownMenuItem>
                  {isTutor ? (
                    <>
                      <DropdownMenuItem className="rounded-xl px-3 py-3" onClick={() => navigate("/tutor-messages")}>
                        {t("msg.messages")}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="rounded-xl px-3 py-3" onClick={() => navigate("/tutor-schedule")}>
                        {t("nav.schedule")}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="rounded-xl px-3 py-3" onClick={() => navigate("/lesson-planner")}>
                        {t("nav.lessonPlanner")}
                      </DropdownMenuItem>
                    </>
                  ) : isConvoPartner ? (
                    <>
                      <DropdownMenuItem className="rounded-xl px-3 py-3" onClick={() => navigate("/partner-messages")}>
                        {t("msg.messages")}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="rounded-xl px-3 py-3" onClick={() => navigate("/partner-schedule")}>
                        {t("nav.schedule")}
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem className="rounded-xl px-3 py-3" onClick={() => navigate("/messages")}>
                        {t("msg.messages")}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="rounded-xl px-3 py-3" onClick={() => navigate("/my-lessons")}>
                        {t("msg.myLessons")}
                      </DropdownMenuItem>
                    </>
                  )}
                  {(isTutor || isConvoPartner) && (
                    <DropdownMenuItem className="rounded-xl px-3 py-3" onClick={() => navigate(isTutor ? "/tutor-profile-edit" : "/partner-profile-edit")}>
                      <UserCircle className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem className="rounded-xl px-3 py-3" onClick={() => navigate(profilePath)}>
                    <UserCircle className="mr-2 h-4 w-4" />
                    Account Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="rounded-xl px-3 py-3" onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {t("auth.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-foreground/30 px-5 text-foreground hover:bg-foreground/10"
                asChild
              >
                <Link to="/login">{t("nav.login")}</Link>
              </Button>
              <Button
                size="sm"
                className="rounded-full bg-primary px-5 font-semibold text-primary-foreground hover:bg-primary-hover"
                asChild
              >
                <Link to="/signup">{t("nav.signup")}</Link>
              </Button>
            </div>
          )}
        </div>

        <button className="p-2 text-foreground md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-border/50 bg-background md:hidden"
          >
            <div className="container flex flex-col gap-3 py-4">
              {visibleNavLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="py-2 text-sm font-medium text-foreground/90 hover:text-primary"
                  onClick={() => setMobileOpen(false)}
                >
                  {t(link.labelKey)}
                </Link>
              ))}

              <div className="flex gap-3 border-t border-border/50 pt-2">
                {user ? (
                  <>
                    {isTutor ? (
                      <>
                        <Button variant="ghost" size="sm" className="flex-1" asChild>
                          <Link to="/tutor-dashboard" onClick={() => setMobileOpen(false)}>
                            {t("auth.dashboard")}
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" className="flex-1" asChild>
                          <Link to="/tutor-schedule" onClick={() => setMobileOpen(false)}>
                            {t("nav.tutorSchedule")}
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" className="flex-1" asChild>
                          <Link to="/lesson-planner" onClick={() => setMobileOpen(false)}>
                            {t("nav.lessonPlanner")}
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" className="flex-1" asChild>
                          <Link to={profilePath} onClick={() => setMobileOpen(false)}>
                            Account Settings
                          </Link>
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="ghost" size="sm" className="flex-1" asChild>
                          <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
                            {t("auth.dashboard")}
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" className="flex-1" asChild>
                          <Link to={profilePath} onClick={() => setMobileOpen(false)}>
                            Account Settings
                          </Link>
                        </Button>
                      </>
                    )}
                    {isAdmin ? (
                      <Button variant="ghost" size="sm" className="flex-1" asChild>
                        <Link to="/admin" onClick={() => setMobileOpen(false)}>
                          {t("nav.admin")}
                        </Link>
                      </Button>
                    ) : null}
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        void handleSignOut();
                        setMobileOpen(false);
                      }}
                    >
                      {t("auth.logout")}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" size="sm" className="flex-1 rounded-full border-foreground/30" asChild>
                      <Link to="/login" onClick={() => setMobileOpen(false)}>
                        {t("nav.login")}
                      </Link>
                    </Button>
                    <Button size="sm" className="flex-1 rounded-full bg-primary text-primary-foreground hover:bg-primary-hover" asChild>
                      <Link to="/signup" onClick={() => setMobileOpen(false)}>
                        {t("nav.signup")}
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
