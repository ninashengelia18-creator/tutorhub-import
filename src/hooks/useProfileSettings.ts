import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useAppLocale } from "@/contexts/AppLocaleContext";
import { supabase } from "@/integrations/supabase/client";
import { sanitizeFileName } from "@/components/messages/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import type { StudentSettingsSection } from "@/components/profile/StudentSettingsSidebar";

export function useProfileSettings(redirectPath: string) {
  const { user, refreshProfile, updateProfileState, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, lang } = useLanguage();
  const { currency, timezone, setLocalePreferences } = useAppLocale();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
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
  const [selectedTimezone, setSelectedTimezone] = useState(timezone);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setInitialLoading(false);
      return;
    }

    const [{ data: profileData }, { data: preferenceData }] = await Promise.all([
      supabase.from("profiles").select("display_name, avatar_url").eq("id", user.id).single(),
      supabase.from("notification_preferences").select("email_transactional, email_tips_discount, email_surveys").eq("user_id", user.id).maybeSingle(),
    ]);

    setEmail(user.email || "");

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
      navigate(redirectPath, { replace: true });
      return;
    }

    void fetchProfile();
  }, [fetchProfile, navigate, redirectPath, user]);

  useEffect(() => {
    setEmail(user?.email || "");
  }, [user?.email]);

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

  const handleSaveEmail = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      toast({ title: t("profile.settings.error"), description: t("auth.email"), variant: "destructive" });
      return;
    }

    if (cleanEmail === (user.email || "")) {
      toast({ title: t("profile.settings.saved") });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ email: cleanEmail });
    setLoading(false);

    if (error) {
      toast({ title: t("profile.settings.error"), description: error.message, variant: "destructive" });
      return;
    }

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

  return {
    user,
    fileInputRef,
    displayName,
    setDisplayName,
    email,
    setEmail,
    avatarUrl,
    loading,
    uploading,
    initialLoading,
    activeSection,
    currentPassword,
    newPassword,
    confirmPassword,
    deleteEmail,
    deleteDialogOpen,
    notificationPreferences,
    initials,
    firstName,
    lastName,
    setActiveSection,
    setCurrentPassword,
    setNewPassword,
    setConfirmPassword,
    setDeleteEmail,
    setDeleteDialogOpen,
    setNotificationPreferences,
    handleAvatarUpload,
    handleSaveAccount,
    handleSaveEmail,
    handleSavePassword,
    handleSaveNotifications,
    handleDeleteAccount,
  };
}

