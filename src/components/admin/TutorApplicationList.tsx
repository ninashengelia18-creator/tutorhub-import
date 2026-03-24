import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { CheckCircle, Clock, XCircle, FileText, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export interface TutorApplicationListItem {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  experience: string;
  education: string | null;
  certifications: string | null;
  subjects: string[];
  hourly_rate: number;
  country: string | null;
  native_language: string | null;
  other_languages: string | null;
  bio: string;
  availability: string;
  timezone: string | null;
  about_teaching: string | null;
  status: string;
  created_at: string;
  id_document_url: string | null;
}

const statusConfig: Record<string, { tone: string; icon: typeof Clock; label: string }> = {
  pending: { tone: "warning", icon: Clock, label: "Pending" },
  approved: { tone: "success", icon: CheckCircle, label: "Approved" },
  rejected: { tone: "destructive", icon: XCircle, label: "Rejected" },
};

interface TutorApplicationListProps {
  applications: TutorApplicationListItem[];
  emptyLabel: string;
  approveLabel: string;
  rejectLabel: string;
  onApprove: (application: TutorApplicationListItem) => void;
  onReject: (application: TutorApplicationListItem) => void;
  onDelete?: (application: TutorApplicationListItem) => void;
  pendingActionId?: string | null;
}

function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="py-2 border-b border-border/50 last:border-0">
      <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</dt>
      <dd className="mt-1 text-sm whitespace-pre-wrap">{value}</dd>
    </div>
  );
}

export function TutorApplicationList({
  applications,
  emptyLabel,
  approveLabel,
  rejectLabel,
  onApprove,
  onReject,
  onDelete,
  pendingActionId,
}: TutorApplicationListProps) {
  const [viewingApp, setViewingApp] = useState<TutorApplicationListItem | null>(null);

  if (applications.length === 0) {
    return <div className="text-center py-12 text-muted-foreground">{emptyLabel}</div>;
  }

  return (
    <>
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
                    <Badge variant={sc.tone === "warning" ? "secondary" : "outline"} className="gap-1">
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
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => setViewingApp(app)}>
                    <Eye className="h-3 w-3 mr-1" />
                    View Full
                  </Button>
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
                    <>
                      <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30">✗ Rejected</Badge>
                      {onDelete && (
                        <Button size="sm" variant="destructive" onClick={() => onDelete(app)} disabled={isPendingAction}>
                          Delete
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Application Detail Dialog */}
      <Dialog open={!!viewingApp} onOpenChange={(open) => !open && setViewingApp(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {viewingApp && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display">
                  {viewingApp.first_name} {viewingApp.last_name}
                </DialogTitle>
              </DialogHeader>
              <dl className="space-y-0 mt-2">
                <DetailRow label="Email" value={viewingApp.email} />
                <DetailRow label="Phone" value={viewingApp.phone} />
                <DetailRow label="Country" value={viewingApp.country} />
                <DetailRow label="Native Language" value={viewingApp.native_language} />
                <DetailRow label="Other Languages" value={viewingApp.other_languages} />
                <DetailRow label="Subjects" value={viewingApp.subjects.join(", ")} />
                <DetailRow label="Experience" value={viewingApp.experience} />
                <DetailRow label="Education" value={viewingApp.education} />
                <DetailRow label="Certifications" value={viewingApp.certifications} />
                <DetailRow label="Hourly Rate" value={`$${Number(viewingApp.hourly_rate).toFixed(0)}/hr`} />
                <DetailRow label="Bio" value={viewingApp.bio} />
                <DetailRow label="About Teaching" value={viewingApp.about_teaching} />
                <DetailRow label="Availability" value={viewingApp.availability} />
                <DetailRow label="Timezone" value={viewingApp.timezone} />
                <DetailRow label="Applied" value={new Date(viewingApp.created_at).toLocaleString()} />
                {viewingApp.id_document_url && (
                  <div className="py-2">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline font-medium"
                      onClick={async () => {
                        const { data } = await supabase.storage
                          .from("id-documents")
                          .createSignedUrl(viewingApp.id_document_url!, 300);
                        if (data?.signedUrl) window.open(data.signedUrl, "_blank");
                      }}
                    >
                      <FileText className="h-4 w-4" />
                      View ID Document
                    </button>
                  </div>
                )}
              </dl>
              <div className="flex gap-2 mt-4">
                {viewingApp.status === "pending" && (
                  <>
                    <Button size="sm" onClick={() => { onApprove(viewingApp); setViewingApp(null); }}>
                      {approveLabel}
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => { onReject(viewingApp); setViewingApp(null); }}>
                      {rejectLabel}
                    </Button>
                  </>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
