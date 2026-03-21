// Partner settings page - reuses student settings structure
import { Layout } from "@/components/Layout";
import { StudentSettingsSidebar } from "@/components/profile/StudentSettingsSidebar";
import { StudentSettingsPanels } from "@/components/profile/StudentSettingsPanels";
import { useProfileSettings } from "@/hooks/useProfileSettings";

export default function PartnerSettings() {
  const settings = useProfileSettings();

  return (
    <Layout hideFooter>
      <div className="container max-w-5xl py-8">
        <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          <StudentSettingsSidebar activePanel={settings.activePanel} onPanelChange={settings.setActivePanel} />
          <StudentSettingsPanels {...settings} />
        </div>
      </div>
    </Layout>
  );
}
