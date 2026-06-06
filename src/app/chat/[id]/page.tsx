"use client";
import { useEffect, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";
import { useMessages } from "@/hooks/useMessages";
import { useStreamChat } from "@/hooks/useStreamChat";

export default function ChatPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const chatId = params.id as string;
  const { messages, isLoading, refetch } = useMessages(chatId);
  const { sendMessage, isStreaming, abortStream } = useStreamChat(chatId, refetch);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-send prompt from URL if present
  useEffect(() => {
    const prompt = searchParams.get("prompt");
    if (prompt && messages.length === 0 && !isLoading) {
      sendMessage(prompt);
    }
  }, [chatId, isLoading]);

  return (
    <>
      <ChatHeader chatId={chatId} />
      <div className="flex-1 overflow-y-auto">
        <MessageList messages={messages} isStreaming={isStreaming} isLoading={isLoading} />
        <div ref={bottomRef} />
      </div>
      <MessageInput onSend={sendMessage} isStreaming={isStreaming} onAbort={abortStream} />
    </>
  );
}
