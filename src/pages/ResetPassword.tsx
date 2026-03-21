import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Lock, Loader2 } from "lucide-react";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { supabase } from "@/integrations/supabase/client";

type PageState = "loading" | "ready" | "expired" | "success";

export default function ResetPassword() {
  const [pageState, setPageState] = useState<PageState>("loading");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Supabase recovery links set a session automatically via the hash fragment.
    // We listen for the SIGNED_IN or PASSWORD_RECOVERY event to know the user is ready.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setPageState("ready");
      }
    });

    // Also check if there's already a session (e.g. page was refreshed after recovery link)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setPageState("ready");
      } else {
        // Give a short delay for the hash to be processed
        setTimeout(() => {
          setPageState((prev) => (prev === "loading" ? "expired" : prev));
        }, 3000);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to set password.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      setPageState("success");
      // Fetch roles to redirect correctly
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      let redirectTo = "/dashboard";
      if (userId) {
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId);
        if (roles?.some((r) => r.role === "admin")) redirectTo = "/admin";
        else if (roles?.some((r) => r.role === "tutor")) redirectTo = "/tutor-dashboard";
      }
      setTimeout(() => navigate(redirectTo, { replace: true }), 2000);
    } catch {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md border-border shadow-lg">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Set Up Your Password</CardTitle>
            <CardDescription>
              Create a secure password to access your LearnEazy account
            </CardDescription>
          </CardHeader>

          {pageState === "loading" && (
            <CardContent className="flex flex-col items-center gap-3 py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Verifying your link…</p>
            </CardContent>
          )}

          {pageState === "expired" && (
            <CardContent className="text-center space-y-4 py-8">
              <p className="text-sm text-muted-foreground">
                This link has expired or is no longer valid. Please contact info@learneazy.org for a new one.
              </p>
            </CardContent>
          )}

          {pageState === "success" && (
            <CardContent className="text-center space-y-3 py-8">
              <p className="text-lg font-semibold text-green-600">✅ Password set successfully!</p>
              <p className="text-sm text-muted-foreground">Redirecting you to your dashboard…</p>
            </CardContent>
          )}

          {pageState === "ready" && (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <PasswordInput
                    id="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setPasswordError("");
                    }}
                    required
                    toggleLabel="Toggle password visibility"
                  />
                  <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <PasswordInput
                    id="confirmPassword"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setPasswordError("");
                    }}
                    required
                    toggleLabel="Toggle confirm password visibility"
                  />
                </div>

                {passwordError && (
                  <p className="text-sm text-destructive">{passwordError}</p>
                )}
              </CardContent>

              <CardFooter>
                <Button
                  type="submit"
                  className="w-full hero-gradient text-primary-foreground border-0"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Setting up your account…
                    </span>
                  ) : (
                    "Set Password & Continue"
                  )}
                </Button>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </Layout>
  );
}
