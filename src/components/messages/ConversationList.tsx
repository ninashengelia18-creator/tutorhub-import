import { MoreHorizontal, Trash2 } from "lucide-react";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ConversationListItem } from "@/components/messages/types";
import { formatConversationTime, getInitials } from "@/components/messages/utils";
import type { Language } from "@/contexts/LanguageContext";

interface ConversationListProps {
  conversations: ConversationListItem[];
  selectedId: string | null;
  lang: Language;
  emptyLabel: string;
  continueLabel: (name: string) => string;
  onSelect: (id: string) => void;
  onDelete: (conversation: ConversationListItem) => void;
}

export function ConversationList({
  conversations,
  selectedId,
  lang,
  emptyLabel,
  continueLabel,
  onSelect,
  onDelete,
}: ConversationListProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.length === 0 && <p className="p-4 text-sm text-muted-foreground">{emptyLabel}</p>}

      {conversations.map((conversation) => (
        <button
          key={conversation.id}
          onClick={() => onSelect(conversation.id)}
          className={`flex w-full items-start gap-3 border-b px-4 py-3 text-left transition-colors hover:bg-muted/50 ${
            selectedId === conversation.id ? "bg-muted/50" : ""
          }`}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-sm font-bold text-primary">
            {conversation.avatar_url ? (
              <img src={conversation.avatar_url} alt={conversation.name} className="h-full w-full object-cover" loading="lazy" />
            ) : (
              getInitials(conversation.name)
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-semibold">{conversation.name}</p>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-xs text-muted-foreground">{formatConversationTime(conversation.updatedAt, lang)}</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <span
                      role="button"
                      aria-label="Conversation options"
                      onClick={(event) => event.stopPropagation()}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(event) => {
                        event.stopPropagation();
                        onDelete(conversation);
                      }}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <p className="truncate text-xs text-muted-foreground">{conversation.lastMessage}</p>
            <div className="mt-1 flex items-center justify-between gap-2">
              <p className="truncate text-xs text-primary">{continueLabel(conversation.name.split(" ")[0] ?? conversation.name)}</p>
              {conversation.unread > 0 && (
                <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                  {conversation.unread}
                </span>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}