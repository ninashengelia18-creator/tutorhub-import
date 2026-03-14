import { useState } from "react";
import { Search, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";

const conversations = [
  { id: 1, name: "Nino Beridze", subject: "Mathematics", lastMessage: "Great job on the homework! Let's review...", time: "2 min ago", unread: 2 },
  { id: 2, name: "Luka Tsiklauri", subject: "Programming", lastMessage: "I've sent you the project files.", time: "1 hour ago", unread: 0 },
  { id: 3, name: "Ana Melikishvili", subject: "English", lastMessage: "See you at our next lesson!", time: "Yesterday", unread: 0 },
];

const chatMessages = [
  { from: "tutor", text: "Hi! How are you doing with the practice problems I assigned?", time: "10:30" },
  { from: "student", text: "I solved most of them but got stuck on problem 5.", time: "10:35" },
  { from: "tutor", text: "No worries! Problem 5 is tricky. Let me explain the approach step by step.", time: "10:36" },
  { from: "tutor", text: "Great job on the homework! Let's review the concepts in our next session.", time: "10:40" },
];

export default function Messages() {
  const [selectedChat, setSelectedChat] = useState(1);
  const [message, setMessage] = useState("");

  return (
    <Layout hideFooter>
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Conversation list */}
        <div className="w-80 border-r bg-card hidden md:flex flex-col">
          <div className="p-3 border-b">
            <div className="flex items-center gap-2 rounded-lg border px-3 py-1.5">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input placeholder="Search messages..." className="flex-1 bg-transparent outline-none text-sm" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedChat(conv.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b ${
                  selectedChat === conv.id ? "bg-primary-light" : "hover:bg-muted/50"
                }`}
              >
                <div className="h-10 w-10 rounded-md bg-primary-light flex items-center justify-center text-primary text-sm font-bold shrink-0">
                  {conv.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold truncate">{conv.name}</p>
                    <span className="text-xs text-muted-foreground shrink-0">{conv.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                </div>
                {conv.unread > 0 && (
                  <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium tabular-nums">
                    {conv.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          <div className="border-b px-4 py-3 flex items-center gap-3 bg-card">
            <div className="h-8 w-8 rounded-md bg-primary-light flex items-center justify-center text-primary text-xs font-bold">NB</div>
            <div>
              <p className="font-semibold text-sm">Nino Beridze</p>
              <p className="text-xs text-muted-foreground">Mathematics · Online</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`max-w-[75%] ${msg.from === "student" ? "ml-auto" : ""}`}
              >
                <div className={`rounded-lg px-3 py-2 text-sm ${
                  msg.from === "student"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}>
                  {msg.text}
                </div>
                <p className={`text-xs text-muted-foreground mt-1 tabular-nums ${msg.from === "student" ? "text-right" : ""}`}>
                  {msg.time}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="border-t p-3 flex gap-2">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-transparent outline-none text-sm px-3 py-2 rounded-lg border"
            />
            <Button size="icon" className="hero-gradient text-primary-foreground border-0">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
