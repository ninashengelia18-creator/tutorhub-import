import { useState } from "react";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface AdminSendMessageDialogProps {
  open: boolean;
  recipientName: string;
  recipientEmail: string;
  recipientType: "tutor" | "partner";
  sending: boolean;
  onOpenChange: (open: boolean) => void;
  onSend: (content: string) => void;
}

export function AdminSendMessageDialog({
  open,
  recipientName,
  recipientEmail,
  recipientType,
  sending,
  onOpenChange,
  onSend,
}: AdminSendMessageDialogProps) {
  const [content, setContent] = useState("");

  const handleSend = () => {
    if (!content.trim()) return;
    onSend(content.trim());
    setContent("");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) setContent(""); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Send message to {recipientName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border bg-muted/50 p-3 text-sm">
            <p className="font-medium">{recipientName}</p>
            <p className="text-muted-foreground">{recipientEmail} · {recipientType === "tutor" ? "Tutor" : "Language Buddy"}</p>
          </div>

          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type your message..."
            rows={5}
            className="resize-none"
          />

          <Button
            className="w-full"
            onClick={handleSend}
            disabled={!content.trim() || sending}
          >
            <Send className="mr-2 h-4 w-4" />
            {sending ? "Sending..." : "Send Message"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
