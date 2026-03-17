import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Bell,
  Heart,
  HelpCircle,
  LogOut,
  Mail,
  Menu,
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
  { labelKey: "nav.forBusiness", href: "/for-business" },
  { labelKey: "nav.becomeTutor", href: "/become-tutor" },
  { labelKey: "nav.faq", href: "/faq" },
] as const;

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

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, signOut, isTutor } = useAuth();

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

  const isPortalHeaderRoute =
    user &&
    [
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
    ].includes(location.pathname);

  const profilePath = isTutor ? "/tutor-settings" : "/profile";
  const dashboardPath = isTutor ? "/tutor-dashboard" : "/dashboard";
  const visibleNavLinks =
    user && !isTutor
      ? navLinks.filter((link) => !["/for-business", "/become-tutor", "/faq"].includes(link.href))
      : navLinks;

  const headerNavLinks = user
    ? isTutor
      ? [
          { href: "/", label: t("nav.home") },
          { href: "/search", label: t("nav.findTutors") },
          { href: dashboardPath, label: t("auth.dashboard") },
          { href: profilePath, label: t("nav.profile") },
        ]
      : [
          { href: "/", label: t("nav.home") },
          { href: "/search", label: t("nav.findTutors") },
          { href: dashboardPath, label: t("auth.dashboard") },
          { href: "/my-lessons", label: t("msg.myLessons") },
        ]
    : visibleNavLinks.map((link) => ({ href: link.href, label: t(link.labelKey) }));

  const authDisplayName = user?.email?.split("@")[0] || "User";

  if (isPortalHeaderRoute) {
    return <PortalHeader />;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-18 items-center justify-between py-2">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex flex-col items-center gap-1">
            <img src={logo} alt="LearnEazy owl" className="h-[80px] w-auto" loading="eager" decoding="async" />
            <span
              className="text-foreground uppercase tracking-[0.25em]"
              style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", fontWeight: 600 }}
            >
              LearnEazy
            </span>
          </Link>
          <span className="hidden lg:flex flex-col border-l border-border pl-4 text-sm font-semibold leading-tight tracking-wide text-muted-foreground">
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
          <nav className="flex items-center gap-6">
            {headerNavLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === link.href ? "text-primary" : "text-foreground/90"
                }`}
              >
                {link.label}
              </Link>
            ))}
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
                            {t("nav.profile")}
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
                            {t("nav.profile")}
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
