import { Layout } from "@/components/Layout";
import { useLanguage } from "@/contexts/LanguageContext";

export default function TermsOfService() {
  const { t } = useLanguage();

  return (
    <Layout>
      <div className="container max-w-3xl py-16">
        <h1 className="text-3xl font-bold text-foreground mb-8">{t("terms.title")}</h1>
        <p className="text-sm text-muted-foreground mb-8">{t("terms.lastUpdated")}: 2026-03-15</p>

        <div className="prose prose-sm max-w-none space-y-6 text-foreground/90">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">{t("terms.section1.title")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("terms.section1.body")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">{t("terms.section2.title")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("terms.section2.body")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">{t("terms.section3.title")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("terms.section3.body")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">{t("terms.section4.title")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("terms.section4.body")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">{t("terms.section5.title")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("terms.section5.body")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">{t("terms.section6.title")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("terms.section6.body")}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">{t("terms.section7.title")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("terms.section7.body")}</p>
          </section>
        </div>
      </div>
    </Layout>
  );
}
