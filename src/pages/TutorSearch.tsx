import { Layout } from "@/components/Layout";
import { PortalHeader } from "@/components/PortalHeader";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { GraduationCap } from "lucide-react";

export default function TutorSearch() {
  const { user } = useAuth();

  const comingSoonContent = (
    <div className="container py-20 flex flex-col items-center justify-center text-center min-h-[60vh]">
      <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <GraduationCap className="h-10 w-10 text-primary" />
      </div>
      <Badge className="mb-4 text-sm px-4 py-1">Coming Soon</Badge>
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
        Find Your Perfect Tutor
      </h1>
      <p className="text-muted-foreground text-lg max-w-md">
        We're currently onboarding top tutors. Check back soon to browse and book lessons!
      </p>
    </div>
  );

  if (user) {
    return (
      <div className="flex min-h-screen flex-col">
        <PortalHeader />
        <main className="flex-1">{comingSoonContent}</main>
        <Footer />
      </div>
    );
  }

  return <Layout>{comingSoonContent}</Layout>;
}
