import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";

type PageState = "loading" | "ready" | "expired" | "success";

export default function ResetPassword() {
  const [pageState, setPageState] = useState<PageState>("loading");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Explicitly parse the hash from the URL and set the session
    const hash = window.location.hash;
    if (hash && hash.includes("access_token")) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      
      if (accessToken && refreshToken) {
        supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        }).then(({ data, error }) => {
          if (error) {
            console.error("Failed to set session:", error.message);
            setPageState("expired");
          } else if (data.session) {
            console.log("Session set successfully for:", data.session.user.email);
            setPageState("ready");
          }
        });
        return;
      }
    }

    // No hash — check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setPageState("ready");
      } else {
        setPageState("expired");
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth event:", event, session?.user?.email);
      if ((event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") && session) {
        setPageState("ready");
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

    const { data, error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    setPageState("success");

    if (data?.user) {
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id);

      const userRoles = (roles ?? []).map((r: { role: string }) => r.role);

      setTimeout(() => {
        if (userRoles.includes("admin")) {
          navigate("/admin", { replace: true });
        } else if (userRoles.includes("tutor")) {
          navigate("/tutor-dashboard", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      }, 2000);
    }

    setLoading(false);
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
                This link has expired or is no longer valid. Please request a new one.
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/forgot-password")}
              >
                Request New Link
              </Button>
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
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setPasswordError("");
                      }}
                      required
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setPasswordError("");
                      }}
                      required
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
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
