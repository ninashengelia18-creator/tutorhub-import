import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle, Clock, XCircle } from "lucide-react";

export interface TutorApplicationListItem {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  experience: string;
  subjects: string[];
  hourly_rate: number;
  country: string | null;
  native_language: string | null;
  other_languages: string | null;
  bio: string;
  status: string;
  created_at: string;
}

const statusConfig: Record<string, { color: string; icon: typeof Clock; label: string }> = {
  pending: { color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30", icon: Clock, label: "Pending" },
  approved: { color: "bg-green-500/10 text-green-600 border-green-500/30", icon: CheckCircle, label: "Approved" },
  rejected: { color: "bg-red-500/10 text-red-600 border-red-500/30", icon: XCircle, label: "Rejected" },
};

interface TutorApplicationListProps {
  applications: TutorApplicationListItem[];
  emptyLabel: string;
  approveLabel: string;
  rejectLabel: string;
  onApprove: (application: TutorApplicationListItem) => void;
  onReject: (application: TutorApplicationListItem) => void;
  pendingActionId?: string | null;
}

export function TutorApplicationList({
  applications,
  emptyLabel,
  approveLabel,
  rejectLabel,
  onApprove,
  onReject,
  pendingActionId,
}: TutorApplicationListProps) {
  if (applications.length === 0) {
    return <div className="text-center py-12 text-muted-foreground">{emptyLabel}</div>;
  }

  return (
    <div className="space-y-3">
      {applications.map((app) => {
        const sc = statusConfig[app.status] || statusConfig.pending;
        const StatusIcon = sc.icon;
        const isPendingAction = pendingActionId === app.id;

        return (
          <div key={app.id} className="rounded-xl border bg-card p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-start">
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <Badge variant="outline" className={cn(sc.color, "gap-1")}>
                    <StatusIcon className="h-3 w-3" />
                    {sc.label}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{new Date(app.created_at).toLocaleDateString()}</span>
                </div>

                <p className="text-sm font-semibold">{app.first_name} {app.last_name}</p>
                <p className="text-sm text-muted-foreground">📧 {app.email}</p>
                <p className="text-sm text-muted-foreground">
                  {app.subjects[0] || "General"} · {app.experience} · ${Number(app.hourly_rate).toFixed(0)}/hr
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {app.subjects.map((subject) => (
                    <Badge key={subject} variant="secondary" className="text-xs">
                      {subject}
                    </Badge>
                  ))}
                </div>
                <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{app.bio}</p>
                {(app.country || app.native_language || app.other_languages) && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {[app.country, app.native_language, app.other_languages].filter(Boolean).join(" · ")}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                {app.status === "pending" ? (
                  <>
                    <Button size="sm" onClick={() => onApprove(app)} disabled={isPendingAction}>
                      {approveLabel}
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => onReject(app)} disabled={isPendingAction}>
                      {rejectLabel}
                    </Button>
                  </>
                ) : app.status === "approved" ? (
                  <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">✓ Approved</Badge>
                ) : (
                  <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30">✗ Rejected</Badge>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
