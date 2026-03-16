import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Send, Paperclip, Smile, Mic, Star, Monitor, Clock, MoreHorizontal, X, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { SubscribePlansDialog } from "@/components/SubscribePlansDialog";
import { useLanguage } from "@/contexts/LanguageContext";

interface TutorContact {
  name: string;
  avatar_url: string | null;
  subject: string;
  lastMessage: string;
  time: string;
  unread: number;
}

export default function Messages() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [contacts, setContacts] = useState<TutorContact[]>([]);
  const [selectedContact, setSelectedContact] = useState<TutorContact | null>(null);
  const [message, setMessage] = useState("");
  const [msgFilter, setMsgFilter] = useState<"all" | "unread" | "archived">("all");
  const [showDetails, setShowDetails] = useState(true);
  const [showTip, setShowTip] = useState(true);

  useEffect(() => {
    async function loadContacts() {
      const { data } = await supabase
        .from("bookings")
        .select("tutor_name, tutor_avatar_url, subject")
        .order("created_at", { ascending: false });

      if (data) {
        const unique = new Map<string, TutorContact>();
        data.forEach(b => {
          if (!unique.has(b.tutor_name)) {
            unique.set(b.tutor_name, {
              name: b.tutor_name,
              avatar_url: b.tutor_avatar_url,
              subject: b.subject,
              lastMessage: t("msg.noMessages"),
              time: "",
              unread: 0,
            });
          }
        });
        const list = Array.from(unique.values());
        setContacts(list);
      }
    }
    loadContacts();
  }, []);

  const filters = [
    { key: "all" as const, label: t("msg.all") },
    { key: "unread" as const, label: t("msg.unread") },
    { key: "archived" as const, label: t("msg.archived") },
  ];

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("");

  return (
    <Layout hideFooter>
      <div className="flex h-[calc(100vh-8.5rem)]">
        {/* Left: Contacts List */}
        <div className="w-80 border-r bg-card hidden md:flex flex-col shrink-0">
          {/* Filter tabs */}
          <div className="flex items-center gap-4 px-4 pt-4 pb-2">
            {filters.map(f => (
              <button
                key={f.key}
                onClick={() => setMsgFilter(f.key)}
                className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
                  msgFilter === f.key
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Contact list */}
          <div className="flex-1 overflow-y-auto">
            {contacts.length === 0 && (
              <p className="text-sm text-muted-foreground p-4">{t("msg.noConversations")}</p>
            )}
            {contacts.map((contact) => (
              <button
                key={contact.name}
                onClick={() => setSelectedContact(contact)}
                className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors border-b hover:bg-muted/50 ${
                  selectedContact?.name === contact.name ? "bg-muted/50" : ""
                }`}
              >
                <div className="h-10 w-10 rounded-full bg-muted overflow-hidden flex items-center justify-center text-primary text-sm font-bold shrink-0">
                  {contact.avatar_url ? (
                    <img src={contact.avatar_url} alt={contact.name} className="h-full w-full object-cover" />
                  ) : (
                    getInitials(contact.name)
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold truncate">{contact.name}</p>
                    <button className="text-muted-foreground hover:text-foreground shrink-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{contact.lastMessage}</p>
                  <p className="text-xs text-primary mt-0.5">{t("msg.continueWith").replace("{name}", contact.name.split(" ")[0])}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Center: Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {selectedContact ? (
            <>
              {/* Chat header */}
              <div className="border-b px-4 py-3 flex items-center justify-between bg-card">
                <p className="font-semibold">{selectedContact.name.split(" ")[0]}</p>
                <Button variant="ghost" size="icon" onClick={() => setShowDetails(!showDetails)}>
                  <Info className="h-4 w-4" />
                </Button>
              </div>

              {/* Chat messages */}
              <div className="flex-1 overflow-y-auto p-4">
                {showTip && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-accent/50 rounded-lg p-3 flex items-start gap-3 mb-4"
                  >
                    <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground flex-1">
                      {t("msg.tipReaction")}
                    </p>
                    <button onClick={() => setShowTip(false)} className="text-muted-foreground hover:text-foreground shrink-0">
                      <X className="h-4 w-4" />
                    </button>
                  </motion.div>
                )}
                {/* Empty chat state */}
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  {t("msg.startConversation").replace("{name}", selectedContact.name.split(" ")[0])}
                </div>
              </div>

              {/* Message input */}
              <div className="border-t p-3">
                <div className="rounded-lg border p-3">
                  <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t("msg.yourMessage")}
                    className="w-full bg-transparent outline-none text-sm mb-2"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button className="text-muted-foreground hover:text-foreground">
                        <Paperclip className="h-4 w-4" />
                      </button>
                      <button className="text-muted-foreground hover:text-foreground">
                        <Smile className="h-4 w-4" />
                      </button>
                    </div>
                    <button className="text-muted-foreground hover:text-foreground">
                      <Mic className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              {t("msg.selectTutor")}
            </div>
          )}
        </div>

        {/* Right: Details sidebar */}
        {selectedContact && showDetails && (
          <div className="w-72 border-l bg-card hidden lg:flex flex-col items-center py-6 px-4 shrink-0">
            <p className="text-sm font-medium text-muted-foreground mb-4 self-start">{t("msg.details")}</p>
            <div className="h-32 w-32 rounded-lg bg-muted overflow-hidden flex items-center justify-center mb-4">
              {selectedContact.avatar_url ? (
                <img src={selectedContact.avatar_url} alt={selectedContact.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-primary">
                  {getInitials(selectedContact.name)}
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold mb-1">{selectedContact.name}</h3>
            <div className="flex items-center gap-1 text-sm mb-4">
              <Star className="h-4 w-4 fill-foreground" />
              <span className="font-medium">5</span>
              <span className="text-muted-foreground">(0)</span>
            </div>
            <Button className="w-full hero-gradient text-primary-foreground border-0 mb-2">
              <Clock className="h-4 w-4 mr-2" />
              {t("msg.subscribe")}
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/classroom">
                <Monitor className="h-4 w-4 mr-2" />
                {t("msg.enterClassroom")}
              </Link>
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
