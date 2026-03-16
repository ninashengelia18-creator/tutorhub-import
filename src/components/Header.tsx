import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Bell,
  BookOpen,
  CalendarDays,
  ChevronDown,
  Globe,
  Heart,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Shield,
  UserCircle,
  X,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage, Language } from "@/contexts/LanguageContext";
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

const langLabels: Record<Language, string> = { ka: "ქარ", en: "EN", ru: "РУ" };

const navLinks = [
  { labelKey: "nav.home", href: "/" },
  { labelKey: "nav.findTutors", href: "/search" },
  { labelKey: "nav.forBusiness", href: "/for-business" },
  { labelKey: "nav.becomeTutor", href: "/become-tutor" },
  { labelKey: "nav.faq", href: "/faq" },
] as const;

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { lang, setLang, t } = useLanguage();
  const { user, signOut, isTutor } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data }) => {
      setIsAdmin(!!data);
    });
  }, [user]);

  const isPortalHeaderRoute = user && ["/dashboard", "/messages", "/my-lessons", "/profile", "/saved-tutors", "/tutor-settings", "/tutor-dashboard", "/tutor-messages", "/tutor-schedule", "/lesson-planner"].includes(location.pathname);
  const profilePath = isTutor ? "/tutor-settings" : "/profile";
  const visibleNavLinks = user && !isTutor ? navLinks.filter((link) => !["/for-business", "/become-tutor"].includes(link.href)) : navLinks;

  if (isPortalHeaderRoute) {
    return <PortalHeader />;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-18 items-center justify-between py-2">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex flex-col items-center gap-1">
            <img src={logo} alt="LearnEazy owl" className="h-[80px] w-auto" loading="eager" decoding="async" />
            <span className="text-foreground tracking-[0.25em] uppercase" style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", fontWeight: 600 }}>LearnEazy</span>
          </Link>
          <span className="hidden lg:flex flex-col text-sm font-semibold text-muted-foreground border-l border-border pl-4 tracking-wide leading-tight">
            {t("brand.tagline").split(". ").map((line, i, arr) => (
              <span key={i}>{line}{i < arr.length - 1 ? "." : ""}</span>
            ))}
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          {visibleNavLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === link.href ? "text-primary" : "text-foreground/90"
              }`}
            >
              {t(link.labelKey)}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-secondary transition-colors"
            >
              <Globe className="h-4 w-4" />
              {langLabels[lang]}
              <ChevronDown className={`h-3 w-3 transition-transform ${langOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {langOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-1 w-28 rounded-lg border bg-card shadow-lg overflow-hidden z-50"
                >
                  {(Object.keys(langLabels) as Language[]).map((l) => (
                    <button
                      key={l}
                      onClick={() => { setLang(l); setLangOpen(false); }}
                      className={`w-full px-3 py-2 text-sm text-left transition-colors ${
                        lang === l ? "bg-primary/20 text-primary font-semibold" : "text-foreground hover:bg-secondary"
                      }`}
                    >
                      {langLabels[l]}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {user ? (
            <>
              {isTutor ? (
                <>
                  <Button variant="ghost" size="sm" className="text-foreground/80 hover:text-foreground" asChild>
                    <Link to="/tutor-dashboard">
                      <LayoutDashboard className="h-4 w-4 mr-1" />
                      {t("auth.dashboard")}
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" className="text-foreground/80 hover:text-foreground" asChild>
                    <Link to="/tutor-schedule">
                      <CalendarDays className="h-4 w-4 mr-1" />
                      {t("nav.tutorSchedule")}
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" className="text-foreground/80 hover:text-foreground" asChild>
                    <Link to="/lesson-planner">
                      <BookOpen className="h-4 w-4 mr-1" />
                      {t("nav.lessonPlanner")}
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" className="text-foreground/80 hover:text-foreground" asChild>
                    <Link to={profilePath}>
                      <UserCircle className="h-4 w-4 mr-1" />
                      {t("nav.profile")}
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" className="text-foreground/80 hover:text-foreground" asChild>
                    <Link to="/dashboard">
                      <LayoutDashboard className="h-4 w-4 mr-1" />
                      {t("auth.dashboard")}
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" className="text-foreground/80 hover:text-foreground" asChild>
                    <Link to={profilePath}>
                      <UserCircle className="h-4 w-4 mr-1" />
                      {t("nav.profile")}
                    </Link>
                  </Button>
                </>
              )}
              {isAdmin && (
                <Button variant="ghost" size="sm" className="text-foreground/80 hover:text-foreground" asChild>
                  <Link to="/admin">
                    <Shield className="h-4 w-4 mr-1" />
                    {t("nav.admin")}
                  </Link>
                </Button>
              )}
              <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-secondary" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-1" />
                {t("auth.logout")}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" className="border-foreground/30 text-foreground hover:bg-foreground/10 rounded-full px-5" asChild>
                <Link to="/login">{t("nav.login")}</Link>
              </Button>
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-full px-5 font-semibold" asChild>
                <Link to="/signup">{t("nav.signup")}</Link>
              </Button>
            </>
          )}
        </div>

        <button className="md:hidden p-2 text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border/50 bg-background"
          >
            <div className="container py-4 flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2 self-start">
                <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
                  {(Object.keys(langLabels) as Language[]).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLang(l)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {langLabels[l]}
                    </button>
                  ))}
                </div>
              </div>

              {visibleNavLinks.map((link) => (
                <Link key={link.href} to={link.href} className="py-2 text-sm font-medium text-foreground/90 hover:text-primary" onClick={() => setMobileOpen(false)}>
                  {t(link.labelKey)}
                </Link>
              ))}

              <div className="flex gap-3 pt-2 border-t border-border/50">
                {user ? (
                  <>
                    {isTutor ? (
                      <>
                        <Button variant="ghost" size="sm" className="flex-1" asChild>
                          <Link to="/tutor-dashboard" onClick={() => setMobileOpen(false)}>{t("auth.dashboard")}</Link>
                        </Button>
                        <Button variant="ghost" size="sm" className="flex-1" asChild>
                          <Link to="/tutor-schedule" onClick={() => setMobileOpen(false)}>{t("nav.tutorSchedule")}</Link>
                        </Button>
                        <Button variant="ghost" size="sm" className="flex-1" asChild>
                          <Link to="/lesson-planner" onClick={() => setMobileOpen(false)}>{t("nav.lessonPlanner")}</Link>
                        </Button>
                        <Button variant="ghost" size="sm" className="flex-1" asChild>
                          <Link to={profilePath} onClick={() => setMobileOpen(false)}>{t("nav.profile")}</Link>
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="ghost" size="sm" className="flex-1" asChild>
                          <Link to="/dashboard" onClick={() => setMobileOpen(false)}>{t("auth.dashboard")}</Link>
                        </Button>
                        <Button variant="ghost" size="sm" className="flex-1" asChild>
                          <Link to={profilePath} onClick={() => setMobileOpen(false)}>{t("nav.profile")}</Link>
                        </Button>
                      </>
                    )}
                    {isAdmin && (
                      <Button variant="ghost" size="sm" className="flex-1" asChild>
                        <Link to="/admin" onClick={() => setMobileOpen(false)}>{t("nav.admin")}</Link>
                      </Button>
                    )}
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => { void handleSignOut(); setMobileOpen(false); }}>
                      {t("auth.logout")}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" size="sm" className="flex-1 rounded-full border-foreground/30" asChild>
                      <Link to="/login" onClick={() => setMobileOpen(false)}>{t("nav.login")}</Link>
                    </Button>
                    <Button size="sm" className="flex-1 bg-primary text-primary-foreground hover:bg-primary-hover rounded-full" asChild>
                      <Link to="/signup" onClick={() => setMobileOpen(false)}>{t("nav.signup")}</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
