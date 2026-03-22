import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SUBJECT_TAXONOMY, getSubjectLabel } from "@/lib/subjects";
import { cn } from "@/lib/utils";

interface SubjectPickerProps {
  selected: string[];
  onChange: (subjects: string[]) => void;
  className?: string;
}

export function SubjectPicker({ selected, onChange, className }: SubjectPickerProps) {
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

  const toggle = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter((s) => s !== value)
        : [...selected, value],
    );
  };

  const toggleCategory = (key: string) => {
    setOpenCategories((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className={cn("space-y-3", className)}>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((value) => (
            <Badge
              key={value}
              variant="secondary"
              className="cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
              onClick={() => toggle(value)}
            >
              {getSubjectLabel(value)} ×
            </Badge>
          ))}
        </div>
      )}

      <div className="rounded-xl border bg-background max-h-72 overflow-y-auto">
        {SUBJECT_TAXONOMY.map((category) => (
          <Collapsible
            key={category.key}
            open={openCategories[category.key] ?? false}
            onOpenChange={() => toggleCategory(category.key)}
          >
            <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors">
              {category.label}
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform",
                  openCategories[category.key] && "rotate-180",
                )}
              />
            </CollapsibleTrigger>
            <CollapsibleContent>
              {category.groups.map((group) => (
                <div key={group.label} className="px-4 pb-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 mt-1">
                    {group.label}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                    {group.subjects.map((subject) => (
                      <label
                        key={subject.value}
                        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        <Checkbox
                          checked={selected.includes(subject.value)}
                          onCheckedChange={() => toggle(subject.value)}
                        />
                        <span className="truncate">{subject.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </div>
  );
}
