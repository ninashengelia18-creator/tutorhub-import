import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export type StudentSettingsSection =
  | "account"
  | "password"
  | "notifications"
  | "delete";

export function StudentSettingsSidebar({
  activeSection,
  onSectionChange,
}: {
  activeSection: StudentSettingsSection;
  onSectionChange: (section: StudentSettingsSection) => void;
}) {
  const { t } = useLanguage();

  const sections: Array<{ id: StudentSettingsSection; label: string }> = [
    { id: "account", label: t("profile.settings.account") },
    { id: "password", label: t("profile.settings.password") },
    { id: "notifications", label: t("profile.settings.notifications") },
    { id: "delete", label: t("profile.settings.deleteAccount") },
  ];

  return (
    <aside className="w-full max-w-[220px] shrink-0">
      <nav className="flex flex-col gap-1">
        {sections.map((section) => {
          const active = section.id === activeSection;

          return (
            <Button
              key={section.id}
              type="button"
              variant="ghost"
              onClick={() => onSectionChange(section.id)}
              className={`justify-start rounded-none px-5 py-6 text-left text-xl font-medium transition-colors hover:bg-transparent hover:text-foreground ${
                active
                  ? "border-l-4 border-primary text-foreground"
                  : "border-l-4 border-transparent text-muted-foreground"
              }`}
            >
              {section.label}
            </Button>
          );
        })}
      </nav>
    </aside>
  );
}
