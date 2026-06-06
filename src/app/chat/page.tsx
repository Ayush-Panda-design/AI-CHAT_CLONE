"use client";
import { motion } from "framer-motion";
import { Zap, MessageSquare, Code, Lightbulb, Globe } from "lucide-react";
import { useChatStore } from "@/store/chatStore";
import { useRouter } from "next/navigation";

const suggestions = [
  { icon: Code, label: "Write a React component", prompt: "Write a React component for a responsive navigation bar with dark mode support" },
  { icon: Lightbulb, label: "Brainstorm ideas", prompt: "Give me 10 creative startup ideas in the AI space for 2026" },
  { icon: Globe, label: "Translate text", prompt: "Translate the following text to Spanish, French, and German: 'Hello, how are you?'" },
  { icon: MessageSquare, label: "Summarize content", prompt: "Summarize the key points from a long article about quantum computing" },
];

export default function ChatIndexPage() {
  const { createChat } = useChatStore();
  const router = useRouter();

  async function handleSuggestion(prompt: string) {
    const chat = await createChat();
    if (chat) router.push(`/chat/${chat._id}?prompt=${encodeURIComponent(prompt)}`);
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-2xl">
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-6">
          <Zap className="w-8 h-8 text-cyan-400" />
        </div>
        <h1 className="text-3xl font-bold mb-3">How can I help you today?</h1>
        <p className="text-muted-foreground">Ask anything — I&apos;ll respond using the selected AI model</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-10">
          {suggestions.map((s, i) => (
            <motion.button
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => handleSuggestion(s.prompt)}
              className="glass rounded-xl p-4 text-left hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all group"
            >
              <s.icon className="w-5 h-5 text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
              <div className="font-medium text-sm">{s.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{s.prompt}</div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
