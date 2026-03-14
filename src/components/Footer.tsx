import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function Footer() {
  const { t } = useLanguage();

  const footerLinks = {
    [t("footer.platform")]: [
      { label: t("footer.findTutors"), href: "/search" },
      { label: t("footer.aiPractice"), href: "/ai-practice" },
      { label: t("footer.becomeTutor"), href: "/become-tutor" },
    ],
    [t("footer.support")]: [
      { label: t("footer.faq"), href: "/faq" },
      { label: t("footer.contact"), href: "/contact" },
      { label: t("footer.privacy"), href: "/privacy" },
    ],
    [t("footer.company")]: [
      { label: t("footer.about"), href: "/about" },
      { label: t("footer.blog"), href: "/blog" },
      { label: t("footer.careers"), href: "/careers" },
    ],
  };

  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 font-bold text-lg mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <GraduationCap className="h-4 w-4 text-primary-foreground" />
              </div>
              <span>TutorHub</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("footer.desc")}
            </p>
          </div>
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-sm mb-3">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 pt-6 border-t text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} TutorHub. {t("footer.rights")}
        </div>
      </div>
    </footer>
  );
}
