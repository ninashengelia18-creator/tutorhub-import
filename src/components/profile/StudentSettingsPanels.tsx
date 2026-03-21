import { useState, useMemo, type RefObject } from "react";
import { Bell, Camera, ChevronDown, ChevronUp, Info, Loader2, Mail, Trash2 } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { Lock } from "lucide-react";

import type { StudentSettingsSection } from "@/components/profile/StudentSettingsSidebar";
import { TIMEZONE_OPTIONS } from "@/contexts/AppLocaleContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTimeZoneSettingLabel } from "@/lib/datetime";

interface StudentSettingsPanelsProps {
  activeSection: StudentSettingsSection;
  email: string;
  avatarUrl: string | null;
  initials: string;
  firstName: string;
  lastName: string;
  timezone: string;
  loading: boolean;
  uploading: boolean;
  fileInputRef: RefObject<HTMLInputElement>;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  deleteEmail: string;
  deleteDialogOpen: boolean;
  notificationPreferences: {
    email_transactional: boolean;
    email_tips_discount: boolean;
    email_surveys: boolean;
  };
  meetLink?: string;
  showMeetLink?: boolean;
  onMeetLinkChange?: (value: string) => void;
  onAvatarUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onTimezoneChange: (value: string) => void;
  onCurrentPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onDeleteEmailChange: (value: string) => void;
  onSaveAccount: (event: React.FormEvent) => Promise<void>;
  onSaveEmail: (event: React.FormEvent) => Promise<void>;
  onSavePassword: (event: React.FormEvent) => Promise<void>;
  onSaveNotifications: () => Promise<void>;
  onToggleNotification: (key: "email_transactional" | "email_tips_discount" | "email_surveys", value: boolean) => void;
  onDeleteAccount: () => Promise<void>;
  onDeleteDialogOpenChange: (open: boolean) => void;
}

function SectionShell({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="w-full max-w-3xl space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">{title}</h1>
        {description ? <p className="max-w-2xl text-lg text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function StudentSettingsPanels(props: StudentSettingsPanelsProps) {
  const { t } = useLanguage();
  const [showEmailChange, setShowEmailChange] = useState(false);
  const [newEmail, setNewEmail] = useState("");

  const {
    activeSection,
    email,
    avatarUrl,
    initials,
    firstName,
    lastName,
    timezone,
    loading,
    uploading,
    fileInputRef,
    currentPassword,
    newPassword,
    confirmPassword,
    deleteEmail,
    deleteDialogOpen,
    notificationPreferences,
    onAvatarUpload,
    onFirstNameChange,
    onLastNameChange,
    onEmailChange,
    onTimezoneChange,
    onCurrentPasswordChange,
    onNewPasswordChange,
    onConfirmPasswordChange,
    onDeleteEmailChange,
    onSaveAccount,
    onSaveEmail,
    onSavePassword,
    onSaveNotifications,
    onToggleNotification,
    onDeleteAccount,
    onDeleteDialogOpenChange,
  } = props;

  const timezoneOptions = useMemo(() => {
    if (TIMEZONE_OPTIONS.some((option) => option.value === timezone)) {
      return TIMEZONE_OPTIONS;
    }
    return [{ value: timezone, label: getTimeZoneSettingLabel(timezone) }, ...TIMEZONE_OPTIONS];
  }, [timezone]);

  if (activeSection === "password") {
    return (
      <SectionShell title={t("profile.settings.passwordTitle")} description={t("profile.settings.passwordDesc")}>
        <form className="space-y-6" onSubmit={(event) => void onSavePassword(event)}>
          <div className="space-y-3">
            <Label htmlFor="currentPassword">{t("profile.settings.currentPassword")}</Label>
            <PasswordInput id="currentPassword" value={currentPassword} onChange={(e) => onCurrentPasswordChange(e.target.value)} toggleLabel={t("auth.togglePassword")} icon={<Lock className="h-4 w-4" />} />
          </div>
          <div className="space-y-3">
            <Label htmlFor="newPassword">{t("profile.settings.newPassword")}</Label>
            <PasswordInput id="newPassword" value={newPassword} onChange={(e) => onNewPasswordChange(e.target.value)} toggleLabel={t("auth.togglePassword")} icon={<Lock className="h-4 w-4" />} />
          </div>
          <div className="space-y-3">
            <Label htmlFor="confirmPassword">{t("profile.settings.confirmPassword")}</Label>
            <PasswordInput id="confirmPassword" value={confirmPassword} onChange={(e) => onConfirmPasswordChange(e.target.value)} toggleLabel={t("auth.togglePassword")} icon={<Lock className="h-4 w-4" />} />
          </div>
          <Button type="submit" className="h-16 w-full rounded-2xl text-lg font-semibold" disabled={loading}>{loading ? t("profile.settings.saving") : t("profile.settings.save")}</Button>
        </form>
      </SectionShell>
    );
  }

  if (activeSection === "notifications") {
    return (
      <SectionShell title={t("profile.settings.notificationsTitle")} description={t("profile.settings.notificationsDesc")}>
        <div className="rounded-[2rem] border border-border bg-card p-8">
          <div className="mb-8 flex items-center gap-3 text-foreground"><Mail className="h-7 w-7" /><h2 className="text-3xl font-semibold">{t("profile.settings.emailNotifications")}</h2></div>
          {([
            ["email_transactional", t("profile.settings.transactionalTitle"), t("profile.settings.transactionalDesc")],
            ["email_tips_discount", t("profile.settings.tipsTitle"), t("profile.settings.tipsDesc")],
            ["email_surveys", t("profile.settings.surveysTitle"), t("profile.settings.surveysDesc")],
          ] as const).map(([key, title, description]) => (
            <div key={key} className="flex items-start justify-between gap-6 border-b border-border/70 py-6 last:border-b-0 last:pb-0">
              <div className="space-y-2"><h3 className="text-2xl font-semibold text-foreground">{title}</h3><p className="max-w-xl text-base text-muted-foreground">{description}</p></div>
              <Switch checked={notificationPreferences[key]} onCheckedChange={(value) => onToggleNotification(key, value)} />
            </div>
          ))}
          <Button type="button" onClick={() => void onSaveNotifications()} className="mt-8 h-16 w-full rounded-2xl text-lg font-semibold" disabled={loading}>{loading ? t("profile.settings.saving") : t("profile.settings.save")}</Button>
        </div>
      </SectionShell>
    );
  }

  if (activeSection === "delete") {
    return (
      <SectionShell title={t("profile.settings.deleteTitle")} description={t("profile.settings.deleteDesc")}>
        <div className="space-y-6 rounded-[2rem] border border-border bg-card p-8">
          <Alert>
            <Bell className="h-4 w-4" />
            <AlertTitle>{t("profile.settings.deleteConfirmTitle")}</AlertTitle>
            <AlertDescription>{t("profile.settings.deleteWarning")}</AlertDescription>
          </Alert>
          <div className="space-y-3">
            <Label htmlFor="deleteConfirmEmail">{t("profile.settings.confirmEmail")}</Label>
            <Input id="deleteConfirmEmail" value={deleteEmail} onChange={(e) => onDeleteEmailChange(e.target.value)} placeholder={t("profile.settings.confirmEmailPlaceholder")} className="h-16 rounded-2xl border-border bg-background px-6 text-lg" />
          </div>
          <Button type="button" variant="outline" onClick={() => onDeleteDialogOpenChange(true)} className="h-16 w-full rounded-2xl text-lg font-semibold">
            <Trash2 className="mr-2 h-5 w-5" />{t("profile.settings.deleteButton")}
          </Button>
          <AlertDialog open={deleteDialogOpen} onOpenChange={onDeleteDialogOpenChange}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("profile.settings.deleteConfirmTitle")}</AlertDialogTitle>
                <AlertDialogDescription>{t("profile.settings.deleteConfirmDesc")}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("msg.cancel")}</AlertDialogCancel>
                <AlertDialogAction onClick={() => void onDeleteAccount()}>{t("profile.settings.deleteButton")}</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </SectionShell>
    );
  }

  // Account section (default)
  return (
    <SectionShell title={t("profile.settings.accountTitle")} description="Manage your profile, login email, and preferences.">
      {/* Profile Image & Name */}
      <div className="space-y-10 rounded-[2rem] border border-border bg-card p-6 md:p-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <div className="space-y-4">
            <p className="text-xl font-medium text-foreground">{t("profile.settings.profileImage")}</p>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-4">
                <button type="button" onClick={() => fileInputRef.current?.click()} className="group relative block">
                  <Avatar className="h-44 w-44 rounded-[2rem] border border-border">
                    <AvatarImage src={avatarUrl || undefined} alt={email} className="object-cover" />
                    <AvatarFallback className="rounded-[2rem] bg-muted text-5xl font-semibold text-foreground">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 flex items-center justify-center rounded-[2rem] bg-foreground/10 opacity-0 transition-opacity group-hover:opacity-100">
                    {uploading ? <Loader2 className="h-8 w-8 animate-spin text-foreground" /> : <Camera className="h-8 w-8 text-foreground" />}
                  </div>
                </button>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="text-lg font-semibold underline underline-offset-4 text-foreground">{t("profile.settings.edit")}</button>
              </div>
              <div className="space-y-4">
                <Button type="button" variant="outline" className="h-16 min-w-[230px] rounded-2xl px-8 text-lg font-semibold" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                  <Camera className="mr-2 h-5 w-5" />{t("profile.settings.uploadPhoto")}
                </Button>
                <div className="space-y-1 text-base text-muted-foreground"><p>{t("profile.settings.maxFileSize")}</p><p>{t("profile.settings.fileFormats")}</p></div>
              </div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => { void onAvatarUpload(event); }} disabled={uploading} />
          </div>
        </div>
        <form onSubmit={(event) => void onSaveAccount(event)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3"><Label htmlFor="firstName">{t("profile.settings.firstName")}</Label><Input id="firstName" value={firstName} onChange={(e) => onFirstNameChange(e.target.value)} className="h-16 rounded-2xl border-border bg-background px-6 text-lg" /></div>
            <div className="space-y-3"><Label htmlFor="lastName">{t("profile.settings.lastName")}</Label><Input id="lastName" value={lastName} onChange={(e) => onLastNameChange(e.target.value)} className="h-16 rounded-2xl border-border bg-background px-6 text-lg" /></div>
          </div>
          <div className="space-y-3">
            <Label htmlFor="accountTimezone">{t("profile.settings.timezone")}</Label>
            <Select value={timezone} onValueChange={onTimezoneChange}>
              <SelectTrigger id="accountTimezone" className="h-16 rounded-2xl border-border bg-background px-6 text-lg">
                <SelectValue placeholder={t("profile.settings.timezone")} />
              </SelectTrigger>
              <SelectContent>
                {timezoneOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {getTimeZoneSettingLabel(option.value)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">{getTimeZoneSettingLabel(timezone)}</p>
          </div>
          {props.showMeetLink && (
            <div className="space-y-3">
              <Label htmlFor="meetLink">Meeting Link</Label>
              <Input id="meetLink" type="url" value={props.meetLink || ""} onChange={(e) => props.onMeetLinkChange?.(e.target.value)} placeholder="https://meet.google.com/... or Zoom/Teams link" className="h-16 rounded-2xl border-border bg-background px-6 text-lg" />
              <p className="text-sm text-muted-foreground">Paste your Google Meet, Zoom, or Teams link. Students will see a "Join Session" button.</p>
            </div>
          )}
          <Button type="submit" className="h-16 w-full rounded-2xl text-lg font-semibold" disabled={loading || uploading}>{loading ? t("profile.settings.saving") : t("profile.settings.save")}</Button>
        </form>
      </div>

      {/* Login Email — clear info card */}
      <div className="rounded-[2rem] border border-border bg-card p-6 md:p-10">
        <div className="flex items-center gap-3 mb-6">
          <Mail className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Login Email</h2>
        </div>

        <div className="rounded-xl bg-muted/50 border border-border p-5 mb-6">
          <p className="text-sm font-medium text-muted-foreground mb-1">Current email</p>
          <p className="text-lg font-semibold text-foreground break-all">{email}</p>
          <p className="text-sm text-muted-foreground mt-2">This is the email you use to sign in and receive notifications from LearnEazy.</p>
        </div>

        <button
          type="button"
          onClick={() => setShowEmailChange(!showEmailChange)}
          className="flex items-center gap-2 text-base font-medium text-primary hover:underline"
        >
          {showEmailChange ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          {showEmailChange ? "Cancel email change" : "Change my email address"}
        </button>

        {showEmailChange && (
          <form
            className="mt-6 space-y-4"
            onSubmit={(event) => {
              // Update the email state and trigger save
              onEmailChange(newEmail);
              void onSaveEmail(event);
            }}
          >
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex gap-3">
              <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">
                After you submit, we'll send a confirmation link to your <strong>new email address</strong>. 
                You'll need to click that link to complete the change. Your current email will remain active until then.
              </p>
            </div>
            <div className="space-y-3">
              <Label htmlFor="newEmail">New email address</Label>
              <Input
                id="newEmail"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="your-new-email@example.com"
                required
                className="h-16 rounded-2xl border-border bg-background px-6 text-lg"
              />
            </div>
            <Button type="submit" className="h-14 w-full rounded-2xl text-lg font-semibold" disabled={loading || !newEmail.trim()}>
              {loading ? t("profile.settings.saving") : "Send confirmation email"}
            </Button>
          </form>
        )}
      </div>
    </SectionShell>
  );
}
