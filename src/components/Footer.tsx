import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Facebook, Instagram, Youtube, Linkedin } from "lucide-react";
import logo from "@/assets/learneazy-logo.png";

const socialLinks = [
  { icon: Facebook, label: "Facebook", href: "https://facebook.com/learneazy" },
  { icon: Instagram, label: "Instagram", href: "https://instagram.com/learneazy" },
  { icon: Youtube, label: "YouTube", href: "https://youtube.com/@learneazy" },
  { icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com/company/learneazy" },
];

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

  const learnLinks = [
    { labelKey: "footer.learnEnglish", href: "/search?subject=English" },
    { labelKey: "footer.learnSpanish", href: "/search?subject=Spanish" },
    { labelKey: "footer.learnFrench", href: "/search?subject=French" },
    { labelKey: "footer.learnGerman", href: "/search?subject=German" },
    { labelKey: "footer.learnGeorgian", href: "/search?subject=Georgian" },
    { labelKey: "footer.learnItalian", href: "/search?subject=Italian" },
    { labelKey: "footer.learnAnother", href: "/search" },
  ];

  const onlineClassLinks = [
    { labelKey: "footer.onlineEnglishClasses", href: "/search?subject=English" },
    { labelKey: "footer.businessEnglish", href: "/search?subject=BusinessEnglish" },
    { labelKey: "footer.onlineSpanishClasses", href: "/search?subject=Spanish" },
    { labelKey: "footer.onlineFrenchClasses", href: "/search?subject=French" },
    { labelKey: "footer.onlineGermanClasses", href: "/search?subject=German" },
    { labelKey: "footer.onlineChineseClasses", href: "/search?subject=Chinese" },
    { labelKey: "footer.onlineGeorgianClasses", href: "/search?subject=Georgian" },
    { labelKey: "footer.onlineTurkishClasses", href: "/search?subject=Turkish" },
    { labelKey: "footer.onlinePortugueseClasses", href: "/search?subject=Portuguese" },
  ];

  const tutorTypeLinks = [
    { labelKey: "footer.englishTutors", href: "/search?subject=English" },
    { labelKey: "footer.spanishTutors", href: "/search?subject=Spanish" },
    { labelKey: "footer.frenchTutors", href: "/search?subject=French" },
    { labelKey: "footer.germanTutors", href: "/search?subject=German" },
    { labelKey: "footer.arabicTutors", href: "/search?subject=Arabic" },
    { labelKey: "footer.georgianTutors", href: "/search?subject=Georgian" },
    { labelKey: "footer.chineseTutors", href: "/search?subject=Chinese" },
    { labelKey: "footer.portugueseTutors", href: "/search?subject=Portuguese" },
    { labelKey: "footer.mathTutors", href: "/search?subject=Mathematics" },
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
    <footer className="border-t border-border/50 bg-secondary/30">
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {renderLinkColumn("footer.aboutUs", aboutLinks)}
          {renderLinkColumn("footer.forStudents", studentLinks)}
          {renderLinkColumn("footer.forTutors", tutorLinks)}
          {renderLinkColumn("footer.subjects", subjectLinks)}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mt-10 pt-8 border-t border-border/50">
          {renderLinkColumn("footer.learn", learnLinks)}
          {renderLinkColumn("footer.onlineClasses", onlineClassLinks)}
          {renderLinkColumn("footer.oneOnOneTutors", tutorTypeLinks)}
        </div>
      </div>

      {/* Support, Contacts, Social, Apps */}
      <div className="border-t border-border/50">
        <div className="container py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold text-sm text-foreground mb-3 uppercase tracking-wide">{t("footer.support")}</h4>
              <Link to="/faq" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {t("footer.needHelp")}
              </Link>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-foreground mb-3 uppercase tracking-wide">{t("footer.contacts")}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{t("footer.location")}</p>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-foreground mb-3 uppercase tracking-wide">{t("footer.social")}</h4>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <social.icon className="h-4 w-4" />
                  </a>
                ))}
                <a
                  href="https://tiktok.com/@learneazy"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors text-xs font-bold"
                >
                  TT
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-foreground mb-3 uppercase tracking-wide">{t("footer.apps")}</h4>
              <div className="flex flex-col gap-2">
                <a
                  href="#"
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary text-foreground px-3 py-2 text-xs font-medium hover:bg-primary hover:text-primary-foreground transition-colors w-fit"
                >
                  <span className="text-base">🍎</span>
                  App Store
                </a>
                <a
                  href="#"
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary text-foreground px-3 py-2 text-xs font-medium hover:bg-primary hover:text-primary-foreground transition-colors w-fit"
                >
                  <span className="text-base">▶️</span>
                  Google Play
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-border/50">
        <div className="container py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="LearnEazy" className="h-8 w-auto" loading="lazy" decoding="async" />
            <span className="text-sm text-muted-foreground">© {new Date().getFullYear()} LearnEazy</span>
          </div>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link to="/faq" className="hover:text-primary transition-colors">{t("footer.faq")}</Link>
          </div>
        </div>
      </div>

      {/* Legal Center */}
      <div className="border-t border-border/50 bg-secondary/50">
        <div className="container py-4 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Legal Center</span>
          <Link to="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link>
          <Link to="/cookie-policy" className="hover:text-primary transition-colors">Cookie Policy</Link>
          <Link to="/terms-of-service" className="hover:text-primary transition-colors">Legal Notice</Link>
        </div>
      </div>
    </footer>
  );
}
