import { create } from "zustand";
import { useAuthStore } from "./authStore";
import type { Chat } from "@/types";

interface ChatState {
  activeChat: Chat | null;
  setActiveChat: (chat: Chat | null) => void;
  createChat: () => Promise<Chat | null>;
}

export const useChatStore = create<ChatState>((set) => ({
  activeChat: null,
  setActiveChat: (chat) => set({ activeChat: chat }),
  createChat: async () => {
    const token = useAuthStore.getState().accessToken;
    try {
      const res = await fetch("/api/chats", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      return data.chat;
    } catch { return null; }
  },
}));
