import { useEffect, useState } from "react";
import { Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  tutorName: string;
  studentId: string;
}

export function ReviewDialog({ open, onOpenChange, bookingId, tutorName, studentId }: ReviewDialogProps) {
  const { toast } = useToast();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  useEffect(() => {
    if (!open || !bookingId) return;
    supabase
      .from("reviews" as never)
      .select("id")
      .eq("booking_id", bookingId)
      .maybeSingle()
      .then(({ data }) => {
        setAlreadyReviewed(!!data);
      });
  }, [open, bookingId]);

  const handleSubmit = async () => {
    setSaving(true);
    const { error } = await supabase.from("reviews" as never).insert({
      booking_id: bookingId,
      student_id: studentId,
      tutor_name: tutorName,
      rating,
      comment: comment.trim() || null,
    } as never);

    setSaving(false);

    if (error) {
      if (error.code === "23505") {
        toast({ title: "You've already reviewed this lesson" });
      } else {
        toast({ title: "Failed to submit review", description: error.message, variant: "destructive" });
      }
      return;
    }

    toast({ title: "Review submitted!", description: "Thank you for your feedback." });
    setComment("");
    setRating(5);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Review your lesson with {tutorName}</DialogTitle>
          <DialogDescription>Share your experience to help other students.</DialogDescription>
        </DialogHeader>

        {alreadyReviewed ? (
          <p className="py-4 text-sm text-muted-foreground">You've already reviewed this lesson.</p>
        ) : (
          <>
            <div className="flex items-center justify-center gap-1 py-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoverRating || rating)
                        ? "fill-warning text-warning"
                        : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
            </div>

            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you enjoy about the lesson? (optional)"
              rows={3}
            />

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={saving}>
                {saving ? "Submitting..." : "Submit Review"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
