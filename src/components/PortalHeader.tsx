import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, Menu, UserCircle } from "lucide-react";

import { SubscribePlansDialog } from "@/components/SubscribePlansDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { Language, useLanguage } from "@/contexts/LanguageContext";

const languageLabels: Record<Language, string> = {
  en: "English",
  ka: "ქართული",
  ru: "Русский",
};

const primaryNav = [
  { to: "/dashboard", labelKey: "msg.home" },
  { to: "/messages", labelKey: "msg.messages" },
  { to: "/my-lessons", labelKey: "msg.myLessons" },
  { to: "/for-business", labelKey: "msg.forBusiness" },
] as const;

export function PortalHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const displayName = useMemo(() => {
    const source = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "";
    return source.trim();
  }, [user]);

  const initials = useMemo(() => {
    if (!displayName) return "U";
    return displayName
      .split(" ")
      .map((part: string) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [displayName]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const isActive = (path: string) => {
    if (path === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90">
      <div className="border-b border-border/60">
        <div className="container flex min-h-16 items-center justify-between gap-3 py-3">
          <Link to="/search" className="hidden text-sm font-semibold text-foreground transition-opacity hover:opacity-80 sm:inline-flex">
            {t("nav.findTutors")}
          </Link>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-accent sm:hidden"
            onClick={() => setMobileMenuOpen((value) => !value)}
            aria-label="Toggle portal menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <SubscribePlansDialog
              buttonVariant="outline"
              buttonSize="sm"
              buttonClassName="rounded-full border-border bg-background px-4 font-semibold text-foreground hover:bg-accent"
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 rounded-full px-3 text-foreground hover:bg-accent">
                  <span className="hidden sm:inline">{languageLabels[lang]}</span>
                  <span className="sm:hidden">{lang.toUpperCase()}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 rounded-2xl border-border/70 bg-popover p-1">
                {(Object.keys(languageLabels) as Language[]).map((language) => (
                  <DropdownMenuItem
                    key={language}
                    className="rounded-xl px-3 py-2"
                    onClick={() => setLang(language)}
                  >
                    {languageLabels[language]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
                  aria-label={t("nav.profile")}
                >
                  <span className="text-sm font-semibold">{initials}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 rounded-3xl border-border/70 bg-popover p-2 shadow-xl">
                <div className="flex items-center gap-3 px-3 py-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                    <span className="text-base font-semibold">{initials}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-foreground">{displayName || user?.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="rounded-xl px-3 py-3" onClick={() => navigate("/dashboard")}>
                  {t("msg.home")}
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-xl px-3 py-3" onClick={() => navigate("/messages")}>
                  {t("msg.messages")}
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-xl px-3 py-3" onClick={() => navigate("/my-lessons")}>
                  {t("msg.myLessons")}
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-xl px-3 py-3" onClick={() => navigate("/profile")}>
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
                    active
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t(item.labelKey)}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-b border-border/60 bg-background sm:hidden">
          <div className="container flex flex-col gap-2 py-4">
            <Link to="/search" className="rounded-2xl px-3 py-2 text-sm font-medium text-foreground hover:bg-accent" onClick={() => setMobileMenuOpen(false)}>
              {t("nav.findTutors")}
            </Link>
            <Link to="/profile" className="rounded-2xl px-3 py-2 text-sm font-medium text-foreground hover:bg-accent" onClick={() => setMobileMenuOpen(false)}>
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
      )}
    </header>
  );
}
