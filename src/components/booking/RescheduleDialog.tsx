import { useState, useEffect } from "react";
import { CalendarIcon, Clock, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RESCHEDULE_REASONS } from "./bookingReasons";
import { useAppLocale } from "@/contexts/AppLocaleContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatDateInTimeZone, formatLessonTimeRange } from "@/lib/datetime";

interface Slot {
  id: string;
  slot_start_at: string;
  slot_end_at: string;
  tutor_timezone: string;
}

interface RescheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: {
    id: string;
    tutor_name: string;
    lesson_start_at?: string | null;
    lesson_end_at?: string | null;
  } | null;
  requestedBy: "student" | "tutor";
  onRescheduled: () => void;
}

export function RescheduleDialog({
  open,
  onOpenChange,
  booking,
  requestedBy,
  onRescheduled,
}: RescheduleDialogProps) {
  const { toast } = useToast();
  const { timezone } = useAppLocale();
  const { lang } = useLanguage();
  const [reason, setReason] = useState<string>(RESCHEDULE_REASONS[0].key);
  const [message, setMessage] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && booking) {
      loadAvailableSlots();
    }
  }, [open, booking]);

  const loadAvailableSlots = async () => {
    if (!booking) return;
    setLoadingSlots(true);

    const { data } = await supabase
      .from("tutor_availability_slots")
      .select("id, slot_start_at, slot_end_at, tutor_timezone")
      .eq("tutor_name", booking.tutor_name)
      .eq("availability_status", "open")
      .gt("slot_start_at", new Date().toISOString())
      .order("slot_start_at", { ascending: true })
      .limit(50);

    setSlots((data as Slot[]) ?? []);
    setLoadingSlots(false);
  };

  const handleReschedule = async () => {
    if (!booking || !selectedSlot) return;
    setSubmitting(true);

    const reasonLabel = RESCHEDULE_REASONS.find((r) => r.key === reason)?.label ?? reason;

    if (requestedBy === "student") {
      // Student can reschedule directly — update booking to new slot
      const slot = slots.find((s) => s.id === selectedSlot);
      if (!slot) {
        setSubmitting(false);
        return;
      }

      // Release old slot if exists
      // Book new slot and update booking
      const { error } = await supabase
        .from("bookings")
        .update({
          reschedule_status: "approved",
          reschedule_requested_by: "student",
          reschedule_reason: reasonLabel,
          reschedule_message: message || null,
          reschedule_new_slot_id: selectedSlot,
          lesson_start_at: slot.slot_start_at,
          lesson_end_at: slot.slot_end_at,
          availability_slot_id: selectedSlot,
        } as any)
        .eq("id", booking.id);

      if (!error) {
        // Mark new slot as booked
        await supabase
          .from("tutor_availability_slots")
          .update({ availability_status: "booked", booked_at: new Date().toISOString() })
          .eq("id", selectedSlot);

        // Release old slot
        if (booking.id) {
          const { data: oldBooking } = await supabase
            .from("bookings")
            .select("availability_slot_id")
            .eq("id", booking.id)
            .single();
          if (oldBooking?.availability_slot_id && oldBooking.availability_slot_id !== selectedSlot) {
            await supabase
              .from("tutor_availability_slots")
              .update({ availability_status: "open", booked_at: null })
              .eq("id", oldBooking.availability_slot_id);
          }
        }
      }

      setSubmitting(false);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Lesson rescheduled successfully" });
        cleanup();
        onRescheduled();
      }
    } else {
      // Tutor requests reschedule — needs student approval
      const { error } = await supabase
        .from("bookings")
        .update({
          reschedule_status: "pending",
          reschedule_requested_by: "tutor",
          reschedule_reason: reasonLabel,
          reschedule_message: message || null,
          reschedule_new_slot_id: selectedSlot,
        } as any)
        .eq("id", booking.id);

      setSubmitting(false);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        // Create notification for student
        try {
          const slot = slots.find((s) => s.id === selectedSlot);
          const newTime = slot
            ? formatDateInTimeZone(slot.slot_start_at, lang, timezone, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
            : "a new time";

          await supabase.from("notifications").insert({
            user_id: (await supabase.from("bookings").select("student_id").eq("id", booking.id).single()).data?.student_id,
            title: "Reschedule Request",
            message: `${booking.tutor_name} wants to reschedule your lesson to ${newTime}. Reason: ${reasonLabel}`,
            type: "reschedule_request",
            booking_id: booking.id,
          } as any);
        } catch {
          // Non-critical
        }
        toast({ title: "Reschedule request sent", description: "The student will be notified to approve or decline." });
        cleanup();
        onRescheduled();
      }
    }
  };

  const cleanup = () => {
    setMessage("");
    setReason(RESCHEDULE_REASONS[0].key);
    setSelectedSlot("");
    onOpenChange(false);
  };

  const formatSlotLabel = (slot: Slot) => {
    const date = formatDateInTimeZone(slot.slot_start_at, lang, timezone, { weekday: "short", month: "short", day: "numeric" });
    const time = formatLessonTimeRange(slot.slot_start_at, slot.slot_end_at, lang, timezone);
    return `${date} · ${time}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">Reschedule Lesson</DialogTitle>
        </DialogHeader>
        {booking && (
          <div className="space-y-4">
            {requestedBy === "tutor" && (
              <div className="bg-amber-500/10 rounded-lg p-3 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-sm">
                  As a tutor, your reschedule request needs to be approved by the student.
                </p>
              </div>
            )}

            <div>
              <p className="text-sm font-medium mb-2">Reason for rescheduling</p>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {RESCHEDULE_REASONS.map((r) => (
                    <SelectItem key={r.key} value={r.key}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Additional details (optional)</p>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Any additional context..."
                className="resize-none"
                rows={2}
              />
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Select new time slot</p>
              {loadingSlots ? (
                <p className="text-sm text-muted-foreground">Loading available slots...</p>
              ) : slots.length === 0 ? (
                <p className="text-sm text-muted-foreground">No available slots found for this tutor.</p>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-2 border rounded-lg p-2">
                  {slots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot.id)}
                      className={`w-full text-left rounded-lg p-3 text-sm transition-colors flex items-center gap-2 ${
                        selectedSlot === slot.id
                          ? "bg-primary/10 border border-primary/30 text-foreground"
                          : "hover:bg-muted border border-transparent"
                      }`}
                    >
                      <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span>{formatSlotLabel(slot)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button
              onClick={handleReschedule}
              disabled={submitting || !selectedSlot}
              className="w-full"
            >
              {submitting
                ? "Processing..."
                : requestedBy === "tutor"
                  ? "Send Reschedule Request"
                  : "Confirm Reschedule"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
