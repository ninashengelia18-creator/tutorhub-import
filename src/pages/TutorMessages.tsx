import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Info, MessageSquare, Search } from "lucide-react";

import { Layout } from "@/components/Layout";
import { ChatComposer } from "@/components/messages/ChatComposer";
import { ChatMessages } from "@/components/messages/ChatMessages";
import { ConversationList } from "@/components/messages/ConversationList";
import type {
  BookingContactRecord,
  ConversationListItem,
  ConversationRecord,
  MessageFilter,
  MessageRecord,
} from "@/components/messages/types";
import { sanitizeFileName } from "@/components/messages/utils";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

export default function TutorMessages() {
  const { user, profile } = useAuth();
  const { t, lang } = useLanguage();
  const { toast } = useToast();
  const tutorName = profile?.display_name?.trim() ?? "";

  const [contacts, setContacts] = useState<BookingContactRecord[]>([]);
  const [conversations, setConversations] = useState<ConversationRecord[]>([]);
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [msgFilter, setMsgFilter] = useState<MessageFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [showTip, setShowTip] = useState(true);
  const [sending, setSending] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<ConversationListItem | null>(null);

  useEffect(() => {
    if (!user || !tutorName) return;

    const loadData = async () => {
      const [{ data: bookingsData }, { data: conversationsData }, { data: messagesData }] = await Promise.all([
        supabase
          .from("bookings")
          .select("student_id, student_name, subject, created_at")
          .eq("tutor_name", tutorName)
          .order("created_at", { ascending: false }),
        supabase
          .from("message_conversations")
          .select("student_id, tutor_name, archived_by_tutor, deleted_by_tutor, updated_at")
          .eq("tutor_name", tutorName)
          .order("updated_at", { ascending: false }),
        supabase
          .from("messages")
          .select("id, student_id, tutor_name, content, created_at, sender_type, sender_display_name, read_at, attachment_url, attachment_name, attachment_type, attachment_size")
          .eq("tutor_name", tutorName)
          .order("created_at", { ascending: true }),
      ]);

      setContacts((bookingsData as BookingContactRecord[] | null) ?? []);
      setConversations((conversationsData as ConversationRecord[] | null) ?? []);
      setMessages((messagesData as MessageRecord[] | null) ?? []);
    };

    void loadData();

    const messagesChannel = supabase
      .channel(`messages-tutor-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages", filter: `tutor_name=eq.${tutorName}` },
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
      .channel(`message-conversations-tutor-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "message_conversations", filter: `tutor_name=eq.${tutorName}` },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setConversations((current) => {
              const nextConversation = payload.new as ConversationRecord;
              const exists = current.some((item) => item.student_id === nextConversation.student_id);
              if (exists) {
                return current.map((item) => (item.student_id === nextConversation.student_id ? nextConversation : item));
              }
              return [nextConversation, ...current];
            });
            return;
          }

          if (payload.eventType === "UPDATE") {
            setConversations((current) =>
              current.map((item) => ((item.student_id === (payload.new as ConversationRecord).student_id) ? (payload.new as ConversationRecord) : item)),
            );
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(messagesChannel);
      void supabase.removeChannel(conversationsChannel);
    };
  }, [tutorName, user]);

  const conversationItems = useMemo<ConversationListItem[]>(() => {
    const contactMap = new Map<string, BookingContactRecord>();

    contacts.forEach((contact) => {
      if (contact.student_id && !contactMap.has(contact.student_id)) {
        contactMap.set(contact.student_id, contact);
      }
    });

    const conversationMap = new Map<string, ConversationListItem>();

    contactMap.forEach((contact, studentId) => {
      const conversation = conversations.find((item) => item.student_id === studentId);
      const relatedMessages = messages.filter((item) => item.student_id === studentId);
      const latestMessage = relatedMessages[relatedMessages.length - 1];
      const unread = relatedMessages.filter((item) => item.sender_type === "student" && !item.read_at).length;

      if (conversation?.deleted_by_tutor) return;

      conversationMap.set(studentId, {
        id: studentId,
        name: contact.student_name?.trim() || latestMessage?.sender_display_name || "Student",
        avatar_url: null,
        subject: contact.subject,
        lastMessage: latestMessage?.content || latestMessage?.attachment_name || "No messages yet",
        unread,
        archived: conversation?.archived_by_tutor ?? false,
        updatedAt: conversation?.updated_at ?? latestMessage?.created_at ?? contact.created_at,
      });
    });

    conversations.forEach((conversation) => {
      if (conversation.deleted_by_tutor || conversationMap.has(conversation.student_id)) return;
      const relatedMessages = messages.filter((item) => item.student_id === conversation.student_id);
      const latestMessage = relatedMessages[relatedMessages.length - 1];
      const unread = relatedMessages.filter((item) => item.sender_type === "student" && !item.read_at).length;

      conversationMap.set(conversation.student_id, {
        id: conversation.student_id,
        name: latestMessage?.sender_display_name || "Student",
        avatar_url: null,
        subject: "",
        lastMessage: latestMessage?.content || latestMessage?.attachment_name || "No messages yet",
        unread,
        archived: conversation.archived_by_tutor ?? false,
        updatedAt: conversation.updated_at ?? latestMessage?.created_at ?? new Date().toISOString(),
      });
    });

    const normalizedQuery = searchQuery.trim().toLowerCase();

    return Array.from(conversationMap.values())
      .filter((item) => {
        if (msgFilter === "unread" && (item.unread === 0 || item.archived)) return false;
        if (msgFilter === "archived" && !item.archived) return false;
        if (msgFilter === "all" && item.archived) return false;
        if (subjectFilter !== "all" && item.subject !== subjectFilter) return false;
        if (normalizedQuery && !item.name.toLowerCase().includes(normalizedQuery)) return false;
        return true;
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [contacts, conversations, messages, msgFilter, searchQuery, subjectFilter]);

  useEffect(() => {
    if (!selectedStudentId && conversationItems.length > 0) {
      setSelectedStudentId(conversationItems[0].id);
      return;
    }

    if (selectedStudentId && !conversationItems.some((item) => item.id === selectedStudentId)) {
      setSelectedStudentId(conversationItems[0]?.id ?? null);
    }
  }, [conversationItems, selectedStudentId]);

  const selectedConversation = useMemo(
    () => conversationItems.find((item) => item.id === selectedStudentId) ?? null,
    [conversationItems, selectedStudentId],
  );

  const selectedMessages = useMemo(
    () => messages.filter((item) => item.student_id === selectedStudentId),
    [messages, selectedStudentId],
  );

  useEffect(() => {
    if (!user || !selectedStudentId) return;

    const unreadStudentMessages = selectedMessages.filter((item) => item.sender_type === "student" && !item.read_at);
    if (unreadStudentMessages.length === 0) return;

    const markAsRead = async () => {
      const ids = unreadStudentMessages.map((item) => item.id);
      const now = new Date().toISOString();
      const { error } = await supabase.from("messages").update({ read_at: now }).in("id", ids);
      if (!error) {
        setMessages((current) => current.map((item) => (ids.includes(item.id) ? { ...item, read_at: now } : item)));
      }
    };

    void markAsRead();
  }, [selectedMessages, selectedStudentId, user]);

  const ensureConversation = async (studentId: string, archived = false) => {
    if (!user || !tutorName) return false;

    const { error } = await supabase.from("message_conversations").upsert(
      {
        student_id: studentId,
        tutor_name: tutorName,
        archived_by_tutor: archived,
        deleted_by_tutor: false,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "student_id,tutor_name" },
    );

    return !error;
  };

  const uploadAttachment = async () => {
    if (!attachedFile || !user || !selectedStudentId) return null;

    if (attachedFile.size > 10 * 1024 * 1024) {
      toast({ title: t("msg.attachmentTooLarge"), variant: "destructive" });
      return null;
    }

    const filePath = `${user.id}/${selectedStudentId}/${Date.now()}-${sanitizeFileName(attachedFile.name)}`;
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
    if (!user || !selectedStudentId || !tutorName || sending) return;
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

      const conversationReady = await ensureConversation(selectedStudentId, false);
      if (!conversationReady) {
        toast({ title: t("msg.messageFailed"), variant: "destructive" });
        setSending(false);
        return;
      }

      const payload = {
        student_id: selectedStudentId,
        tutor_name: tutorName,
        sender_id: user.id,
        sender_type: "tutor",
        sender_display_name: tutorName,
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
    if (!user || !pendingDelete || !tutorName) return;

    const { error } = await supabase.from("message_conversations").upsert(
      {
        student_id: pendingDelete.id,
        tutor_name: tutorName,
        archived_by_tutor: false,
        deleted_by_tutor: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "student_id,tutor_name" },
    );

    if (error) {
      toast({ title: t("msg.deleteFailed"), variant: "destructive" });
      return;
    }

    if (selectedStudentId === pendingDelete.id) {
      setSelectedStudentId(null);
    }

    setPendingDelete(null);
    toast({ title: t("msg.deleted") });
  };

  const filters = [
    { key: "all" as const, label: t("msg.all") },
    { key: "unread" as const, label: t("msg.unread") },
    { key: "archived" as const, label: t("msg.archived") },
  ];

  if (!tutorName) {
    return (
      <Layout hideFooter>
        <div className="container flex min-h-[calc(100vh-10rem)] items-center justify-center py-10">
          <div className="max-w-md rounded-[2rem] border border-border bg-card p-8 text-center shadow-sm">
            <MessageSquare className="mx-auto mb-4 h-12 w-12 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Set up your tutor profile first</h1>
            <p className="mt-3 text-sm text-muted-foreground">Add your tutor display name so your separate tutor inbox can sync with student conversations.</p>
            <Button className="mt-6 rounded-full px-6" asChild>
              <Link to="/tutor-settings">Open tutor settings</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout hideFooter>
      <>
        <div className="flex h-[calc(100vh-8.5rem)]">
          <div className="hidden w-80 shrink-0 flex-col border-r bg-card md:flex">
            <div className="border-b border-border px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Tutor inbox</p>
              <h1 className="mt-2 text-xl font-semibold text-foreground">Student messages</h1>
            </div>

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
              selectedId={selectedStudentId}
              lang={lang}
              emptyLabel="No student conversations yet"
              continueLabel={(name) => `Continue with ${name}`}
              onSelect={setSelectedStudentId}
              onDelete={(conversation) => setPendingDelete(conversation)}
            />
          </div>

          <div className="flex min-w-0 flex-1 flex-col">
            {selectedConversation ? (
              <>
                <div className="flex items-center justify-between border-b bg-card px-4 py-3">
                  <div>
                    <p className="font-semibold">{selectedConversation.name}</p>
                    {selectedConversation.subject ? <p className="text-xs text-muted-foreground">{selectedConversation.subject}</p> : null}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  {showTip ? (
                    <div className="mb-4 flex items-start gap-3 rounded-lg bg-accent/50 p-3">
                      <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <p className="flex-1 text-sm text-muted-foreground">Reply before lessons start, share files, and keep students aligned on homework or schedule changes.</p>
                      <button onClick={() => setShowTip(false)} className="shrink-0 text-muted-foreground hover:text-foreground">
                        ×
                      </button>
                    </div>
                  ) : null}

                  <ChatMessages
                    messages={selectedMessages}
                    currentSenderType="tutor"
                    lang={lang}
                    emptyLabel={`Start the conversation with ${selectedConversation.name.split(" ")[0]}`}
                  />
                </div>

                <ChatComposer
                  message={message}
                  attachedFile={attachedFile}
                  sending={sending}
                  placeholder="Message your student"
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
              <div className="flex flex-1 items-center justify-center text-muted-foreground">Select a student conversation</div>
            )}
          </div>
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