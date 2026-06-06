"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import type { Chat } from "@/types";

async function apiFetch(url: string, options?: RequestInit) {
  let token = useAuthStore.getState().accessToken;
  let res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...options?.headers },
  });

  if (res.status === 401) {
    const refreshRes = await fetch("/api/auth/refresh", { method: "POST" });
    if (refreshRes.ok) {
      const { accessToken } = await refreshRes.json();
      useAuthStore.getState().setAccessToken(accessToken);
      token = accessToken;
      res = await fetch(url, {
        ...options,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...options?.headers },
      });
    } else {
      useAuthStore.getState().logout();
    }
  }

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export function useChats() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery<{ chats: Chat[] }>({
    queryKey: ["chats"],
    queryFn: () => apiFetch("/api/chats"),
  });

  const createMutation = useMutation({
    mutationFn: () => apiFetch("/api/chats", { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["chats"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/api/chats/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["chats"] }),
  });

  const renameMutation = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      apiFetch(`/api/chats/${id}`, { method: "PATCH", body: JSON.stringify({ title }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["chats"] }),
  });

  const pinMutation = useMutation({
    mutationFn: async (id: string) => {
      const chat = data?.chats.find(c => c._id === id);
      return apiFetch(`/api/chats/${id}`, { method: "PATCH", body: JSON.stringify({ isPinned: !chat?.isPinned }) });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["chats"] }),
  });

  return {
    chats: data?.chats,
    isLoading,
    createChat: async () => { const r = await createMutation.mutateAsync(); return r.chat; },
    deleteChat: (id: string) => deleteMutation.mutateAsync(id),
    renameChat: (id: string, title: string) => renameMutation.mutateAsync({ id, title }),
    pinChat: (id: string) => pinMutation.mutateAsync(id),
  };
}
