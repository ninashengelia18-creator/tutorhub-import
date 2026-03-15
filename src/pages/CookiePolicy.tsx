import { Layout } from "@/components/Layout";
import { useLanguage } from "@/contexts/LanguageContext";

export default function CookiePolicy() {
  const { t } = useLanguage();

  const sections = [
    "cookie.section1",
    "cookie.section2",
    "cookie.section3",
    "cookie.section4",
    "cookie.section5",
    "cookie.section6",
    "cookie.section7",
  ];

  return (
    <Layout>
      <div className="container max-w-3xl py-16">
        <h1 className="text-3xl font-bold text-foreground mb-8">{t("cookie.title")}</h1>
        <p className="text-sm text-muted-foreground mb-8">{t("cookie.lastUpdated")}: 2026-03-15</p>

        <div className="prose prose-sm max-w-none space-y-6 text-foreground/90">
          {sections.map((key) => (
            <section key={key}>
              <h2 className="text-xl font-semibold text-foreground mb-3">{t(`${key}.title`)}</h2>
              <p className="text-muted-foreground leading-relaxed">{t(`${key}.body`)}</p>
            </section>
          ))}
        </div>
      </div>
    </Layout>
  );
}
