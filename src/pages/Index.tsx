import { Layout } from "@/components/Layout";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedTutors } from "@/components/home/FeaturedTutors";

import { SubjectCards } from "@/components/home/SubjectCards";
import { ProgressSection } from "@/components/home/ProgressSection";
import { HowItWorks } from "@/components/home/HowItWorks";
import { GuaranteeSection } from "@/components/home/GuaranteeSection";
import { BecomeTutorSection } from "@/components/home/BecomeTutorSection";
import { CorporateSection } from "@/components/home/CorporateSection";

import { BottomCta } from "@/components/home/BottomCta";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <FeaturedTutors />
      <StatsBar />
      <SubjectCards />
      <ProgressSection />
      <HowItWorks />
      <GuaranteeSection />
      <BecomeTutorSection />
      <CorporateSection />
      
      <BottomCta />
    </Layout>
  );
};

export default Index;
