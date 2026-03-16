import { Button } from "@/components/ui/button";

export type StudentSettingsSection =
  | "account"
  | "password"
  | "email"
  | "calendar"
  | "notifications"
  | "delete";

const sections: Array<{ id: StudentSettingsSection; label: string }> = [
  { id: "account", label: "Account" },
  { id: "password", label: "Password" },
  { id: "email", label: "Email" },
  { id: "calendar", label: "Calendar" },
  { id: "notifications", label: "Notifications" },
  { id: "delete", label: "Delete account" },
];

interface StudentSettingsSidebarProps {
  activeSection: StudentSettingsSection;
  onSectionChange: (section: StudentSettingsSection) => void;
}

export function StudentSettingsSidebar({ activeSection, onSectionChange }: StudentSettingsSidebarProps) {
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
