import { useEffect, useMemo, useState } from "react";
import { Inbox, MessageSquare, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AdminMessage {
  id: string;
  recipient_type: string;
  recipient_name: string;
  recipient_email: string;
  sender_type: string;
  sender_name: string;
  content: string;
  read_at: string | null;
  created_at: string;
}

interface ConversationThread {
  recipientEmail: string;
  recipientName: string;
  recipientType: string;
  messages: AdminMessage[];
  lastMessageAt: string;
  unreadCount: number;
}

export function AdminInbox() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  const loadMessages = async () => {
    const { data, error } = await supabase
      .from("admin_messages" as any)
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error loading admin messages:", error);
      return;
    }
    setMessages((data as AdminMessage[]) ?? []);
  };

  useEffect(() => {
    void loadMessages();

    const channel = supabase
      .channel("admin-messages-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "admin_messages" },
        () => void loadMessages()
      )
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  }, []);

  const threads = useMemo<ConversationThread[]>(() => {
    const map = new Map<string, ConversationThread>();

    messages.forEach((msg) => {
      const key = msg.recipient_email;
      if (!map.has(key)) {
        map.set(key, {
          recipientEmail: msg.recipient_email,
          recipientName: msg.recipient_name,
          recipientType: msg.recipient_type,
          messages: [],
          lastMessageAt: msg.created_at,
          unreadCount: 0,
        });
      }
      const thread = map.get(key)!;
      thread.messages.push(msg);
      if (new Date(msg.created_at) > new Date(thread.lastMessageAt)) {
        thread.lastMessageAt = msg.created_at;
      }
      if (msg.sender_type !== "admin" && !msg.read_at) {
        thread.unreadCount++;
      }
    });

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    );
  }, [messages]);

  const selectedThread = useMemo(
    () => threads.find((t) => t.recipientEmail === selectedEmail) ?? null,
    [threads, selectedEmail]
  );

  // Mark replies as read when viewing
  useEffect(() => {
    if (!selectedThread) return;
    const unreadIds = selectedThread.messages
      .filter((m) => m.sender_type !== "admin" && !m.read_at)
      .map((m) => m.id);
    if (unreadIds.length === 0) return;

    const markRead = async () => {
      await supabase
        .from("admin_messages" as any)
        .update({ read_at: new Date().toISOString() } as any)
        .in("id", unreadIds);
      void loadMessages();
    };
    void markRead();
  }, [selectedThread]);

  const handleSendReply = async () => {
    if (!selectedThread || !reply.trim() || sending) return;
    setSending(true);
    try {
      const { error } = await supabase.from("admin_messages" as any).insert({
        recipient_type: selectedThread.recipientType,
        recipient_name: selectedThread.recipientName,
        recipient_email: selectedThread.recipientEmail,
        sender_type: "admin",
        sender_name: "LearnEazy Admin",
        content: reply.trim(),
      } as any);

      if (error) throw error;

      // Send email notification
      try {
        await supabase.functions.invoke("notify-admin-message", {
          body: {
            recipientEmail: selectedThread.recipientEmail,
            recipientName: selectedThread.recipientName,
            senderName: "LearnEazy Admin",
            messageContent: reply.trim(),
          },
        });
      } catch (emailErr) {
        console.error("Email notification failed:", emailErr);
      }

      setReply("");
      toast({ title: "Reply sent" });
      void loadMessages();
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to send reply", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  if (threads.length === 0) {
    return (
      <div className="py-12 text-center">
        <Inbox className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">No messages yet</p>
        <p className="text-sm text-muted-foreground">Messages you send to tutors and buddies will appear here.</p>
      </div>
    );
  }

  return (
    <div className="flex h-[600px] overflow-hidden rounded-xl border">
      {/* Thread list */}
      <div className="w-80 shrink-0 overflow-y-auto border-r bg-card">
        {threads.map((thread) => (
          <button
            key={thread.recipientEmail}
            onClick={() => setSelectedEmail(thread.recipientEmail)}
            className={`flex w-full items-start gap-3 border-b px-4 py-3 text-left transition-colors hover:bg-muted/50 ${
              selectedEmail === thread.recipientEmail ? "bg-muted/50" : ""
            }`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {thread.recipientName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-semibold">{thread.recipientName}</p>
                {thread.unreadCount > 0 && (
                  <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                    {thread.unreadCount}
                  </span>
                )}
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {thread.recipientType === "tutor" ? "Tutor" : "Language Buddy"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {thread.messages[thread.messages.length - 1]?.content}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Chat area */}
      <div className="flex flex-1 flex-col">
        {selectedThread ? (
          <>
            <div className="border-b px-6 py-4">
              <p className="font-semibold">{selectedThread.recipientName}</p>
              <p className="text-xs text-muted-foreground">
                {selectedThread.recipientEmail} · {selectedThread.recipientType === "tutor" ? "Tutor" : "Language Buddy"}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {selectedThread.messages.map((msg) => {
                const isAdmin = msg.sender_type === "admin";
                return (
                  <div key={msg.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                      isAdmin
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-card text-card-foreground"
                    }`}>
                      <p className="text-xs font-medium mb-1">{msg.sender_name}</p>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                      <p className={`mt-2 text-[11px] ${isAdmin ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {new Date(msg.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t p-4">
              <div className="flex gap-3">
                <Textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Type a reply..."
                  rows={2}
                  className="resize-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendReply();
                    }
                  }}
                />
                <Button onClick={handleSendReply} disabled={!reply.trim() || sending} className="shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageSquare className="mx-auto mb-3 h-10 w-10" />
              <p>Select a conversation</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
