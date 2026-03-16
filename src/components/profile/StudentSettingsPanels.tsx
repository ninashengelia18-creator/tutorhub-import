import type { RefObject } from "react";
import { Bell, CalendarDays, Camera, Loader2, Mail, Trash2 } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { StudentSettingsSection } from "@/components/profile/StudentSettingsSidebar";

interface StudentSettingsPanelsProps {
  activeSection: StudentSettingsSection;
  email: string;
  avatarUrl: string | null;
  initials: string;
  firstName: string;
  lastName: string;
  loading: boolean;
  uploading: boolean;
  fileInputRef: RefObject<HTMLInputElement>;
  onAvatarUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onSaveAccount: (event: React.FormEvent) => Promise<void>;
}

function SectionShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
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

function DisabledInput({ label, value }: { label: string; value?: string }) {
  return (
    <div className="space-y-3">
      <Label className="text-base font-medium text-foreground">{label}</Label>
      <Input value={value ?? ""} disabled className="h-16 rounded-2xl border-border bg-background px-6 text-lg" />
    </div>
  );
}

function StaticSaveButton({ label = "Save changes" }: { label?: string }) {
  return (
    <Button type="button" disabled className="h-16 w-full rounded-2xl text-lg font-semibold opacity-100">
      {label}
    </Button>
  );
}

function NotificationRow({
  title,
  description,
  active,
}: {
  title: string;
  description: string;
  active?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-6 border-b border-border/70 py-6 last:border-b-0 last:pb-0">
      <div className="space-y-2">
        <h3 className="text-2xl font-semibold text-foreground">{title}</h3>
        <p className="max-w-xl text-base text-muted-foreground">{description}</p>
      </div>
      <div
        className={`mt-1 flex h-10 w-20 shrink-0 items-center rounded-full border border-border px-1 ${
          active ? "justify-end bg-secondary" : "justify-start bg-muted"
        }`}
      >
        <span className="h-8 w-8 rounded-full bg-background shadow-sm" />
      </div>
    </div>
  );
}

export function StudentSettingsPanels({
  activeSection,
  email,
  avatarUrl,
  initials,
  firstName,
  lastName,
  loading,
  uploading,
  fileInputRef,
  onAvatarUpload,
  onFirstNameChange,
  onLastNameChange,
  onSaveAccount,
}: StudentSettingsPanelsProps) {
  if (activeSection === "password") {
    return (
      <SectionShell title="Create Password">
        <div className="space-y-6">
          <DisabledInput label="Current password" />
          <a className="inline-block text-lg font-semibold underline underline-offset-4 text-foreground" href="/forgot-password">
            Forgot your password?
          </a>
          <DisabledInput label="New password" />
          <DisabledInput label="Verify password" />
          <StaticSaveButton />
        </div>
      </SectionShell>
    );
  }

  if (activeSection === "email") {
    return (
      <SectionShell title="Email">
        <div className="space-y-6">
          <DisabledInput label="Email" value={email} />
          <StaticSaveButton />
        </div>
      </SectionShell>
    );
  }

  if (activeSection === "calendar") {
    return (
      <SectionShell title="Google Calendar">
        <div className="rounded-[2rem] border border-border bg-card p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-foreground">
              <CalendarDays className="h-8 w-8" />
            </div>
            <p className="max-w-xl text-xl text-foreground">
              Connect your Google Calendar and synchronize all your lessons with your personal schedule.
            </p>
          </div>
          <Button type="button" disabled variant="outline" className="mt-8 h-16 w-full rounded-2xl text-lg font-semibold opacity-100">
            Connect Google Calendar
          </Button>
        </div>
      </SectionShell>
    );
  }

  if (activeSection === "notifications") {
    return (
      <SectionShell title="Notification Preferences" description="Manage how and when you hear from us.">
        <div className="rounded-[2rem] border border-border bg-card p-8">
          <div className="mb-8 flex items-center gap-3 text-foreground">
            <Mail className="h-7 w-7" />
            <h2 className="text-3xl font-semibold">Email notifications</h2>
          </div>
          <NotificationRow
            title="Transactional"
            description="Important updates about your account and activity."
            active
          />
          <NotificationRow
            title="Tips and discounts"
            description="Get learning resources and exclusive offers to support your progress."
          />
          <NotificationRow
            title="Surveys and interviews"
            description="Take part in research studies to help us improve the student experience."
          />
          <Button type="button" className="mt-8 h-16 w-full rounded-2xl text-lg font-semibold">
            Save changes
          </Button>
        </div>
      </SectionShell>
    );
  }

  if (activeSection === "delete") {
    return (
      <SectionShell
        title="Delete account"
        description="Deleting your account is permanent and all your account information will be deleted along with it."
      >
        <div className="space-y-6 rounded-[2rem] border border-border bg-card p-8">
          <DisabledInput label="Email" value={email} />
          <Button type="button" disabled variant="outline" className="h-16 w-full rounded-2xl text-lg font-semibold opacity-100">
            <Trash2 className="mr-2 h-5 w-5" />
            Delete account
          </Button>
        </div>
      </SectionShell>
    );
  }

  return (
    <SectionShell title="Account Settings">
      <div className="space-y-10 rounded-[2rem] border border-border bg-card p-6 md:p-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <div className="space-y-4">
            <p className="text-xl font-medium text-foreground">Profile image</p>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative block"
                >
                  <Avatar className="h-44 w-44 rounded-[2rem] border border-border">
                    <AvatarImage src={avatarUrl || undefined} alt={email} className="object-cover" />
                    <AvatarFallback className="rounded-[2rem] bg-muted text-5xl font-semibold text-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 flex items-center justify-center rounded-[2rem] bg-foreground/10 opacity-0 transition-opacity group-hover:opacity-100">
                    {uploading ? <Loader2 className="h-8 w-8 animate-spin text-foreground" /> : <Camera className="h-8 w-8 text-foreground" />}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-lg font-semibold underline underline-offset-4 text-foreground"
                >
                  Edit
                </button>
              </div>

              <div className="space-y-4">
                <Button
                  type="button"
                  variant="outline"
                  className="h-16 min-w-[230px] rounded-2xl px-8 text-lg font-semibold"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Camera className="mr-2 h-5 w-5" />
                  Upload photo
                </Button>
                <div className="space-y-1 text-base text-muted-foreground">
                  <p>Maximum size — 2MB</p>
                  <p>JPG or PNG format</p>
                </div>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                void onAvatarUpload(event);
              }}
              disabled={uploading}
            />
          </div>
        </div>

        <form onSubmit={(event) => void onSaveAccount(event)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <Label htmlFor="firstName" className="text-base font-medium text-foreground">
                First name
              </Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(event) => onFirstNameChange(event.target.value)}
                className="h-16 rounded-2xl border-border bg-background px-6 text-lg"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="lastName" className="text-base font-medium text-foreground">
                Last name
              </Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(event) => onLastNameChange(event.target.value)}
                className="h-16 rounded-2xl border-border bg-background px-6 text-lg"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="accountEmail" className="text-base font-medium text-foreground">
              Email
            </Label>
            <Input
              id="accountEmail"
              value={email}
              disabled
              className="h-16 rounded-2xl border-border bg-background px-6 text-lg"
            />
          </div>

          <Button type="submit" className="h-16 w-full rounded-2xl text-lg font-semibold" disabled={loading || uploading}>
            {loading ? "Saving..." : "Save changes"}
          </Button>
        </form>
      </div>
    </SectionShell>
  );
}
