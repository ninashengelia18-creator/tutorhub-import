import { useState } from "react";
import { AlertCircle } from "lucide-react";
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
import { CANCEL_REASONS } from "./bookingReasons";

interface CancelBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: {
    id: string;
    tutor_name: string;
    lesson_start_at?: string | null;
  } | null;
  cancelledBy: "student" | "tutor";
  dateLabel: string;
  onCancelled: () => void;
}

export function CancelBookingDialog({
  open,
  onOpenChange,
  booking,
  cancelledBy,
  dateLabel,
  onCancelled,
}: CancelBookingDialogProps) {
  const { toast } = useToast();
  const [reason, setReason] = useState(CANCEL_REASONS[0].key);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleCancel = async () => {
    if (!booking) return;
    setSubmitting(true);

    const { error } = await supabase
      .from("bookings")
      .update({
        status: "cancelled",
        cancel_reason: CANCEL_REASONS.find((r) => r.key === reason)?.label ?? reason,
        cancel_message: message || null,
        cancelled_by: cancelledBy,
      } as any)
      .eq("id", booking.id);

    setSubmitting(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      // Send notification to the other party
      try {
        await supabase.functions.invoke("confirm-booking-payment", {
          body: { action: "notify_cancellation", booking_id: booking.id, cancelled_by: cancelledBy },
        });
      } catch {
        // Non-critical
      }
      toast({ title: "Lesson cancelled" });
      setMessage("");
      setReason(CANCEL_REASONS[0].key);
      onOpenChange(false);
      onCancelled();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">Cancel Lesson</DialogTitle>
        </DialogHeader>
        {booking && (
          <div>
            <p className="text-sm text-muted-foreground mb-4">{dateLabel}</p>
            <div className="bg-destructive/10 rounded-lg p-3 flex items-start gap-3 mb-6">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm">
                This action cannot be undone. The {cancelledBy === "student" ? "tutor" : "student"} will be notified.
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Reason for cancellation</p>
                <Select value={reason} onValueChange={setReason}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CANCEL_REASONS.map((r) => (
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
                  rows={3}
                />
              </div>
              <Button onClick={handleCancel} disabled={submitting} variant="destructive" className="w-full">
                {submitting ? "Cancelling..." : "Confirm Cancellation"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
