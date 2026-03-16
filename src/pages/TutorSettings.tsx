import { Loader2 } from "lucide-react";

import { StudentSettingsPanels } from "@/components/profile/StudentSettingsPanels";
import { StudentSettingsSidebar } from "@/components/profile/StudentSettingsSidebar";
import { Layout } from "@/components/Layout";
import { useProfileSettings } from "@/hooks/useProfileSettings";

export default function TutorSettings() {
  const {
    user,
    fileInputRef,
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
    handleSavePassword,
    handleSaveNotifications,
    handleDeleteAccount,
  } = useProfileSettings("/login?redirect=/tutor-settings");

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
            onFirstNameChange={(value) => setCurrentDisplayName(value, lastName, setActiveSection)}
            onLastNameChange={(value) => setLastNameValue(firstName, value, setActiveSection)}
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

function setCurrentDisplayName(value: string, lastName: string, setActiveSection: (value: never) => void) {
  void setActiveSection;
  throw new Error("placeholder");
}

function setLastNameValue(firstName: string, value: string, setActiveSection: (value: never) => void) {
  void firstName;
  void value;
  void setActiveSection;
  throw new Error("placeholder");
}
