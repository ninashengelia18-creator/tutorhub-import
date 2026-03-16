import { Download, Paperclip } from "lucide-react";

import { MessageRecord } from "@/components/messages/types";
import { formatAttachmentSize, formatConversationTime } from "@/components/messages/utils";
import type { Language } from "@/contexts/LanguageContext";

interface ChatMessagesProps {
  messages: MessageRecord[];
  currentSenderType: "student" | "tutor";
  lang: Language;
  emptyLabel: string;
}

export function ChatMessages({ messages, currentSenderType, lang, emptyLabel }: ChatMessagesProps) {
  if (messages.length === 0) {
    return <div className="flex h-full items-center justify-center text-sm text-muted-foreground">{emptyLabel}</div>;
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => {
        const isOwn = message.sender_type === currentSenderType;

        return (
          <div key={message.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                isOwn
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-card-foreground"
              }`}
            >
              {message.content && <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>}

              {message.attachment_url && (
                <a
                  href={message.attachment_url}
                  target="_blank"
                  rel="noreferrer"
                  className={`mt-3 flex items-center gap-3 rounded-xl border px-3 py-2 text-sm ${
                    isOwn ? "border-primary-foreground/20 bg-primary-foreground/10" : "border-border bg-muted/40"
                  }`}
                >
                  <div className={`rounded-full p-2 ${isOwn ? "bg-primary-foreground/10" : "bg-muted"}`}>
                    <Paperclip className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{message.attachment_name ?? "Attachment"}</p>
                    <p className={`text-xs ${isOwn ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                      {formatAttachmentSize(message.attachment_size)}
                    </p>
                  </div>
                  <Download className="h-4 w-4 shrink-0" />
                </a>
              )}

              <div className={`mt-2 text-[11px] ${isOwn ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                {formatConversationTime(message.created_at, lang)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
