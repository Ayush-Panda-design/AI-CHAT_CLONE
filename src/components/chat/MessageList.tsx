"use client";
import { motion, AnimatePresence } from "framer-motion";
import { MessageBubble } from "./MessageBubble";
import { Skeleton } from "@/components/ui/Skeleton";
import type { Message } from "@/types";

interface Props {
  messages: Message[];
  isStreaming: boolean;
  isLoading: boolean;
}

export function MessageList({ messages, isStreaming, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className={`flex gap-3 ${i % 2 === 0 ? "justify-end" : ""}`}>
            <Skeleton className="h-16 w-64 rounded-2xl" />
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
        Start the conversation...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-2">
      <AnimatePresence initial={false}>
        {messages.map((msg, idx) => (
          <motion.div
            key={msg._id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <MessageBubble
              message={msg}
              isLast={idx === messages.length - 1}
              isStreaming={isStreaming && idx === messages.length - 1}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
