import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface PasswordInputProps extends React.ComponentProps<typeof Input> {
  toggleLabel: string;
  icon?: React.ReactNode;
}

export function PasswordInput({ className, toggleLabel, icon, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      {icon ? <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</div> : null}
      <Input
        {...props}
        type={visible ? "text" : "password"}
        className={cn(icon ? "pl-9" : "", "pr-11", className)}
      />
      <button
        type="button"
        aria-label={toggleLabel}
        onClick={() => setVisible((current) => !current)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}
