import { Archive, ArchiveRestore, Eye, MessageSquare, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPartnerAvatar, type PublicPartnerProfile } from "@/lib/publicPartners";

export interface PartnerManagementListItem extends PublicPartnerProfile {
  is_archived?: boolean;
}

interface PartnerManagementListProps {
  partners: PartnerManagementListItem[];
  emptyLabel: string;
  pendingActionId?: string | null;
  isArchiveView?: boolean;
  onSuspend: (partner: PartnerManagementListItem) => void;
  onDelete: (partner: PartnerManagementListItem) => void;
  onArchive?: (partner: PartnerManagementListItem) => void;
  onUnarchive?: (partner: PartnerManagementListItem) => void;
  onSendMessage?: (partner: PartnerManagementListItem) => void;
}

export function PartnerManagementList({
  partners,
  emptyLabel,
  pendingActionId,
  isArchiveView,
  onSuspend,
  onDelete,
  onArchive,
  onUnarchive,
  onSendMessage,
}: PartnerManagementListProps) {
  if (partners.length === 0) {
    return <div className="py-12 text-center text-muted-foreground">{emptyLabel}</div>;
  }

  return (
    <div className="space-y-3">
      {partners.map((partner) => {
        const isPendingAction = pendingActionId === partner.id;
        const fullName = `${partner.first_name} ${partner.last_name}`.trim();
        const isArchived = partner.is_archived;
        const isSuspended = !partner.is_published && !isArchived;
        const statusLabel = isArchived ? "Archived" : partner.is_published ? "Live" : "Suspended";

        return (
          <div key={partner.id} className={`rounded-xl border bg-card p-4 ${isArchived ? "opacity-75" : ""}`}>
            <div className="flex flex-col gap-4 md:flex-row md:items-start">
              <div className="flex min-w-0 flex-1 gap-4">
                <img
                  src={getPartnerAvatar(partner)}
                  alt={fullName}
                  className="h-16 w-16 rounded-2xl object-cover"
                  loading="lazy"
                />

                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{fullName}</p>
                    <Badge
                      variant="outline"
                      className={
                        isArchived
                          ? "border-muted-foreground/30 bg-muted/50 text-muted-foreground"
                          : partner.is_published
                            ? "border-success/30 bg-success/10 text-success"
                            : "border-destructive/30 bg-destructive/10 text-destructive"
                      }
                    >
                      {statusLabel}
                    </Badge>
                    {isSuspended && (
                      <Badge variant="outline" className="border-destructive/40 bg-destructive/15 text-destructive font-bold">
                        ⛔ Suspended
                      </Badge>
                    )}
                    {isArchived && (
                      <Badge variant="outline" className="border-muted-foreground/40 bg-muted/30 text-muted-foreground font-bold">
                        📦 Archived
                      </Badge>
                    )}
                    {partner.application_id ? <Badge variant="secondary">Application</Badge> : <Badge variant="secondary">Manual</Badge>}
                  </div>

                  <p className="text-sm text-muted-foreground">{partner.email ?? "No email"}</p>
                  <p className="text-sm text-muted-foreground">
                    {partner.country ?? "No country"} · ${Number(partner.price_per_session).toFixed(0)}/session
                  </p>
                  <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{partner.bio}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {isArchiveView ? (
                <>
                  {onUnarchive && (
                    <Button
                      size="sm"
                      onClick={() => onUnarchive(partner)}
                      disabled={isPendingAction}
                      className="bg-success text-primary-foreground hover:bg-success/90"
                    >
                      <ArchiveRestore className="mr-1 h-3.5 w-3.5" /> Restore
                    </Button>
                  )}
                  <Button size="sm" variant="destructive" onClick={() => onDelete(partner)} disabled={isPendingAction}>
                    <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete Permanently
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onSuspend(partner)}
                    disabled={isPendingAction}
                    className="border-warning/30 bg-warning/10 text-warning hover:bg-warning/20 hover:text-warning"
                  >
                    {partner.is_published ? "Suspend" : "Unsuspend"}
                  </Button>
                  {onArchive && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onArchive(partner)}
                      disabled={isPendingAction}
                      className="border-muted-foreground/30 bg-muted/10 text-muted-foreground hover:bg-muted/20"
                    >
                      <Archive className="mr-1 h-3.5 w-3.5" /> Archive
                    </Button>
                  )}
                  <Button size="sm" variant="destructive" onClick={() => onDelete(partner)} disabled={isPendingAction}>
                    <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                  </Button>
                  {onSendMessage && (
                    <Button size="sm" variant="ghost" onClick={() => onSendMessage(partner)}>
                      <MessageSquare className="mr-1 h-3.5 w-3.5" /> Send Message
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
