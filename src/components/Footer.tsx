import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import logo from "@/assets/logo.jpg";

export function Footer() {
  const { t } = useLanguage();

  const aboutLinks = [
    { label: "Who we are", href: "/about" },
    { label: "How it works", href: "/how-it-works" },
    { label: "TutorHub reviews", href: "/reviews" },
    { label: "TutorHub app", href: "/app" },
    { label: "Proven progress platform", href: "/ai-practice" },
    { label: "Community guidelines", href: "/guidelines" },
    { label: "Work at TutorHub!", href: "/careers" },
    { label: "Status", href: "/status" },
    { label: "Research and Studies", href: "/research" },
    { label: "Media kit", href: "/media" },
    { label: "Affiliate program", href: "/affiliate" },
  ];

  const studentLinks = [
    { label: "TutorHub Blog", href: "/blog" },
    { label: "Questions and Answers", href: "/faq" },
    { label: "Student discount", href: "/student-discount" },
    { label: "Refer a friend", href: "/referral" },
    { label: "Test your English for free", href: "/english-test" },
    { label: "Test your vocab", href: "/vocab-test" },
    { label: "TutorHub discounts", href: "/discounts" },
    { label: "TutorHub Subscription", href: "/subscription" },
  ];

  const tutorLinks = [
    { label: "Become an online tutor", href: "/become-tutor" },
    { label: "Teach English online", href: "/become-tutor" },
    { label: "Teach French online", href: "/become-tutor" },
    { label: "Teach Spanish online", href: "/become-tutor" },
    { label: "Teach German online", href: "/become-tutor" },
    { label: "See all online tutoring jobs", href: "/become-tutor" },
  ];

  const companyLinks = [
    { label: "Corporate language training", href: "/for-business" },
    { label: "Corporate English training", href: "/for-business" },
    { label: "Corporate Spanish training", href: "/for-business" },
    { label: "Corporate training blog", href: "/blog" },
    { label: "Resource center", href: "/resources" },
    { label: "English level test for companies", href: "/business-test" },
    { label: "Language training for employee relocation", href: "/for-business" },
  ];

  const learnLinks = [
    { label: "Learn English online", href: "/search" },
    { label: "Learn Spanish online", href: "/search" },
    { label: "Learn French online", href: "/search" },
    { label: "Learn German online", href: "/search" },
    { label: "Learn Georgian online", href: "/search" },
    { label: "Learn Italian online", href: "/search" },
    { label: "Learn another language", href: "/search" },
  ];

  const classLinks = [
    { label: "Online English Classes", href: "/search" },
    { label: "Business English courses", href: "/search" },
    { label: "Online Spanish classes", href: "/search" },
    { label: "Online French classes", href: "/search" },
    { label: "Online German classes", href: "/search" },
    { label: "Online Chinese classes", href: "/search" },
    { label: "Online Georgian classes", href: "/search" },
    { label: "Online Turkish classes", href: "/search" },
    { label: "Online Portuguese classes", href: "/search" },
  ];

  const tutorTypeLinks = [
    { label: "English Tutors", href: "/search" },
    { label: "Spanish Tutors", href: "/search" },
    { label: "French Tutors", href: "/search" },
    { label: "German Tutors", href: "/search" },
    { label: "Arabic Tutors", href: "/search" },
    { label: "Japanese tutors", href: "/search" },
    { label: "Chinese tutors", href: "/search" },
    { label: "Portuguese tutors", href: "/search" },
    { label: "Math Tutors", href: "/search" },
  ];

  const nearYouLinks = [
    { label: "Tutors in NYC", href: "/search" },
    { label: "Tutors in Los Angeles", href: "/search" },
    { label: "Tutors in Toronto", href: "/search" },
    { label: "Tutors in London", href: "/search" },
    { label: "Tutors in Singapore", href: "/search" },
    { label: "Tutors abroad", href: "/search" },
    { label: "Tutors by city", href: "/search" },
  ];

  const renderLinkColumn = (title: string, links: { label: string; href: string }[]) => (
    <div>
      <h4 className="font-semibold text-sm text-foreground mb-3 uppercase tracking-wide">{title}</h4>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.label}>
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
  );

  return (
    <footer className="border-t bg-muted/30">
      {/* Top section: About / Students / Tutors / Companies */}
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {renderLinkColumn("ABOUT US", aboutLinks)}
          {renderLinkColumn("FOR STUDENTS", studentLinks)}
          {renderLinkColumn("FOR TUTORS", tutorLinks)}
          {renderLinkColumn("FOR COMPANIES", companyLinks)}
        </div>
      </div>

      {/* Support & Contact section */}
      <div className="border-t">
        <div className="container py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-sm text-foreground mb-3 uppercase tracking-wide">Support</h4>
              <p className="text-sm text-muted-foreground mb-2">
                <Link to="/faq" className="hover:text-primary transition-colors">Need any help?</Link>
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-foreground mb-3 uppercase tracking-wide">Contacts</h4>
              <p className="text-sm text-muted-foreground">
                Georgia, Tbilisi
              </p>
              <div className="flex gap-4 mt-3">
                <span className="text-sm font-medium text-foreground">TutorHub social</span>
              </div>
              <div className="flex gap-4 mt-2">
                {["Facebook", "Instagram", "Youtube", "LinkedIn", "TikTok"].map((s) => (
                  <a
                    key={s}
                    href="#"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {s}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom link sections: Learn / Classes / Tutors / Near you */}
      <div className="border-t">
        <div className="container py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {renderLinkColumn("LEARN", learnLinks)}
            {renderLinkColumn("ONLINE LANGUAGE CLASSES AND COURSES", classLinks)}
            {renderLinkColumn("1-ON-1 TUTORS", tutorTypeLinks)}
            {renderLinkColumn("TUTORS NEAR YOU", nearYouLinks)}
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t">
        <div className="container py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="TutorHub" className="h-8 w-auto" />
            <span className="text-sm text-muted-foreground">© 2012-{new Date().getFullYear()} TutorHub Inc.</span>
          </div>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link to="/legal" className="hover:text-primary transition-colors">Legal Center</Link>
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="/cookies" className="hover:text-primary transition-colors">Cookie Policy</Link>
            <Link to="/legal-notice" className="hover:text-primary transition-colors">Legal Notice</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
