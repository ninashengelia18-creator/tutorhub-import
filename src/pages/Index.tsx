import { Layout } from "@/components/Layout";
import { HeroSection } from "@/components/home/HeroSection";

import { SubjectCards } from "@/components/home/SubjectCards";
import { ProgressSection } from "@/components/home/ProgressSection";
import { HowItWorks } from "@/components/home/HowItWorks";
import { GuaranteeSection } from "@/components/home/GuaranteeSection";
import { BecomeTutorSection } from "@/components/home/BecomeTutorSection";

import { BottomCta } from "@/components/home/BottomCta";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      
      <SubjectCards />
      <ProgressSection />
      <HowItWorks />
      <GuaranteeSection />
      <BecomeTutorSection />
      
      <BottomCta />
    </Layout>
  );
};

export default Index;
