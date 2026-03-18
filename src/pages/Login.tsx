import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Clock, GraduationCap, LogIn, Lock, Mail, Presentation } from "lucide-react";

import { PasswordInput } from "@/components/auth/PasswordInput";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type LoginPortal = "student" | "tutor";

const portalOptions: {
  key: LoginPortal;
  title: string;
  description: string;
  icon: typeof GraduationCap;
  signupHref: string;
  signupLabel: string;
}[] = [
  {
    key: "student",
    title: "Student portal",
    description: "Log in to manage lessons, messages, and your learning dashboard.",
    icon: GraduationCap,
    signupHref: "/signup/student",
    signupLabel: "Create student account",
  },
  {
    key: "tutor",
    title: "Tutor portal",
    description: "Log in to access your tutor dashboard, schedule, and student inbox.",
    icon: Presentation,
    signupHref: "/become-tutor",
    signupLabel: "Apply as tutor",
  },
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const redirect = searchParams.get("redirect");
  const portalParam = searchParams.get("portal");
  const activePortal: LoginPortal = portalParam === "tutor" ? "tutor" : "student";
  const activePortalConfig = useMemo(
    () => portalOptions.find((option) => option.key === activePortal) ?? portalOptions[0],
    [activePortal],
  );
  const { toast } = useToast();
  const { t } = useLanguage();
  const { user, loading: authLoading, defaultRoute } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      navigate(redirect || defaultRoute, { replace: true });
    }
  }, [authLoading, defaultRoute, navigate, redirect, user]);

  const handlePortalChange = (portal: LoginPortal) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("portal", portal);
    setSearchParams(nextParams, { replace: true });
  };

  const [pendingApplication, setPendingApplication] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data: signInData, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      toast({ title: t("auth.error"), description: error.message, variant: "destructive" });
      return;
    }

    // Check if tutor with pending application (no tutor role yet)
    if (signInData?.user) {
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", signInData.user.id);

      const userRoles = (roles ?? []).map((r) => r.role);
      const isTutorOrAdmin = userRoles.includes("tutor") || userRoles.includes("admin");

      if (!isTutorOrAdmin) {
        // Check if they have a pending tutor application
        const { data: apps } = await supabase
          .from("tutor_applications")
          .select("status")
          .eq("email", email.toLowerCase())
          .eq("status", "pending")
          .limit(1);

        if (apps && apps.length > 0) {
          setPendingApplication(true);
          await supabase.auth.signOut();
          return;
        }
      }
    }

    toast({ title: t("auth.welcomeBack") });
    navigate(redirect || defaultRoute, { replace: true });
  };

  const ActiveIcon = activePortalConfig.icon;

  return (
    <Layout>
      <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md border-border shadow-lg">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto inline-flex rounded-full border border-border bg-muted p-1">
              {portalOptions.map((option) => {
                const Icon = option.icon;
                const isActive = option.key === activePortal;

                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => handlePortalChange(option.key)}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-background hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {option.key === "student" ? "Student" : "Tutor"}
                  </button>
                );
              })}
            </div>

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <ActiveIcon className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl">{activePortalConfig.title}</CardTitle>
              <CardDescription>{activePortalConfig.description}</CardDescription>
            </div>
          </CardHeader>

          {pendingApplication ? (
            <div className="p-6 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-warning/10">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <h3 className="text-lg font-semibold">Application Under Review</h3>
              <p className="text-sm text-muted-foreground">
                Your tutor application is currently being reviewed. We will email you within 2–3 business days with our decision.
              </p>
              <Button variant="outline" className="mt-2" onClick={() => setPendingApplication(false)}>
                Back to login
              </Button>
            </div>
          ) : (
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("auth.email")}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">{t("auth.password")}</Label>
                  <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                    {t("auth.forgotPassword")}
                  </Link>
                </div>
                <PasswordInput
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  toggleLabel={t("auth.togglePassword")}
                  icon={<Lock className="h-4 w-4" />}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={loading || authLoading}>
                {loading ? t("auth.signingIn") : `Log in to ${activePortalConfig.key === "student" ? "student" : "tutor"} portal`}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                {t("auth.noAccount")}{" "}
                <Link to={activePortalConfig.signupHref} className="font-medium text-primary hover:underline">
                  {activePortalConfig.signupLabel}
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </Layout>
  );
}
