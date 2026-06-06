"use client";
import { useState, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { useModelStore } from "@/store/modelStore";

export function useStreamChat(chatId: string, onComplete: () => void) {
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const qc = useQueryClient();
  const { accessToken } = useAuthStore();
  const { selectedModel } = useModelStore();

  const sendMessage = useCallback(async (content: string, image?: string) => {
    if (!content.trim() || isStreaming) return;

    setIsStreaming(true);
    abortRef.current = new AbortController();

    // Optimistically add user message to cache
    qc.setQueryData(["messages", chatId], (old: any) => ({
      messages: [...(old?.messages ?? []),
        { _id: `tmp-${Date.now()}`, role: "user", content, chatId, createdAt: new Date() },
        { _id: `tmp-ai-${Date.now()}`, role: "assistant", content: "", chatId, createdAt: new Date(), _streaming: true },
      ],
    }));

    try {
      let res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ chatId, content, model: selectedModel, image }),
        signal: abortRef.current.signal,
      });

      if (res.status === 401) {
        const refreshRes = await fetch("/api/auth/refresh", { method: "POST" });
        if (refreshRes.ok) {
          const { accessToken: newToken } = await refreshRes.json();
          useAuthStore.getState().setAccessToken(newToken);
          res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${newToken}` },
            body: JSON.stringify({ chatId, content, model: selectedModel, image }),
            signal: abortRef.current.signal,
          });
        } else {
          useAuthStore.getState().logout();
        }
      }

      if (!res.ok) {
        let errText = "Stream failed";
        try {
          const errData = await res.json();
          // Extract specific OpenRouter error messages
          if (errData.error && typeof errData.error === 'object') {
            errText = errData.error.metadata?.raw || errData.error.message || JSON.stringify(errData.error);
          } else {
            errText = errData.error || errData.message || errText;
          }

          if (errText.includes("No endpoints found that support image input")) {
            errText = "The selected model does not support image uploads. Please select a Vision model (like Gemini Pro or GPT-4o) or remove the attached image. Note: Stable Diffusion is for generating images, not analyzing them.";
          }
        } catch {
          errText = await res.text() || errText;
        }
        throw new Error(errText);
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter(l => l.startsWith("data: "));

        for (const line of lines) {
          const data = line.replace("data: ", "").trim();
          if (data === "[DONE]") continue;
          try {
            const { token } = JSON.parse(data);
            if (token) {
              assistantContent += token;
              qc.setQueryData(["messages", chatId], (old: any) => {
                const msgs = [...(old?.messages ?? [])];
                const lastIdx = msgs.findLastIndex((m: any) => m.role === "assistant");
                if (lastIdx >= 0) msgs[lastIdx] = { ...msgs[lastIdx], content: assistantContent };
                return { messages: msgs };
              });
            }
          } catch {}
        }
      }
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        import("sonner").then(({ toast }) => {
          toast.error(e.message || "An error occurred while sending the message");
        });
      }
    } finally {
      setIsStreaming(false);
      onComplete();
      qc.invalidateQueries({ queryKey: ["chats"] });
    }
  }, [chatId, isStreaming, accessToken, selectedModel, qc, onComplete]);

  const abortStream = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  return { sendMessage, isStreaming, abortStream };
}
