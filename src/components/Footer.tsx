import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import logo from "@/assets/learneazy-logo.png";

export function Footer() {
  const { t } = useLanguage();

  const aboutLinks = [
    { labelKey: "footer.howItWorks", href: "/" },
    { labelKey: "footer.faq", href: "/faq" },
    { labelKey: "footer.forBusiness", href: "/for-business" },
  ];

  const studentLinks = [
    { labelKey: "footer.findTutor", href: "/search" },
    { labelKey: "footer.schoolSubjects", href: "/search?subject=Mathematics" },
    { labelKey: "footer.examPrep", href: "/search?subject=ExamGeorgianLit" },
    { labelKey: "footer.programming", href: "/search?subject=Programming" },
    { labelKey: "footer.art", href: "/search?subject=Art" },
  ];

  const tutorLinks = [
    { labelKey: "footer.becomeTutor", href: "/become-tutor" },
    { labelKey: "footer.applyNow", href: "/tutor-apply" },
  ];

  const subjectLinks = [
    { labelKey: "home.subj.georgianLit", href: "/search?subject=GeorgianLit" },
    { labelKey: "home.subj.math", href: "/search?subject=Mathematics" },
    { labelKey: "home.subj.english", href: "/search?subject=English" },
    { labelKey: "home.subj.physics", href: "/search?subject=Physics" },
    { labelKey: "home.subj.chemistry", href: "/search?subject=Chemistry" },
    { labelKey: "home.subj.history", href: "/search?subject=History" },
    { labelKey: "home.subj.biology", href: "/search?subject=Biology" },
    { labelKey: "home.subj.programming", href: "/search?subject=Programming" },
    { labelKey: "home.subj.robotics", href: "/search?subject=Robotics" },
    { labelKey: "home.subj.art", href: "/search?subject=Art" },
  ];

  const renderLinkColumn = (titleKey: string, links: { labelKey: string; href: string }[]) => (
    <div>
      <h4 className="font-semibold text-sm text-foreground mb-3 uppercase tracking-wide">{t(titleKey)}</h4>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.labelKey}>
            <Link
              to={link.href}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {t(link.labelKey)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {renderLinkColumn("footer.aboutUs", aboutLinks)}
          {renderLinkColumn("footer.forStudents", studentLinks)}
          {renderLinkColumn("footer.forTutors", tutorLinks)}
          {renderLinkColumn("footer.subjects", subjectLinks)}
        </div>
      </div>

      {/* Support & Contact */}
      <div className="border-t">
        <div className="container py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-sm text-foreground mb-3 uppercase tracking-wide">{t("footer.support")}</h4>
              <p className="text-sm text-muted-foreground">
                <Link to="/faq" className="hover:text-primary transition-colors">{t("footer.needHelp")}</Link>
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-foreground mb-3 uppercase tracking-wide">{t("footer.contacts")}</h4>
              <p className="text-sm text-muted-foreground">
                {t("footer.location")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t">
        <div className="container py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="LearnEazy" className="h-8 w-auto" loading="lazy" decoding="async" />
            <span className="text-sm text-muted-foreground">© {new Date().getFullYear()} LearnEazy</span>
          </div>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link to="/faq" className="hover:text-primary transition-colors">{t("footer.faq")}</Link>
            <Link to="/for-business" className="hover:text-primary transition-colors">{t("footer.forBusiness")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
