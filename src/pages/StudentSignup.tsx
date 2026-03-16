import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { UserPlus, Mail, Lock, User } from "lucide-react";
import { PasswordInput } from "@/components/auth/PasswordInput";

export default function StudentSignup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: t("auth.error"), description: t("auth.passwordMin"), variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin, data: { display_name: displayName } },
    });
    setLoading(false);
    if (error) {
      toast({ title: t("auth.error"), description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: t("auth.checkEmail"), description: t("auth.verifyEmail") });
  };

  return (
    <Layout>
      <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md border-border shadow-lg">
          <CardHeader className="space-y-2 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10"><UserPlus className="h-6 w-6 text-primary" /></div>
            <CardTitle className="text-2xl">{t("signup.studentTitle")}</CardTitle>
            <CardDescription>{t("signup.studentSubtitle")}</CardDescription>
          </CardHeader>
          <form onSubmit={handleSignup}>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label htmlFor="name">{t("auth.displayName")}</Label><div className="relative"><User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input id="name" type="text" placeholder={t("auth.displayNamePlaceholder")} value={displayName} onChange={(e) => setDisplayName(e.target.value)} required className="pl-9" /></div></div>
              <div className="space-y-2"><Label htmlFor="email">{t("auth.email")}</Label><div className="relative"><Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-9" /></div></div>
              <div className="space-y-2"><Label htmlFor="password">{t("auth.password")}</Label><PasswordInput id="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} toggleLabel={t("auth.togglePassword")} icon={<Lock className="h-4 w-4" />} /><p className="text-xs text-muted-foreground">{t("auth.passwordMin")}</p></div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={loading}>{loading ? t("auth.creatingAccount") : t("signup.createStudentAccount")}</Button>
              <p className="text-center text-sm text-muted-foreground">{t("auth.hasAccount")} <Link to="/login" className="font-medium text-primary hover:underline">{t("auth.loginLink")}</Link></p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </Layout>
  );
}
