import { useState, useEffect } from "react";
import { CalendarIcon, Check, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAppLocale } from "@/contexts/AppLocaleContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatDateInTimeZone, formatLessonTimeRange } from "@/lib/datetime";

interface RescheduleApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: {
    id: string;
    tutor_name: string;
    lesson_start_at?: string | null;
    lesson_end_at?: string | null;
    reschedule_reason?: string | null;
    reschedule_message?: string | null;
    reschedule_new_slot_id?: string | null;
  } | null;
  onResolved: () => void;
}

export function RescheduleApprovalDialog({
  open,
  onOpenChange,
  booking,
  onResolved,
}: RescheduleApprovalDialogProps) {
  const { toast } = useToast();
  const { timezone } = useAppLocale();
  const { lang } = useLanguage();
  const [newSlot, setNewSlot] = useState<{ slot_start_at: string; slot_end_at: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && booking?.reschedule_new_slot_id) {
      supabase
        .from("tutor_availability_slots")
        .select("slot_start_at, slot_end_at")
        .eq("id", booking.reschedule_new_slot_id)
        .single()
        .then(({ data }) => setNewSlot(data));
    }
  }, [open, booking?.reschedule_new_slot_id]);

  const handleDecision = async (approved: boolean) => {
    if (!booking) return;
    setSubmitting(true);

    if (approved && newSlot) {
      // Approve: update booking to new time
      const { error } = await supabase
        .from("bookings")
        .update({
          reschedule_status: "approved",
          lesson_start_at: newSlot.slot_start_at,
          lesson_end_at: newSlot.slot_end_at,
          availability_slot_id: booking.reschedule_new_slot_id,
        } as any)
        .eq("id", booking.id);

      if (!error && booking.reschedule_new_slot_id) {
        await supabase
          .from("tutor_availability_slots")
          .update({ availability_status: "booked", booked_at: new Date().toISOString() })
          .eq("id", booking.reschedule_new_slot_id);
      }

      setSubmitting(false);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Reschedule approved", description: "The lesson has been moved to the new time." });
        onOpenChange(false);
        onResolved();
      }
    } else {
      // Reject
      const { error } = await supabase
        .from("bookings")
        .update({ reschedule_status: "rejected" } as any)
        .eq("id", booking.id);

      setSubmitting(false);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Reschedule declined", description: "The lesson remains at its original time." });
        onOpenChange(false);
        onResolved();
      }
    }
  };

  const newTimeLabel = newSlot
    ? `${formatDateInTimeZone(newSlot.slot_start_at, lang, timezone, { weekday: "short", month: "short", day: "numeric" })} · ${formatLessonTimeRange(newSlot.slot_start_at, newSlot.slot_end_at, lang, timezone)}`
    : "Loading...";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">Reschedule Request</DialogTitle>
        </DialogHeader>
        {booking && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              <strong>{booking.tutor_name}</strong> wants to reschedule your lesson.
            </p>

            {booking.reschedule_reason && (
              <div className="rounded-lg bg-muted p-3">
                <p className="text-sm font-medium">Reason: {booking.reschedule_reason}</p>
                {booking.reschedule_message && (
                  <p className="text-sm text-muted-foreground mt-1">{booking.reschedule_message}</p>
                )}
              </div>
            )}

            <div className="rounded-lg border p-3 flex items-center gap-3">
              <CalendarIcon className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Proposed new time</p>
                <p className="text-sm font-medium">{newTimeLabel}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => handleDecision(true)}
                disabled={submitting || !newSlot}
                className="flex-1 gap-2"
              >
                <Check className="h-4 w-4" /> Approve
              </Button>
              <Button
                onClick={() => handleDecision(false)}
                disabled={submitting}
                variant="outline"
                className="flex-1 gap-2"
              >
                <X className="h-4 w-4" /> Decline
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
