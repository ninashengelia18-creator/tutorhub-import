import { useCallback, useEffect, useState } from "react";
import { Calendar, Clock, DollarSign, ExternalLink, Mail, MapPin, Star, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getTutorAvatar, getTutorFullName, type PublicTutorProfile } from "@/lib/publicTutors";
import { cn } from "@/lib/utils";

interface TutorAccountDetailDialogProps {
  tutor: PublicTutorProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface TutorEarning {
  id: string;
  subject: string;
  student_name: string | null;
  lesson_date: string;
  gross_amount: number;
  commission_rate: number;
  commission_amount: number;
  net_amount: number;
  payout_status: string;
  is_trial: boolean;
}

interface AvailabilitySlot {
  id: string;
  slot_start_at: string;
  slot_end_at: string;
  availability_status: string;
  tutor_timezone: string;
}

interface TutorApplication {
  id: string;
  phone: string | null;
  timezone: string | null;
  availability: string;
  about_teaching: string | null;
  created_at: string;
  status: string;
}

export function TutorAccountDetailDialog({ tutor, open, onOpenChange }: TutorAccountDetailDialogProps) {
  const { toast } = useToast();
  const [earnings, setEarnings] = useState<TutorEarning[]>([]);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [application, setApplication] = useState<TutorApplication | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [impersonating, setImpersonating] = useState(false);

  const fullName = tutor ? getTutorFullName(tutor) : "";

  const loadDetails = useCallback(async () => {
    if (!tutor) return;
    setLoadingDetails(true);

    try {
      const [earningsRes, slotsRes, appRes] = await Promise.all([
        supabase
          .from("tutor_earnings")
          .select("*")
          .eq("tutor_name", fullName)
          .order("lesson_date", { ascending: false })
          .limit(20),
        supabase
          .from("tutor_availability_slots")
          .select("*")
          .eq("tutor_name", fullName)
          .gte("slot_start_at", new Date().toISOString())
          .order("slot_start_at", { ascending: true })
          .limit(10),
        tutor.application_id
          ? supabase
              .from("tutor_applications")
              .select("id, phone, timezone, availability, about_teaching, created_at, status")
              .eq("id", tutor.application_id)
              .maybeSingle()
          : Promise.resolve({ data: null, error: null }),
      ]);

      setEarnings((earningsRes.data as TutorEarning[] | null) ?? []);
      setSlots((slotsRes.data as AvailabilitySlot[] | null) ?? []);
      setApplication(appRes.data as TutorApplication | null);
    } finally {
      setLoadingDetails(false);
    }
  }, [tutor, fullName]);

  useEffect(() => {
    if (open && tutor) void loadDetails();
  }, [open, tutor, loadDetails]);

  const handleImpersonate = async () => {
    if (!tutor?.email) return;
    setImpersonating(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-impersonate", {
        body: { email: tutor.email, redirectTo: `${window.location.origin}/tutor-dashboard` },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
        toast({
          title: "Login link opened",
          description: "A new tab will open as the tutor. Note: this will sign you out of your admin session in that tab.",
        });
      }
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed to generate login link", variant: "destructive" });
    } finally {
      setImpersonating(false);
    }
  };

  const totalGross = earnings.reduce((s, e) => s + e.gross_amount, 0);
  const totalNet = earnings.reduce((s, e) => s + e.net_amount, 0);
  const totalCommission = earnings.reduce((s, e) => s + e.commission_amount, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Tutor Account Details</DialogTitle>
        </DialogHeader>

        {tutor && (
          <div className="space-y-6">
            {/* Profile header */}
            <div className="flex gap-4">
              <img
                src={getTutorAvatar(tutor)}
                alt={fullName}
                className="h-20 w-20 rounded-2xl object-cover"
              />
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{fullName}</h3>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" /> {tutor.email ?? "No email"}
                  </span>
                  {tutor.country && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> {tutor.country}
                    </span>
                  )}
                </div>
                <div className="mt-1 flex flex-wrap gap-2">
                  <Badge
                    variant="outline"
                    className={tutor.is_published
                      ? "border-success/30 bg-success/10 text-success"
                      : "border-destructive/30 bg-destructive/10 text-destructive"
                    }
                  >
                    {tutor.is_published ? "Live" : "Not published"}
                  </Badge>
                  <Badge variant="secondary">{tutor.application_id ? "From Application" : "Manual"}</Badge>
                  <Badge variant="outline" className="gap-1">
                    <Star className="h-3 w-3" /> {Number(tutor.rating).toFixed(1)} ({tutor.review_count} reviews)
                  </Badge>
                </div>
              </div>
            </div>

            {/* Impersonate button */}
            {tutor.email && (
              <Button
                onClick={handleImpersonate}
                disabled={impersonating}
                variant="outline"
                className="w-full"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                {impersonating ? "Generating login link..." : "Login as this tutor (new tab)"}
              </Button>
            )}

            <Separator />

            {/* Profile details */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Profile Information</h4>
              <div className="grid gap-3 sm:grid-cols-2">
                <DetailRow label="Primary Subject" value={tutor.primary_subject} />
                <DetailRow label="All Subjects" value={tutor.subjects?.join(", ") || "—"} />
                <DetailRow label="Hourly Rate" value={`$${Number(tutor.hourly_rate).toFixed(0)}/hr`} />
                <DetailRow label="Native Language" value={tutor.native_language ?? "—"} />
                <DetailRow label="Other Languages" value={tutor.other_languages ?? "—"} />
                <DetailRow label="Education" value={tutor.education ?? "—"} />
                <DetailRow label="Certifications" value={tutor.certifications ?? "—"} />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Bio</p>
                <p className="mt-1 text-sm">{tutor.bio}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Experience</p>
                <p className="mt-1 text-sm">{tutor.experience}</p>
              </div>
            </div>

            {/* Application details */}
            {application && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold">Application Details</h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <DetailRow label="Phone" value={application.phone ?? "—"} />
                    <DetailRow label="Timezone" value={application.timezone ?? "—"} />
                    <DetailRow label="Availability" value={application.availability} />
                    <DetailRow label="Applied On" value={new Date(application.created_at).toLocaleDateString()} />
                    <DetailRow label="Status" value={application.status} />
                  </div>
                  {application.about_teaching && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">About Teaching</p>
                      <p className="mt-1 text-sm">{application.about_teaching}</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Earnings summary */}
            <Separator />
            <div className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <DollarSign className="h-4 w-4" /> Earnings Overview
              </h4>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border bg-background p-3">
                  <p className="text-xs text-muted-foreground">Gross</p>
                  <p className="mt-1 text-lg font-semibold">${totalGross.toFixed(2)}</p>
                </div>
                <div className="rounded-xl border bg-background p-3">
                  <p className="text-xs text-muted-foreground">Commission</p>
                  <p className="mt-1 text-lg font-semibold text-destructive">${totalCommission.toFixed(2)}</p>
                </div>
                <div className="rounded-xl border bg-background p-3">
                  <p className="text-xs text-muted-foreground">Net</p>
                  <p className="mt-1 text-lg font-semibold text-success">${totalNet.toFixed(2)}</p>
                </div>
              </div>

              {earnings.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Recent earnings (last 20)</p>
                  {earnings.map((e) => (
                    <div key={e.id} className="flex items-center justify-between rounded-lg border bg-card px-3 py-2 text-sm">
                      <div>
                        <span className="font-medium">{e.subject}</span>
                        <span className="ml-2 text-muted-foreground">{e.student_name ?? "Unknown"}</span>
                        <span className="ml-2 text-xs text-muted-foreground">{e.lesson_date}</span>
                        {e.is_trial && <Badge variant="secondary" className="ml-2 text-xs">Trial</Badge>}
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-success">${e.net_amount.toFixed(2)}</span>
                        <Badge variant="outline" className={cn("ml-2 text-xs", e.payout_status === "paid" ? "text-success" : "text-muted-foreground")}>
                          {e.payout_status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming availability */}
            <Separator />
            <div className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Upcoming Availability ({slots.length})
              </h4>
              {slots.length === 0 ? (
                <p className="text-sm text-muted-foreground">No upcoming slots.</p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {slots.map((slot) => (
                    <div key={slot.id} className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>
                        {new Date(slot.slot_start_at).toLocaleDateString()} {new Date(slot.slot_start_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <Badge variant="outline" className={cn("text-xs", slot.availability_status === "open" ? "text-success" : "text-muted-foreground")}>
                        {slot.availability_status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {loadingDetails && (
          <div className="py-8 text-center text-muted-foreground">Loading details...</div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm">{value}</p>
    </div>
  );
}
