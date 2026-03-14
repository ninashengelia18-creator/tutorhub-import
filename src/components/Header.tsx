import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import logo from "@/assets/learneazy-logo.png";

const langLabels: Record<Language, string> = { en: "EN", ka: "ქარ", ru: "РУ" };

const navLinks = [
  { labelKey: "nav.home", href: "/" },
  { labelKey: "nav.findTutors", href: "/search" },
  { labelKey: "nav.forBusiness", href: "/for-business" },
  { labelKey: "nav.becomeTutor", href: "/become-tutor" },
  { labelKey: "nav.faq", href: "/faq" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { lang, setLang, t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-1">
            <img src={logo} alt="LearnEazy" className="h-[70px] w-auto" />
          </Link>
          <span className="hidden lg:inline text-sm font-bold text-primary border-l pl-3">Learn Smarter, Not Harder</span>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`text-sm font-bold transition-colors hover:text-foreground/70 ${
                location.pathname === link.href
                  ? "text-foreground"
                  : "text-foreground"
              }`}
            >
              {t(link.labelKey)}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {/* Language switcher */}
          <div className="flex items-center gap-0.5 bg-muted rounded-md p-0.5">
            {(Object.keys(langLabels) as Language[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  lang === l
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {langLabels[l]}
              </button>
            ))}
          </div>

          <Button variant="ghost" size="sm" asChild>
            <Link to="/login">{t("nav.login")}</Link>
          </Button>
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 border-0" asChild>
            <Link to="/search">{t("nav.signup")}</Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t bg-background"
          >
            <div className="container py-4 flex flex-col gap-3">
              {/* Mobile language switcher */}
              <div className="flex items-center gap-1 bg-muted rounded-md p-0.5 self-start">
                {(Object.keys(langLabels) as Language[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                      lang === l
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {langLabels[l]}
                  </button>
                ))}
              </div>

              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="py-2 text-sm font-bold text-foreground hover:text-foreground/70"
                  onClick={() => setMobileOpen(false)}
                >
                  {t(link.labelKey)}
                </Link>
              ))}
              <div className="flex gap-3 pt-2 border-t">
                <Button variant="ghost" size="sm" className="flex-1" asChild>
                  <Link to="/login">{t("nav.login")}</Link>
                </Button>
                <Button size="sm" className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 border-0" asChild>
                  <Link to="/search">{t("nav.signup")}</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
