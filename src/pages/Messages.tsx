import { useEffect, useMemo, useState } from "react";
import { Info } from "lucide-react";

import { Layout } from "@/components/Layout";
import { ChatComposer } from "@/components/messages/ChatComposer";
import { ChatMessages } from "@/components/messages/ChatMessages";
import { ConversationDetails } from "@/components/messages/ConversationDetails";
import { ConversationList } from "@/components/messages/ConversationList";
import type {
  BookingContactRecord,
  ConversationListItem,
  ConversationRecord,
  MessageFilter,
  MessageRecord,
} from "@/components/messages/types";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { sanitizeFileName } from "@/components/messages/utils";

export default function Messages() {
  const { user, profile } = useAuth();
  const { t, lang } = useLanguage();
  const { toast } = useToast();

  const [contacts, setContacts] = useState<BookingContactRecord[]>([]);
  const [conversations, setConversations] = useState<ConversationRecord[]>([]);
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [selectedTutorId, setSelectedTutorId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [msgFilter, setMsgFilter] = useState<MessageFilter>("all");
  const [showDetails, setShowDetails] = useState(true);
  const [showTip, setShowTip] = useState(true);
  const [sending, setSending] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<ConversationListItem | null>(null);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      const [{ data: bookingsData }, { data: conversationsData }, { data: messagesData }] = await Promise.all([
        supabase
          .from("bookings")
          .select("tutor_name, tutor_avatar_url, subject, created_at")
          .eq("student_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("message_conversations")
          .select("tutor_name, archived_by_student, deleted_by_student, updated_at")
          .eq("student_id", user.id)
          .order("updated_at", { ascending: false }),
        supabase
          .from("messages")
          .select("id, tutor_name, content, created_at, sender_type, sender_display_name, read_at, attachment_url, attachment_name, attachment_type, attachment_size")
          .eq("student_id", user.id)
          .order("created_at", { ascending: true }),
      ]);

      setContacts((bookingsData as BookingContactRecord[] | null) ?? []);
      setConversations((conversationsData as ConversationRecord[] | null) ?? []);
      setMessages((messagesData as MessageRecord[] | null) ?? []);
    };

    void loadData();

    const messagesChannel = supabase
      .channel(`messages-student-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages", filter: `student_id=eq.${user.id}` },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setMessages((current) => {
              const next = [...current, payload.new as MessageRecord];
              next.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
              return next;
            });
            return;
          }

          if (payload.eventType === "UPDATE") {
            setMessages((current) => current.map((item) => (item.id === payload.new.id ? (payload.new as MessageRecord) : item)));
          }
        },
      )
      .subscribe();

    const conversationsChannel = supabase
      .channel(`message-conversations-student-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "message_conversations", filter: `student_id=eq.${user.id}` },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setConversations((current) => {
              const exists = current.some((item) => item.tutor_name === payload.new.tutor_name);
              if (exists) {
                return current.map((item) =>
                  item.tutor_name === payload.new.tutor_name ? (payload.new as ConversationRecord) : item,
                );
              }
              return [payload.new as ConversationRecord, ...current];
            });
            return;
          }

          if (payload.eventType === "UPDATE") {
            setConversations((current) =>
              current.map((item) => (item.tutor_name === payload.new.tutor_name ? (payload.new as ConversationRecord) : item)),
            );
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(messagesChannel);
      void supabase.removeChannel(conversationsChannel);
    };
  }, [user]);

  const conversationItems = useMemo<ConversationListItem[]>(() => {
    const contactMap = new Map<string, BookingContactRecord>();

    contacts.forEach((contact) => {
      if (!contactMap.has(contact.tutor_name)) {
        contactMap.set(contact.tutor_name, contact);
      }
    });

    const conversationMap = new Map<string, ConversationListItem>();

    contactMap.forEach((contact, tutorName) => {
      const conversation = conversations.find((item) => item.tutor_name === tutorName);
      const relatedMessages = messages.filter((item) => item.tutor_name === tutorName);
      const latestMessage = relatedMessages[relatedMessages.length - 1];
      const unread = relatedMessages.filter((item) => item.sender_type === "tutor" && !item.read_at).length;

      if (conversation?.deleted_by_student) return;

      conversationMap.set(tutorName, {
        id: tutorName,
        name: tutorName,
        avatar_url: contact.tutor_avatar_url,
        subject: contact.subject,
        lastMessage: latestMessage?.content || latestMessage?.attachment_name || t("msg.noMessages"),
        unread,
        archived: conversation?.archived_by_student ?? false,
        updatedAt: conversation?.updated_at ?? latestMessage?.created_at ?? contact.created_at,
      });
    });

    conversations.forEach((conversation) => {
      if (conversation.deleted_by_student || conversationMap.has(conversation.tutor_name)) return;
      const relatedMessages = messages.filter((item) => item.tutor_name === conversation.tutor_name);
      const latestMessage = relatedMessages[relatedMessages.length - 1];
      const unread = relatedMessages.filter((item) => item.sender_type === "tutor" && !item.read_at).length;

      conversationMap.set(conversation.tutor_name, {
        id: conversation.tutor_name,
        name: conversation.tutor_name,
        avatar_url: null,
        subject: "",
        lastMessage: latestMessage?.content || latestMessage?.attachment_name || t("msg.noMessages"),
        unread,
        archived: conversation.archived_by_student,
        updatedAt: conversation.updated_at ?? latestMessage?.created_at ?? new Date().toISOString(),
      });
    });

    return Array.from(conversationMap.values())
      .filter((item) => {
        if (msgFilter === "unread") return item.unread > 0 && !item.archived;
        if (msgFilter === "archived") return item.archived;
        return !item.archived;
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [contacts, conversations, messages, msgFilter, t]);

  useEffect(() => {
    if (!selectedTutorName && conversationItems.length > 0) {
      setSelectedTutorName(conversationItems[0].name);
      return;
    }

    if (selectedTutorName && !conversationItems.some((item) => item.name === selectedTutorName)) {
      setSelectedTutorName(conversationItems[0]?.name ?? null);
    }
  }, [conversationItems, selectedTutorName]);

  const selectedConversation = useMemo(
    () => conversationItems.find((item) => item.name === selectedTutorName) ?? null,
    [conversationItems, selectedTutorName],
  );

  const selectedMessages = useMemo(
    () => messages.filter((item) => item.tutor_name === selectedTutorName),
    [messages, selectedTutorName],
  );

  useEffect(() => {
    if (!user || !selectedTutorName) return;

    const unreadTutorMessages = selectedMessages.filter((item) => item.sender_type === "tutor" && !item.read_at);
    if (unreadTutorMessages.length === 0) return;

    const markAsRead = async () => {
      const ids = unreadTutorMessages.map((item) => item.id);
      const now = new Date().toISOString();
      const { error } = await supabase.from("messages").update({ read_at: now }).in("id", ids);
      if (!error) {
        setMessages((current) => current.map((item) => (ids.includes(item.id) ? { ...item, read_at: now } : item)));
      }
    };

    void markAsRead();
  }, [selectedMessages, selectedTutorName, user]);

  const ensureConversation = async (tutorName: string, archived = false) => {
    if (!user) return false;

    const { error } = await supabase.from("message_conversations").upsert(
      {
        student_id: user.id,
        tutor_name: tutorName,
        archived_by_student: archived,
        deleted_by_student: false,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "student_id,tutor_name" },
    );

    return !error;
  };

  const uploadAttachment = async () => {
    if (!attachedFile || !user || !selectedTutorName) return null;

    if (attachedFile.size > 10 * 1024 * 1024) {
      toast({ title: t("msg.attachmentTooLarge"), variant: "destructive" });
      return null;
    }

    const filePath = `${user.id}/${selectedTutorName}/${Date.now()}-${sanitizeFileName(attachedFile.name)}`;
    const { error } = await supabase.storage.from("message-attachments").upload(filePath, attachedFile, {
      upsert: false,
      contentType: attachedFile.type || undefined,
    });

    if (error) {
      toast({ title: t("msg.attachmentFailed"), variant: "destructive" });
      return null;
    }

    const { data } = supabase.storage.from("message-attachments").getPublicUrl(filePath);

    return {
      attachment_url: data.publicUrl,
      attachment_name: attachedFile.name,
      attachment_type: attachedFile.type || null,
      attachment_size: attachedFile.size,
    };
  };

  const handleSend = async () => {
    if (!user || !selectedTutorName || sending) return;
    if (!message.trim() && !attachedFile) {
      toast({ title: t("msg.emptyComposer"), variant: "destructive" });
      return;
    }

    setSending(true);

    try {
      const attachment = await uploadAttachment();
      if (attachedFile && !attachment) {
        setSending(false);
        return;
      }

      const conversationReady = await ensureConversation(selectedTutorName, false);
      if (!conversationReady) {
        toast({ title: t("msg.messageFailed"), variant: "destructive" });
        setSending(false);
        return;
      }

      const payload = {
        student_id: user.id,
        tutor_name: selectedTutorName,
        sender_id: user.id,
        sender_type: "student",
        sender_display_name: profile?.display_name ?? user.email ?? null,
        content: message.trim() || attachment?.attachment_name || t("msg.file"),
        ...(attachment ?? {
          attachment_url: null,
          attachment_name: null,
          attachment_type: null,
          attachment_size: null,
        }),
      };

      const { error } = await supabase.from("messages").insert(payload);
      if (error) {
        toast({ title: t("msg.messageFailed"), variant: "destructive" });
        setSending(false);
        return;
      }

      setMessage("");
      setAttachedFile(null);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteConversation = async () => {
    if (!user || !pendingDelete) return;

    const { error } = await supabase.from("message_conversations").upsert(
      {
        student_id: user.id,
        tutor_name: pendingDelete.name,
        archived_by_student: false,
        deleted_by_student: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "student_id,tutor_name" },
    );

    if (error) {
      toast({ title: t("msg.deleteFailed"), variant: "destructive" });
      return;
    }

    if (selectedTutorName === pendingDelete.name) {
      setSelectedTutorName(null);
    }

    setPendingDelete(null);
    toast({ title: t("msg.deleted") });
  };

  const filters = [
    { key: "all" as const, label: t("msg.all") },
    { key: "unread" as const, label: t("msg.unread") },
    { key: "archived" as const, label: t("msg.archived") },
  ];

  return (
    <Layout hideFooter>
      <>
        <div className="flex h-[calc(100vh-8.5rem)]">
          <div className="hidden w-80 shrink-0 flex-col border-r bg-card md:flex">
            <div className="flex items-center gap-4 px-4 pb-2 pt-4">
              {filters.map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setMsgFilter(filter.key)}
                  className={`border-b-2 pb-1 text-sm font-medium transition-colors ${
                    msgFilter === filter.key
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <ConversationList
              conversations={conversationItems}
              selectedName={selectedTutorName}
              lang={lang}
              emptyLabel={t("msg.noConversations")}
              continueLabel={(name) => t("msg.continueWith").replace("{name}", name)}
              onSelect={(name) => setSelectedTutorName(name)}
              onDelete={(conversation) => setPendingDelete(conversation)}
            />
          </div>

          <div className="flex min-w-0 flex-1 flex-col">
            {selectedConversation ? (
              <>
                <div className="flex items-center justify-between border-b bg-card px-4 py-3">
                  <div>
                    <p className="font-semibold">{selectedConversation.name.split(" ")[0]}</p>
                    {selectedConversation.subject && <p className="text-xs text-muted-foreground">{selectedConversation.subject}</p>}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setShowDetails((current) => !current)}>
                    <Info className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  {showTip && (
                    <div className="mb-4 flex items-start gap-3 rounded-lg bg-accent/50 p-3">
                      <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <p className="flex-1 text-sm text-muted-foreground">{t("msg.tipReaction")}</p>
                      <button onClick={() => setShowTip(false)} className="shrink-0 text-muted-foreground hover:text-foreground">
                        ×
                      </button>
                    </div>
                  )}
                  <ChatMessages
                    messages={selectedMessages}
                    currentSenderType="student"
                    lang={lang}
                    emptyLabel={t("msg.startConversation").replace("{name}", selectedConversation.name.split(" ")[0])}
                  />
                </div>

                <ChatComposer
                  message={message}
                  attachedFile={attachedFile}
                  sending={sending}
                  placeholder={t("msg.typePlaceholder")}
                  sendLabel={t("msg.send")}
                  attachLabel={t("msg.attach")}
                  emojiLabel={t("msg.emoji")}
                  removeAttachmentLabel={t("msg.removeAttachment")}
                  onMessageChange={setMessage}
                  onSend={() => void handleSend()}
                  onEmojiSelect={(emoji) => setMessage((current) => `${current}${emoji}`)}
                  onFileSelect={setAttachedFile}
                  onRemoveAttachment={() => setAttachedFile(null)}
                />
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center text-muted-foreground">{t("msg.selectTutor")}</div>
            )}
          </div>

          {selectedConversation && showDetails && (
            <ConversationDetails
              name={selectedConversation.name}
              avatarUrl={selectedConversation.avatar_url}
              subject={selectedConversation.subject}
              detailsLabel={t("msg.details")}
              enterClassroomLabel={t("msg.enterClassroom")}
            />
          )}
        </div>

        <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("msg.deleteConversation")}</AlertDialogTitle>
              <AlertDialogDescription>{t("msg.deleteConversationDesc")}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("msg.cancel")}</AlertDialogCancel>
              <AlertDialogAction onClick={() => void handleDeleteConversation()}>{t("msg.delete")}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    </Layout>
  );
}
