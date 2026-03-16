import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { StudentSettingsPanels } from "@/components/profile/StudentSettingsPanels";
import { StudentSettingsSection, StudentSettingsSidebar } from "@/components/profile/StudentSettingsSidebar";
import { Layout } from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { sanitizeFileName } from "@/components/messages/utils";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ProfileSettings() {
  const { user, refreshProfile, updateProfileState, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<StudentSettingsSection>("account");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deleteEmail, setDeleteEmail] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [notificationPreferences, setNotificationPreferences] = useState({ email_transactional: true, email_tips_discount: false, email_surveys: false });

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setInitialLoading(false);
      return;
    }

    const [{ data: profileData }, { data: preferenceData }] = await Promise.all([
      supabase.from("profiles").select("display_name, avatar_url").eq("id", user.id).single(),
      supabase.from("notification_preferences").select("email_transactional, email_tips_discount, email_surveys").eq("user_id", user.id).maybeSingle(),
    ]);

    if (profileData) {
      setDisplayName(profileData.display_name || "");
      setAvatarUrl(profileData.avatar_url);
    }

    if (preferenceData) {
      setNotificationPreferences(preferenceData);
    }

    setInitialLoading(false);
  }, [user]);

  useEffect(() => {
    if (!user) {
      navigate("/login?redirect=/profile", { replace: true });
      return;
    }

    void fetchProfile();
  }, [fetchProfile, navigate, user]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: t("profile.settings.error"), description: t("profile.settings.imageOnly"), variant: "destructive" });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({ title: t("profile.settings.error"), description: t("profile.settings.fileTooLarge"), variant: "destructive" });
      return;
    }

    setUploading(true);
    const filePath = `${user.id}/${Date.now()}-${sanitizeFileName(file.name)}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });

    if (uploadError) {
      setUploading(false);
      toast({ title: t("profile.settings.error"), description: uploadError.message, variant: "destructive" });
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const url = `${data.publicUrl}?t=${Date.now()}`;
    const { error } = await supabase.from("profiles").update({ avatar_url: url, updated_at: new Date().toISOString() }).eq("id", user.id);
    setUploading(false);

    if (error) {
      toast({ title: t("profile.settings.error"), description: error.message, variant: "destructive" });
      return;
    }

    setAvatarUrl(url);
    updateProfileState({ avatar_url: url });
    await refreshProfile();
    toast({ title: t("profile.settings.avatarUpdated") });
  };

  const handleSaveAccount = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;

    setLoading(true);
    const cleanName = displayName.trim();
    const { error } = await supabase.from("profiles").update({ display_name: cleanName, updated_at: new Date().toISOString() }).eq("id", user.id);
    setLoading(false);

    if (error) {
      toast({ title: t("profile.settings.error"), description: error.message, variant: "destructive" });
      return;
    }

    updateProfileState({ display_name: cleanName });
    await refreshProfile();
    toast({ title: t("profile.settings.saved") });
  };

  const handleSavePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;

    if (newPassword.length < 6) {
      toast({ title: t("auth.error"), description: t("auth.passwordMin"), variant: "destructive" });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({ title: t("auth.error"), description: t("profile.settings.passwordMismatch"), variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: user.email || "", password: currentPassword });
    if (signInError) {
      setLoading(false);
      toast({ title: t("auth.error"), description: t("profile.settings.invalidCurrentPassword"), variant: "destructive" });
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);

    if (error) {
      toast({ title: t("auth.error"), description: error.message, variant: "destructive" });
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    toast({ title: t("profile.settings.passwordSaved") });
  };

  const handleSaveNotifications = async () => {
    if (!user) return;

    setLoading(true);
    const { data: existing } = await supabase.from("notification_preferences").select("user_id").eq("user_id", user.id).maybeSingle();
    const payload = { ...notificationPreferences, updated_at: new Date().toISOString() };
    const result = existing
      ? await supabase.from("notification_preferences").update(payload).eq("user_id", user.id)
      : await supabase.from("notification_preferences").insert({ user_id: user.id, ...notificationPreferences });
    setLoading(false);

    if (result.error) {
      toast({ title: t("profile.settings.error"), description: result.error.message, variant: "destructive" });
      return;
    }

    toast({ title: t("profile.settings.notificationsSaved") });
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    setLoading(true);
    const { error } = await supabase.functions.invoke("delete-account", { body: { email: deleteEmail } });
    if (error) {
      setLoading(false);
      toast({ title: t("profile.settings.error"), description: error.message || t("profile.settings.deleteFailed"), variant: "destructive" });
      return;
    }

    await signOut();
    setLoading(false);
    toast({ title: t("profile.settings.accountDeleted") });
    navigate("/", { replace: true });
  };

  const initials = useMemo(() => {
    if (!displayName.trim()) return user?.email?.[0]?.toUpperCase() || "?";
    return displayName.split(" ").filter(Boolean).map((part) => part[0]).join("").toUpperCase().slice(0, 2);
  }, [displayName, user?.email]);

  const firstName = displayName.split(" ")[0] || "";
  const lastName = displayName.split(" ").slice(1).join(" ");

  if (initialLoading) {
    return <Layout hideFooter><div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div></Layout>;
  }

  return (
    <Layout hideFooter>
      <div className="container py-10 md:py-14">
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-16 xl:gap-24">
          <StudentSettingsSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
          <StudentSettingsPanels
            activeSection={activeSection}
            email={user?.email || ""}
            avatarUrl={avatarUrl}
            initials={initials}
            firstName={firstName}
            lastName={lastName}
            loading={loading}
            uploading={uploading}
            fileInputRef={fileInputRef}
            currentPassword={currentPassword}
            newPassword={newPassword}
            confirmPassword={confirmPassword}
            deleteEmail={deleteEmail}
            deleteDialogOpen={deleteDialogOpen}
            notificationPreferences={notificationPreferences}
            onAvatarUpload={handleAvatarUpload}
            onFirstNameChange={(value) => setDisplayName(`${value} ${lastName}`.trim())}
            onLastNameChange={(value) => setDisplayName(`${firstName} ${value}`.trim())}
            onCurrentPasswordChange={setCurrentPassword}
            onNewPasswordChange={setNewPassword}
            onConfirmPasswordChange={setConfirmPassword}
            onDeleteEmailChange={setDeleteEmail}
            onSaveAccount={handleSaveAccount}
            onSavePassword={handleSavePassword}
            onSaveNotifications={handleSaveNotifications}
            onToggleNotification={(key, value) => setNotificationPreferences((current) => ({ ...current, [key]: value }))}
            onDeleteAccount={handleDeleteAccount}
            onDeleteDialogOpenChange={setDeleteDialogOpen}
          />
        </div>
      </div>
    </Layout>
  );
}
