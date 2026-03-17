import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";

const chatContent = {
  title: "Support Chat",
  placeholder: "Type your message...",
  greeting: "Hi! 👋 How can we help you today? Choose a question below or type your own.",
  quickQuestions: [
    "How do I book a lesson?",
    "What payment methods?",
    "How do I find a tutor?",
    "Can I get a refund?",
  ],
  escalateLabel: "Talk to a human",
  escalateMsg: "For personalized help, email us at support@learneazy.ge — we reply within 2 hours!",
  typing: "Typing",
  defaultReply: "Thanks for your message! For the best assistance, please email us at support@learneazy.ge or choose one of the quick questions above. We're happy to help! 😊",
} as const;

const faqAnswers: Record<string, string> = {
  "How do I book a lesson?": "Go to the tutor's profile, pick a time slot, and click 'Book Trial Lesson'. After booking, we'll send you payment details (IBAN) via email.",
  "What payment methods?": "After you book a lesson, we'll send you our IBAN details via email or chat. All prices are in Georgian Lari (₾). You can also message us here for payment info!",
  "How do I find a tutor?": "Click 'Find Tutors' in the menu to browse tutors by subject, price, rating, and availability. You can also use the search bar!",
  "Can I get a refund?": "Yes! If you're not satisfied, request a refund within 24 hours of your lesson. Our team will review it promptly.",
};

function TypingIndicator({ label }: { label: string }) {
  return (
    <div className="flex max-w-[85%] items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="flex gap-0.5">
        {[0, 1, 2].map((index) => (
          <motion.span
            key={index}
            className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: index * 0.15 }}
          />
        ))}
      </span>
    </div>
  );
}

export function SupportChatWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{ text: string; fromUser: boolean }[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const simulateReply = (userMessage: string) => {
    setIsTyping(true);
    const answer = faqAnswers[userMessage] || chatContent.defaultReply;

    setTimeout(() => {
      setIsTyping(false);
      setMessages((previous) => [...previous, { text: answer, fromUser: false }]);
    }, 1200);
  };

  const handleSend = () => {
    if (!message.trim()) return;

    const nextMessage = message.trim();
    setMessages((previous) => [...previous, { text: nextMessage, fromUser: true }]);
    setMessage("");
    simulateReply(nextMessage);
  };

  const handleQuickQuestion = (question: string) => {
    setMessages((previous) => [...previous, { text: question, fromUser: true }]);
    simulateReply(question);
  };

  const handleEscalate = () => {
    setMessages((previous) => [...previous, { text: chatContent.escalateLabel, fromUser: true }]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages((previous) => [...previous, { text: chatContent.escalateMsg, fromUser: false }]);
    }, 800);
  };

  const showQuickQuestions = messages.length === 0;

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-20 right-4 z-50 w-80 overflow-hidden rounded-xl border bg-card shadow-lg"
          >
            <div className="hero-gradient flex items-center justify-between px-4 py-3">
              <span className="text-sm font-semibold text-primary-foreground">{chatContent.title}</span>
              <button onClick={() => setOpen(false)}>
                <X className="h-4 w-4 text-primary-foreground" />
              </button>
            </div>

            <div ref={scrollRef} className="h-64 space-y-2 overflow-y-auto p-3">
              <div className="max-w-[85%] rounded-lg bg-muted px-3 py-2 text-sm">
                {chatContent.greeting}
              </div>

              {showQuickQuestions && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {chatContent.quickQuestions.map((question) => (
                    <button
                      key={question}
                      onClick={() => handleQuickQuestion(question)}
                      className="rounded-full bg-primary/10 px-3 py-1.5 text-left text-xs text-primary transition-colors hover:bg-primary/20"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              )}

              {messages.map((entry, index) => (
                <div
                  key={`${entry.text}-${index}`}
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                    entry.fromUser ? "ml-auto bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  {entry.text}
                </div>
              ))}

              {isTyping ? <TypingIndicator label={chatContent.typing} /> : null}
            </div>

            <div className="border-t">
              <button
                onClick={handleEscalate}
                className="flex w-full items-center justify-center gap-2 px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted/50 hover:text-primary"
              >
                <Mail className="h-3.5 w-3.5" />
                {chatContent.escalateLabel} — support@learneazy.ge
              </button>
              <div className="flex gap-2 border-t p-2">
                <input
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && handleSend()}
                  placeholder={chatContent.placeholder}
                  className="flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground"
                />
                <Button size="icon" variant="ghost" onClick={handleSend} className="h-8 w-8 text-primary">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="hero-gradient fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg"
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
