import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bell, ChevronDown, Heart, LifeBuoy, LogOut, Mail, Menu, UserCircle } from "lucide-react";

import logo from "@/assets/owl-logo.png";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { Language, useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { getSavedTutors, subscribeToSavedTutors } from "@/lib/savedTutors";

const studentPrimaryNav = [
  { to: "/dashboard", labelKey: "msg.home" },
  { to: "/messages", labelKey: "msg.messages" },
  { to: "/my-lessons", labelKey: "msg.myLessons" },
] as const;

const tutorPrimaryNav = [
  { to: "/tutor-dashboard", labelKey: "nav.dashboard" },
  { to: "/tutor-messages", labelKey: "msg.messages" },
  { to: "/tutor-schedule", labelKey: "nav.schedule" },
  { to: "/lesson-planner", labelKey: "nav.lessonPlanner" },
] as const;

function initialsFromName(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";
}

export function PortalHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, profile, isTutor } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
  const [notifications, setNotifications] = useState<string[]>([]);

  const displayName = useMemo(() => {
    const source = profile?.display_name || user?.user_metadata?.display_name || user?.email?.split("@")[0] || "";
    return source.trim();
  }, [profile?.display_name, user]);

  const initials = useMemo(() => initialsFromName(displayName), [displayName]);
  const profilePath = isTutor ? "/tutor-settings" : "/profile";

  useEffect(() => {
    const syncSaved = () => setSavedCount(getSavedTutors().length);
    syncSaved();
    return subscribeToSavedTutors(syncSaved);
  }, []);

  useEffect(() => {
    if (!user) return;

    const loadUnread = async () => {
      const unreadQuery = supabase
        .from("messages" as never)
        .select("id", { count: "exact", head: true })
        .eq(isTutor ? "tutor_name" : "student_id", isTutor ? displayName : user.id)
        .eq("sender_type", isTutor ? "student" : "tutor")
        .is("read_at", null);

      const { count } = await unreadQuery;
      setUnreadCount(count ?? 0);
    };

    const loadNotifications = async () => {
      const today = new Date().toISOString().split("T")[0];
      const bookingsQuery = supabase
        .from("bookings")
        .select("tutor_name, student_name, subject, lesson_date, start_time")
        .gte("lesson_date", today)
        .in("status", ["pending", "confirmed"])
        .order("lesson_date", { ascending: true })
        .order("start_time", { ascending: true })
        .limit(3);

      const { data } = await (isTutor
        ? bookingsQuery.eq("tutor_name", displayName)
        : bookingsQuery.eq("student_id", user.id));

      setNotifications(
        (data ?? []).map((booking) =>
          isTutor
            ? `${booking.subject} · ${booking.student_name || "Student"} · ${booking.lesson_date} ${booking.start_time.slice(0, 5)}`
            : `${booking.subject} · ${booking.tutor_name} · ${booking.lesson_date} ${booking.start_time.slice(0, 5)}`,
        ),
      );
    };

    void loadUnread();
    void loadNotifications();

    const channel = supabase
      .channel(`portal-header-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages", filter: isTutor ? `tutor_name=eq.${displayName}` : `student_id=eq.${user.id}` },
        () => {
          void loadUnread();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [displayName, isTutor, user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const isActive = (path: string) => {
    if (path === "/dashboard" || path === "/tutor-dashboard") return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const primaryNav = isTutor
    ? tutorPrimaryNav.map((item) => ({ to: item.to, label: t(item.labelKey) }))
    : studentPrimaryNav.map((item) => ({ to: item.to, label: t(item.labelKey) }));

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90">
      <div className="border-b border-border/60">
        <div className="container flex min-h-24 items-center justify-between gap-3 py-3">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-secondary/60 text-primary-foreground transition-colors hover:bg-primary sm:hidden"
              onClick={() => setMobileMenuOpen((value) => !value)}
              aria-label="Toggle portal menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <Link to={isTutor ? "/tutor-dashboard" : "/dashboard"} className="flex items-center gap-4">
              <div className="flex flex-col items-center gap-1">
                <img src={logo} alt="LearnEazy owl" className="h-[80px] w-auto" loading="eager" decoding="async" />
                <span className="text-base font-semibold uppercase tracking-[0.25em] text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                  LearnEazy
                </span>
              </div>
              <span className="hidden lg:flex flex-col border-l border-border pl-4 text-sm font-semibold leading-tight tracking-wide text-muted-foreground">
                {t("brand.tagline").split(". ").map((line, i, arr) => (
                  <span key={i}>{line}{i < arr.length - 1 ? "." : ""}</span>
                ))}
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">

            <Button variant="ghost" size="icon" className="relative rounded-full" asChild>
              <Link to={isTutor ? "/tutor-messages" : "/messages"} aria-label={t("msg.messages")}>
                <Mail className="h-4 w-4" />
                {unreadCount > 0 ? (
                  <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                    {Math.min(unreadCount, 9)}
                  </span>
                ) : null}
              </Link>
            </Button>

            {!isTutor ? (
              <Button variant="ghost" size="icon" className="relative rounded-full" asChild>
                <Link to="/saved-tutors" aria-label="Saved tutors">
                  <Heart className="h-4 w-4" />
                  {savedCount > 0 ? <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-primary" /> : null}
                </Link>
              </Button>
            ) : null}

            <Button variant="ghost" size="icon" className="rounded-full" asChild>
              <Link to="/faq" aria-label="FAQ">
                <LifeBuoy className="h-4 w-4" />
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative rounded-full" aria-label="Notifications">
                  <Bell className="h-4 w-4" />
                  {notifications.length > 0 ? <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-primary" /> : null}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 rounded-2xl border-border/70 bg-popover p-2">
                <DropdownMenuLabel>{isTutor ? "Tutor updates" : t("nav.home")}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length > 0 ? (
                  notifications.map((item) => (
                    <DropdownMenuItem key={item} className="whitespace-normal rounded-xl px-3 py-3 text-sm">
                      {item}
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem className="rounded-xl px-3 py-3 text-sm text-muted-foreground">No new notifications</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 rounded-full px-3 text-foreground hover:bg-accent">
                  <span className="hidden sm:inline">{lang === "en" ? "English" : lang === "ka" ? "ქართული" : "Русский"}</span>
                  <span className="sm:hidden">{lang.toUpperCase()}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 rounded-2xl border-border/70 bg-popover p-1">
                {(["en", "ka", "ru"] as const).map((language) => (
                  <DropdownMenuItem key={language} className="rounded-xl px-3 py-2" onClick={() => setLang(language)}>
                    {language === "en" ? "English" : language === "ka" ? "ქართული" : "Русский"}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-primary text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
                  aria-label={t("nav.profile")}
                >
                  <Avatar className="h-11 w-11 rounded-2xl">
                    <AvatarImage src={profile?.avatar_url || undefined} alt={displayName || user?.email || "User"} className="object-cover" />
                    <AvatarFallback className="rounded-2xl bg-primary text-sm font-semibold text-primary-foreground">{initials}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 rounded-3xl border-border/70 bg-popover p-2 shadow-xl">
                <div className="flex items-center gap-3 px-3 py-3">
                  <Avatar className="h-12 w-12 rounded-2xl">
                    <AvatarImage src={profile?.avatar_url || undefined} alt={displayName || user?.email || "User"} className="object-cover" />
                    <AvatarFallback className="rounded-2xl bg-primary text-base font-semibold text-primary-foreground">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-foreground">{displayName || user?.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                {primaryNav.map((item) => (
                  <DropdownMenuItem key={item.to} className="rounded-xl px-3 py-3" onClick={() => navigate(item.to)}>{item.label}</DropdownMenuItem>
                ))}
                {!isTutor ? <DropdownMenuItem className="rounded-xl px-3 py-3" onClick={() => navigate("/saved-tutors")}>Saved tutors</DropdownMenuItem> : null}
                <DropdownMenuItem className="rounded-xl px-3 py-3" onClick={() => navigate(profilePath)}>
                  <UserCircle className="mr-2 h-4 w-4" />
                  {t("nav.profile")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="rounded-xl px-3 py-3" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {t("auth.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="border-b border-border/60 bg-card/60">
        <div className="container overflow-x-auto">
          <nav className="flex min-w-max items-center gap-6 sm:gap-10">
            {primaryNav.map((item) => {
              const active = isActive(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`border-b-2 px-1 py-4 text-sm font-semibold transition-colors ${
                    active ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {mobileMenuOpen ? (
        <div className="border-b border-border/60 bg-background sm:hidden">
          <div className="container flex flex-col gap-2 py-4">
            <div className="mb-2 border-b border-border/60 pb-4">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                LearnEazy
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t("brand.tagline")}</p>
            </div>
            <Link to={profilePath} className="rounded-2xl px-3 py-2 text-sm font-medium text-foreground hover:bg-accent" onClick={() => setMobileMenuOpen(false)}>
              {t("nav.profile")}
            </Link>
            <button
              type="button"
              className="rounded-2xl px-3 py-2 text-left text-sm font-medium text-foreground hover:bg-accent"
              onClick={() => {
                setMobileMenuOpen(false);
                void handleSignOut();
              }}
            >
              {t("auth.logout")}
            </button>
          </div>
        </div>
      ) : null}
    </header>
  );
}
