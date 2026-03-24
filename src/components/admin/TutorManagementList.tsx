import { Archive, ArchiveRestore, Eye, MessageSquare, Pencil, Trash2, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getTutorAvatar, getTutorFullName, type PublicTutorProfile } from "@/lib/publicTutors";

export interface TutorManagementListItem extends PublicTutorProfile {
  bookingsCount: number;
  completedLessonsCount: number;
  totalEarnings: number;
  is_archived?: boolean;
}

interface TutorManagementListProps {
  tutors: TutorManagementListItem[];
  emptyLabel: string;
  pendingActionId?: string | null;
  isArchiveView?: boolean;
  onApprove: (tutor: TutorManagementListItem) => void;
  onSuspend: (tutor: TutorManagementListItem) => void;
  onDelete: (tutor: TutorManagementListItem) => void;
  onEdit: (tutor: TutorManagementListItem) => void;
  onViewBookings: (tutor: TutorManagementListItem) => void;
  onViewAccount?: (tutor: TutorManagementListItem) => void;
  onArchive?: (tutor: TutorManagementListItem) => void;
  onUnarchive?: (tutor: TutorManagementListItem) => void;
  onSendMessage?: (tutor: TutorManagementListItem) => void;
}

export function TutorManagementList({
  tutors,
  emptyLabel,
  pendingActionId,
  isArchiveView,
  onApprove,
  onSuspend,
  onDelete,
  onEdit,
  onViewBookings,
  onViewAccount,
  onArchive,
  onUnarchive,
  onSendMessage,
}: TutorManagementListProps) {
  if (tutors.length === 0) {
    return <div className="py-12 text-center text-muted-foreground">{emptyLabel}</div>;
  }

  return (
    <div className="space-y-3">
      {tutors.map((tutor) => {
        const isPendingAction = pendingActionId === tutor.id;
        const fullName = getTutorFullName(tutor);
        const isArchived = tutor.is_archived;
        const isSuspended = !tutor.is_published && !isArchived;
        const statusLabel = isArchived ? "Archived" : tutor.is_published ? "Live" : "Suspended";

        return (
          <div key={tutor.id} className={`rounded-xl border bg-card p-4 ${isArchived ? "opacity-75" : ""}`}>
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
              <div className="flex min-w-0 flex-1 gap-4">
                <img
                  src={getTutorAvatar(tutor)}
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
                          : tutor.is_published
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
                    {tutor.application_id ? <Badge variant="secondary">Application</Badge> : <Badge variant="secondary">Manual</Badge>}
                  </div>

                  <p className="text-sm text-muted-foreground">{tutor.email ?? "No email"}</p>
                  <p className="text-sm text-muted-foreground">
                    {tutor.primary_subject} · {tutor.experience} · ${Number(tutor.hourly_rate).toFixed(0)}/hr
                  </p>
                  <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{tutor.bio}</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[320px]">
                <div className="rounded-xl border border-border bg-background p-3">
                  <p className="text-xs text-muted-foreground">Bookings</p>
                  <p className="mt-1 text-lg font-semibold text-foreground">{tutor.bookingsCount}</p>
                </div>
                <div className="rounded-xl border border-border bg-background p-3">
                  <p className="text-xs text-muted-foreground">Completed</p>
                  <p className="mt-1 text-lg font-semibold text-foreground">{tutor.completedLessonsCount}</p>
                </div>
                <div className="rounded-xl border border-border bg-background p-3">
                  <p className="text-xs text-muted-foreground">Earnings</p>
                  <p className="mt-1 text-lg font-semibold text-foreground">${tutor.totalEarnings.toFixed(0)}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {isArchiveView ? (
                <>
                  {onUnarchive && (
                    <Button
                      size="sm"
                      onClick={() => onUnarchive(tutor)}
                      disabled={isPendingAction}
                      className="bg-success text-primary-foreground hover:bg-success/90"
                    >
                      <ArchiveRestore className="mr-1 h-3.5 w-3.5" /> Restore
                    </Button>
                  )}
                  <Button size="sm" variant="destructive" onClick={() => onDelete(tutor)} disabled={isPendingAction}>
                    <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete Permanently
                  </Button>
                  {onViewAccount && (
                    <Button size="sm" variant="ghost" onClick={() => onViewAccount(tutor)}>
                      <User className="mr-1 h-3.5 w-3.5" /> View Account
                    </Button>
                  )}
                </>
              ) : (
                <>
                  {!tutor.is_published && (
                    <Button
                      size="sm"
                      onClick={() => onApprove(tutor)}
                      disabled={isPendingAction}
                      className="bg-success text-primary-foreground hover:bg-success/90"
                    >
                      Approve
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onSuspend(tutor)}
                    disabled={isPendingAction}
                    className="border-warning/30 bg-warning/10 text-warning hover:bg-warning/20 hover:text-warning"
                  >
                    {tutor.is_published ? "Suspend" : "Unsuspend"}
                  </Button>
                  {onArchive && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onArchive(tutor)}
                      disabled={isPendingAction}
                      className="border-muted-foreground/30 bg-muted/10 text-muted-foreground hover:bg-muted/20"
                    >
                      <Archive className="mr-1 h-3.5 w-3.5" /> Archive
                    </Button>
                  )}
                  <Button size="sm" variant="destructive" onClick={() => onDelete(tutor)} disabled={isPendingAction}>
                    <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onEdit(tutor)}>
                    <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
                  </Button>
                   <Button size="sm" variant="ghost" onClick={() => onViewBookings(tutor)}>
                     <Eye className="mr-1 h-3.5 w-3.5" /> View bookings
                   </Button>
                   {onViewAccount && (
                     <Button size="sm" variant="ghost" onClick={() => onViewAccount(tutor)}>
                       <User className="mr-1 h-3.5 w-3.5" /> View Account
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
