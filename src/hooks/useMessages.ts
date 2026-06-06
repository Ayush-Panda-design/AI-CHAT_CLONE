"use client";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import type { Message } from "@/types";

export function useMessages(chatId: string) {
  const token = useAuthStore.getState().accessToken;

  const { data, isLoading, refetch } = useQuery<{ messages: Message[] }>({
    queryKey: ["messages", chatId],
    queryFn: async () => {
      const res = await fetch(`/api/messages/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch messages");
      return res.json();
    },
    enabled: !!chatId,
    staleTime: 0,
  });

  return { messages: data?.messages ?? [], isLoading, refetch };
}
