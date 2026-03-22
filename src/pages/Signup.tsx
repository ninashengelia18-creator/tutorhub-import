import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { GraduationCap, BookOpen, MessageCircle } from "lucide-react";

export default function Signup() {
  const { t } = useLanguage();

  return (
    <Layout>
      <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-3xl"
        >
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold mb-2">{t("signup.chooseRole")}</h1>
            <p className="text-muted-foreground">{t("signup.chooseRoleDesc")}</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 items-stretch">
            {/* Student Card */}
            <Link to="/signup/student" className="group flex">
              <div className="flex flex-col rounded-2xl border-2 border-border bg-card p-8 text-center transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/10 group-hover:scale-[1.02] w-full">
                <div className="mx-auto mb-5 h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-bold mb-2">{t("signup.iAmStudent")}</h2>
                <p className="text-sm text-muted-foreground mb-6 flex-1">{t("signup.studentDesc")}</p>
                <Button className="w-full hero-gradient text-primary-foreground border-0">
                  {t("signup.signupAsStudent")}
                </Button>
              </div>
            </Link>

            {/* Tutor Card */}
            <Link to="/become-tutor" className="group flex">
              <div className="flex flex-col rounded-2xl border-2 border-border bg-card p-8 text-center transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/10 group-hover:scale-[1.02] w-full">
                <div className="mx-auto mb-5 h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <GraduationCap className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-bold mb-2">{t("signup.iAmTutor")}</h2>
                <p className="text-sm text-muted-foreground mb-6 flex-1">{t("signup.tutorDesc")}</p>
                <Button variant="outline" className="w-full">
                  {t("signup.applyAsTutor")}
                </Button>
              </div>
            </Link>

            {/* Buddy Card */}
            <Link to="/become-language-buddy" className="group flex">
              <div className="flex flex-col rounded-2xl border-2 border-border bg-card p-8 text-center transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/10 group-hover:scale-[1.02] w-full">
                <div className="mx-auto mb-5 h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <MessageCircle className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-bold mb-2">I am a Buddy</h2>
                <p className="text-sm text-muted-foreground mb-6 flex-1">Earn money having conversations in your native language</p>
                <Button variant="outline" className="w-full">
                  Apply as a Buddy
                </Button>
              </div>
            </Link>
          </div>

          <p className="text-sm text-muted-foreground text-center mt-8">
            {t("auth.hasAccount")}{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              {t("auth.loginLink")}
            </Link>
          </p>
        </motion.div>
      </div>
    </Layout>
  );
}
