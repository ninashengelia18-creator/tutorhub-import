import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Globe, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

type Language = "en" | "ka" | "ru";

const translations: Record<Language, {
  title: string;
  placeholder: string;
  greeting: string;
  quickQuestions: string[];
  escalateLabel: string;
  escalateMsg: string;
  typing: string;
}> = {
  en: {
    title: "Support Chat",
    placeholder: "Type your message...",
    greeting: "Hi! 👋 How can we help you today? Choose a question below or type your own.",
    quickQuestions: [
      "How do I book a lesson?",
      "What payment methods?",
      "How does AI Practice work?",
      "Can I get a refund?",
    ],
    escalateLabel: "Talk to a human",
    escalateMsg: "For personalized help, email us at support@tutorhub.ge — we reply within 2 hours!",
    typing: "Typing",
  },
  ka: {
    title: "მხარდაჭერა",
    placeholder: "შეიყვანეთ შეტყობინება...",
    greeting: "გამარჯობა! 👋 როგორ შეგვიძლია დაგეხმაროთ? აირჩიეთ კითხვა ან დაწერეთ თქვენი.",
    quickQuestions: [
      "როგორ დავჯავშნო გაკვეთილი?",
      "რა გადახდის მეთოდებია?",
      "როგორ მუშაობს AI პრაქტიკა?",
      "შემიძლია თანხის დაბრუნება?",
    ],
    escalateLabel: "ადამიანთან საუბარი",
    escalateMsg: "პერსონალიზებული დახმარებისთვის მოგვწერეთ support@tutorhub.ge — ვპასუხობთ 2 საათში!",
    typing: "წერს",
  },
  ru: {
    title: "Поддержка",
    placeholder: "Введите сообщение...",
    greeting: "Привет! 👋 Как мы можем вам помочь? Выберите вопрос или напишите свой.",
    quickQuestions: [
      "Как забронировать урок?",
      "Какие способы оплаты?",
      "Как работает AI практика?",
      "Могу ли я вернуть деньги?",
    ],
    escalateLabel: "Связаться с человеком",
    escalateMsg: "Для персональной помощи напишите нам на support@tutorhub.ge — ответим в течение 2 часов!",
    typing: "Печатает",
  },
};

const faqAnswers: Record<Language, Record<string, string>> = {
  en: {
    "How do I book a lesson?": "Go to the tutor's profile, pick a time slot, and click 'Book Trial Lesson'. You can pay with TBC PayGe or BOG Pay.",
    "What payment methods?": "We accept TBC PayGe and Bank of Georgia (BOG) Pay. All prices are in Georgian Lari (₾).",
    "How does AI Practice work?": "AI Practice gives you daily exercises tailored to your learning goals, plus scenario-based conversations for real-world practice.",
    "Can I get a refund?": "Yes! If you're not satisfied, request a refund within 24 hours of your lesson. Our team will review it promptly.",
  },
  ka: {
    "როგორ დავჯავშნო გაკვეთილი?": "გადადით რეპეტიტორის პროფილზე, აირჩიეთ დრო და დააჭირეთ 'საცდელი გაკვეთილის დაჯავშნას'. გადაიხადეთ TBC PayGe ან BOG Pay-ით.",
    "რა გადახდის მეთოდებია?": "ვიღებთ TBC PayGe და საქართველოს ბანკის (BOG) Pay გადახდებს. ყველა ფასი ქართულ ლარშია (₾).",
    "როგორ მუშაობს AI პრაქტიკა?": "AI პრაქტიკა გთავაზობთ ყოველდღიურ სავარჯიშოებს და სცენარზე დაფუძნებულ საუბრებს რეალური პრაქტიკისთვის.",
    "შემიძლია თანხის დაბრუნება?": "დიახ! თუ კმაყოფილი არ ხართ, მოითხოვეთ თანხის დაბრუნება გაკვეთილიდან 24 საათში.",
  },
  ru: {
    "Как забронировать урок?": "Перейдите в профиль репетитора, выберите время и нажмите 'Забронировать пробный урок'. Оплата через TBC PayGe или BOG Pay.",
    "Какие способы оплаты?": "Мы принимаем TBC PayGe и Bank of Georgia (BOG) Pay. Все цены указаны в грузинских лари (₾).",
    "Как работает AI практика?": "AI практика предлагает ежедневные упражнения и сценарные разговоры для практики в реальных ситуациях.",
    "Могу ли я вернуть деньги?": "Да! Если вы недовольны, запросите возврат в течение 24 часов после урока.",
  },
};

const langLabels: Record<Language, string> = { en: "EN", ka: "KA", ru: "RU" };

function TypingIndicator({ label }: { label: string }) {
  return (
    <div className="bg-muted rounded-lg px-3 py-2 text-sm max-w-[85%] flex items-center gap-2">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="flex gap-0.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </span>
    </div>
  );
}

export function SupportChatWidget() {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<Language>("en");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{ text: string; fromUser: boolean }[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const t = translations[lang];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const simulateReply = (userMsg: string) => {
    setIsTyping(true);
    const answers = faqAnswers[lang];
    const answer = answers[userMsg] || t.greeting;
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [...prev, { text: answer, fromUser: false }]);
    }, 1200);
  };

  const handleSend = () => {
    if (!message.trim()) return;
    const msg = message.trim();
    setMessages((prev) => [...prev, { text: msg, fromUser: true }]);
    setMessage("");
    simulateReply(msg);
  };

  const handleQuickQuestion = (q: string) => {
    setMessages((prev) => [...prev, { text: q, fromUser: true }]);
    simulateReply(q);
  };

  const handleEscalate = () => {
    setMessages((prev) => [...prev, { text: t.escalateLabel, fromUser: true }]);
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [...prev, { text: t.escalateMsg, fromUser: false }]);
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
            <div ref={scrollRef} className="h-64 overflow-y-auto p-3 space-y-2">
              <div className="bg-muted rounded-lg px-3 py-2 text-sm max-w-[85%]">
                {t.greeting}
              </div>

              {/* Quick question chips */}
              {showQuickQuestions && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {t.quickQuestions.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleQuickQuestion(q)}
                      className="text-xs bg-primary/10 text-primary rounded-full px-3 py-1.5 hover:bg-primary/20 transition-colors text-left"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

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

              {isTyping && <TypingIndicator label={t.typing} />}
            </div>

            {/* Escalation + Input */}
            <div className="border-t">
              <button
                onClick={handleEscalate}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors"
              >
                <Mail className="h-3.5 w-3.5" />
                {t.escalateLabel} — support@tutorhub.ge
              </button>
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
