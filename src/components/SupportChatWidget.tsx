import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

type ChatLang = "en" | "ka" | "ru";

const chatTranslations: Record<ChatLang, {
  title: string;
  placeholder: string;
  greeting: string;
  quickQuestions: string[];
  escalateLabel: string;
  escalateMsg: string;
  typing: string;
  defaultReply: string;
}> = {
  en: {
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
  },
  ka: {
    title: "მხარდაჭერა",
    placeholder: "შეიყვანეთ შეტყობინება...",
    greeting: "გამარჯობა! 👋 როგორ შეგვიძლია დაგეხმაროთ? აირჩიეთ კითხვა ან დაწერეთ თქვენი.",
    quickQuestions: [
      "როგორ დავჯავშნო გაკვეთილი?",
      "რა გადახდის მეთოდებია?",
      "როგორ ვიპოვო რეპეტიტორი?",
      "შემიძლია თანხის დაბრუნება?",
    ],
    escalateLabel: "ადამიანთან საუბარი",
    escalateMsg: "პერსონალიზებული დახმარებისთვის მოგვწერეთ support@learneazy.ge — ვპასუხობთ 2 საათში!",
    typing: "წერს",
    defaultReply: "მადლობა შეტყობინებისთვის! საუკეთესო დახმარებისთვის მოგვწერეთ support@learneazy.ge ან აირჩიეთ ერთ-ერთი სწრაფი კითხვა. სიამოვნებით დაგეხმარებით! 😊",
  },
  ru: {
    title: "Поддержка",
    placeholder: "Введите сообщение...",
    greeting: "Привет! 👋 Как мы можем вам помочь? Выберите вопрос или напишите свой.",
    quickQuestions: [
      "Как забронировать урок?",
      "Какие способы оплаты?",
      "Как найти репетитора?",
      "Могу ли я вернуть деньги?",
    ],
    escalateLabel: "Связаться с человеком",
    escalateMsg: "Для персональной помощи напишите нам на support@learneazy.ge — ответим в течение 2 часов!",
    typing: "Печатает",
    defaultReply: "Спасибо за сообщение! Для лучшей помощи напишите нам на support@learneazy.ge или выберите один из быстрых вопросов. Будем рады помочь! 😊",
  },
};

const faqAnswers: Record<ChatLang, Record<string, string>> = {
  en: {
    "How do I book a lesson?": "Go to the tutor's profile, pick a time slot, and click 'Book Trial Lesson'. After booking, we'll send you payment details (IBAN) via email.",
    "What payment methods?": "After you book a lesson, we'll send you our IBAN details via email or chat. All prices are in Georgian Lari (₾). You can also message us here for payment info!",
    "How do I find a tutor?": "Click 'Find Tutors' in the menu to browse tutors by subject, price, rating, and availability. You can also use the search bar!",
    "Can I get a refund?": "Yes! If you're not satisfied, request a refund within 24 hours of your lesson. Our team will review it promptly.",
  },
  ka: {
    "როგორ დავჯავშნო გაკვეთილი?": "გადადით რეპეტიტორის პროფილზე, აირჩიეთ დრო და დააჭირეთ 'საცდელი გაკვეთილის დაჯავშნას'. დაჯავშნის შემდეგ გამოგიგზავნით გადახდის დეტალებს (IBAN) ელ-ფოსტით.",
    "რა გადახდის მეთოდებია?": "გაკვეთილის დაჯავშნის შემდეგ გამოგიგზავნით IBAN დეტალებს ელ-ფოსტით ან ჩატით. ყველა ფასი ქართულ ლარშია (₾). ასევე შეგიძლიათ აქვე მოგვწეროთ გადახდის ინფორმაციისთვის!",
    "როგორ ვიპოვო რეპეტიტორი?": "დააჭირეთ 'რეპეტიტორები' მენიუში და მოძებნეთ საგნის, ფასის, რეიტინგისა და ხელმისაწვდომობის მიხედვით. შეგიძლიათ საძიებო ზოლიც გამოიყენოთ!",
    "შემიძლია თანხის დაბრუნება?": "დიახ! თუ კმაყოფილი არ ხართ, მოითხოვეთ თანხის დაბრუნება გაკვეთილიდან 24 საათში.",
  },
  ru: {
    "Как забронировать урок?": "Перейдите в профиль репетитора, выберите время и нажмите 'Забронировать пробный урок'. После бронирования мы отправим вам реквизиты (IBAN) по email.",
    "Какие способы оплаты?": "После бронирования мы отправим вам реквизиты (IBAN) по электронной почте или в чате. Все цены в грузинских лари (₾). Напишите нам здесь для получения информации об оплате!",
    "Как найти репетитора?": "Нажмите 'Репетиторы' в меню и ищите по предмету, цене, рейтингу и доступности. Также можете использовать строку поиска!",
    "Могу ли я вернуть деньги?": "Да! Если вы недовольны, запросите возврат в течение 24 часов после урока.",
  },
};

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
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{ text: string; fromUser: boolean }[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { lang } = useLanguage();

  const chatLang = lang as ChatLang;
  const t = chatTranslations[chatLang];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Reset messages when language changes
  useEffect(() => {
    setMessages([]);
  }, [lang]);

  const simulateReply = (userMsg: string) => {
    setIsTyping(true);
    const answers = faqAnswers[chatLang];
    const answer = answers[userMsg] || t.defaultReply;
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
              <button onClick={() => setOpen(false)}>
                <X className="h-4 w-4 text-primary-foreground" />
              </button>
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
                {t.escalateLabel} — support@learneazy.ge
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
