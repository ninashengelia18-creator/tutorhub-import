import { useState } from "react";
import { MessageCircle, X, Send, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

type Language = "en" | "ka" | "ru";

const translations: Record<Language, { title: string; placeholder: string; greeting: string }> = {
  en: {
    title: "Support Chat",
    placeholder: "Type your message...",
    greeting: "Hi! How can we help you today?",
  },
  ka: {
    title: "მხარდაჭერა",
    placeholder: "შეიყვანეთ შეტყობინება...",
    greeting: "გამარჯობა! როგორ შეგვიძლია დაგეხმაროთ?",
  },
  ru: {
    title: "Поддержка",
    placeholder: "Введите сообщение...",
    greeting: "Привет! Как мы можем вам помочь?",
  },
};

const langLabels: Record<Language, string> = { en: "EN", ka: "KA", ru: "RU" };

export function SupportChatWidget() {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<Language>("en");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{ text: string; fromUser: boolean }[]>([]);

  const t = translations[lang];

  const handleSend = () => {
    if (!message.trim()) return;
    setMessages((prev) => [...prev, { text: message, fromUser: true }]);
    setMessage("");
    // Simulate bot response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { text: t.greeting, fromUser: false },
      ]);
    }, 800);
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-20 right-4 z-50 w-80 rounded-xl border bg-card shadow-lg overflow-hidden"
          >
            {/* Header */}
            <div className="hero-gradient px-4 py-3 flex items-center justify-between">
              <span className="font-semibold text-primary-foreground text-sm">{t.title}</span>
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5 bg-background/20 rounded-md p-0.5">
                  {(Object.keys(langLabels) as Language[]).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLang(l)}
                      className={`px-1.5 py-0.5 rounded text-xs font-medium transition-colors ${
                        lang === l
                          ? "bg-background text-foreground"
                          : "text-primary-foreground/80 hover:text-primary-foreground"
                      }`}
                    >
                      {langLabels[l]}
                    </button>
                  ))}
                </div>
                <button onClick={() => setOpen(false)}>
                  <X className="h-4 w-4 text-primary-foreground" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="h-64 overflow-y-auto p-3 space-y-2">
              <div className="bg-muted rounded-lg px-3 py-2 text-sm max-w-[85%]">
                {t.greeting}
              </div>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`rounded-lg px-3 py-2 text-sm max-w-[85%] ${
                    msg.fromUser
                      ? "ml-auto bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="border-t p-2 flex gap-2">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={t.placeholder}
                className="flex-1 text-sm bg-transparent outline-none px-2 placeholder:text-muted-foreground"
              />
              <Button size="icon" variant="ghost" onClick={handleSend} className="h-8 w-8 text-primary">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full hero-gradient flex items-center justify-center shadow-lg"
      >
        {open ? (
          <X className="h-6 w-6 text-primary-foreground" />
        ) : (
          <MessageCircle className="h-6 w-6 text-primary-foreground" />
        )}
      </motion.button>
    </>
  );
}
