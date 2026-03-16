import { useMemo, useRef } from "react";
import { Paperclip, Send, Smile, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { formatAttachmentSize } from "@/components/messages/utils";

const EMOJIS = ["😀", "😊", "😍", "👍", "👏", "🎉", "🔥", "💜", "🙏", "🤝", "📚", "✏️"];

interface ChatComposerProps {
  message: string;
  attachedFile: File | null;
  sending: boolean;
  placeholder: string;
  sendLabel: string;
  attachLabel: string;
  emojiLabel: string;
  removeAttachmentLabel: string;
  onMessageChange: (value: string) => void;
  onSend: () => void;
  onEmojiSelect: (emoji: string) => void;
  onFileSelect: (file: File | null) => void;
  onRemoveAttachment: () => void;
}

export function ChatComposer({
  message,
  attachedFile,
  sending,
  placeholder,
  sendLabel,
  attachLabel,
  emojiLabel,
  removeAttachmentLabel,
  onMessageChange,
  onSend,
  onEmojiSelect,
  onFileSelect,
  onRemoveAttachment,
}: ChatComposerProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const attachmentMeta = useMemo(() => {
    if (!attachedFile) return null;
    return `${attachedFile.name} • ${formatAttachmentSize(attachedFile.size)}`;
  }, [attachedFile]);

  return (
    <div className="border-t p-3">
      <div className="rounded-2xl border bg-card p-3 shadow-sm">
        {attachedFile && (
          <div className="mb-3 flex items-center justify-between gap-3 rounded-xl bg-muted/50 px-3 py-2 text-sm">
            <div className="min-w-0">
              <p className="truncate font-medium">{attachedFile.name}</p>
              <p className="text-xs text-muted-foreground">{attachmentMeta}</p>
            </div>
            <Button type="button" size="icon" variant="ghost" onClick={onRemoveAttachment} aria-label={removeAttachmentLabel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <Textarea
          value={message}
          onChange={(event) => onMessageChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              onSend();
            }
          }}
          placeholder={placeholder}
          className="min-h-[88px] resize-none border-0 bg-transparent px-0 py-0 shadow-none focus-visible:ring-0"
        />

        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(event) => onFileSelect(event.target.files?.[0] ?? null)}
            />
            <Button type="button" size="icon" variant="ghost" onClick={() => fileInputRef.current?.click()} aria-label={attachLabel}>
              <Paperclip className="h-4 w-4" />
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button type="button" size="icon" variant="ghost" aria-label={emojiLabel}>
                  <Smile className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-3" align="start">
                <div className="grid grid-cols-6 gap-2">
                  {EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => onEmojiSelect(emoji)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-lg transition-colors hover:bg-accent"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <Button type="button" onClick={onSend} disabled={sending} className="rounded-full px-4" aria-label={sendLabel}>
            <Send className="h-4 w-4" />
            <span className="sr-only">{sendLabel}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
