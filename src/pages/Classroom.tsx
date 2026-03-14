import { useState } from "react";
import { Send, FileText, Video, PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

type ChatMessage = { role: "system" | "tutor" | "student"; content: string };

const initialMessages: ChatMessage[] = [
  { role: "system", content: "Welcome to the classroom! Your lesson with Nino B. starts now." },
  { role: "tutor", content: "Hi there! Today we'll review quadratic equations. Let's start with the basics — do you remember the quadratic formula?" },
];

export default function Classroom() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [notes, setNotes] = useState("Lesson Notes\n\n- Quadratic formula: x = (-b ± √(b²-4ac)) / 2a\n- ");
  const [activeTab, setActiveTab] = useState<"chat" | "notes">("chat");
  const { t } = useLanguage();

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { role: "student" as const, content: input }]);
    setInput("");
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "tutor" as const, content: "That's a good question! Let me explain it step by step..." }]);
    }, 1000);
  };

  return (
    <Layout hideFooter>
      <div className="flex h-[calc(100vh-4rem)]">
        <div className="flex-1 flex flex-col">
          <div className="border-b px-4 py-3 flex items-center justify-between bg-card">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-md bg-primary-light flex items-center justify-center text-primary text-xs font-bold">NB</div>
              <div>
                <p className="font-semibold text-sm">Mathematics with Nino Beridze</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" /> {t("class.liveSession")}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Video className="h-4 w-4 mr-1" /> {t("class.video")}
              </Button>
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <FileText className="h-4 w-4 mr-1" /> {t("class.materials")}
              </Button>
            </div>
          </div>

          <div className="flex border-b md:hidden">
            <button onClick={() => setActiveTab("chat")} className={`flex-1 py-2 text-sm font-medium text-center border-b-2 transition-colors ${activeTab === "chat" ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>{t("class.chat")}</button>
            <button onClick={() => setActiveTab("notes")} className={`flex-1 py-2 text-sm font-medium text-center border-b-2 transition-colors ${activeTab === "notes" ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>{t("class.notes")}</button>
          </div>

          <div className="flex-1 flex overflow-hidden">
            <div className={`flex-1 flex flex-col ${activeTab !== "chat" ? "hidden md:flex" : "flex"}`}>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${msg.role === "student" ? "ml-auto bg-primary text-primary-foreground" : msg.role === "system" ? "mx-auto text-center text-xs text-muted-foreground bg-muted" : "bg-muted"}`}>{msg.content}</motion.div>
                ))}
              </div>
              <div className="border-t p-3 flex gap-2">
                <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} placeholder={t("class.typePlaceholder")} className="flex-1 bg-transparent outline-none text-sm px-3 py-2 rounded-lg border" />
                <Button size="icon" onClick={handleSend} className="hero-gradient text-primary-foreground border-0">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className={`w-full md:w-80 border-l ${activeTab !== "notes" ? "hidden md:block" : "block"}`}>
              <div className="p-3 border-b flex items-center gap-2">
                <PenTool className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">{t("class.lessonNotes")}</h3>
              </div>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full h-[calc(100%-3rem)] p-3 text-sm bg-transparent outline-none resize-none" placeholder={t("class.notesPlaceholder")} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
