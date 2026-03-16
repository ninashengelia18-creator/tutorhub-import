import { Link } from "react-router-dom";
import { Monitor, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getInitials } from "@/components/messages/utils";

interface ConversationDetailsProps {
  name: string;
  avatarUrl: string | null;
  subject: string;
  detailsLabel: string;
  enterClassroomLabel: string;
}

export function ConversationDetails({
  name,
  avatarUrl,
  subject,
  detailsLabel,
  enterClassroomLabel,
}: ConversationDetailsProps) {
  return (
    <div className="hidden w-72 shrink-0 flex-col items-center border-l bg-card px-4 py-6 lg:flex">
      <p className="mb-4 self-start text-sm font-medium text-muted-foreground">{detailsLabel}</p>
      <div className="mb-4 flex h-32 w-32 items-center justify-center overflow-hidden rounded-2xl bg-muted">
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <span className="text-3xl font-bold text-primary">{getInitials(name)}</span>
        )}
      </div>
      <h3 className="mb-1 text-center text-xl font-bold">{name}</h3>
      <p className="mb-4 text-center text-sm text-muted-foreground">{subject}</p>
      <div className="mb-6 flex items-center gap-1 text-sm">
        <Star className="h-4 w-4 fill-foreground" />
        <span className="font-medium">5</span>
        <span className="text-muted-foreground">(0)</span>
      </div>
      <Button variant="outline" className="w-full" asChild>
        <Link to="/classroom">
          <Monitor className="mr-2 h-4 w-4" />
          {enterClassroomLabel}
        </Link>
      </Button>
    </div>
  );
}
