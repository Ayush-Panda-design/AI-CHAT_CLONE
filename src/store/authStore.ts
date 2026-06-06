import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User { _id: string; name: string; email: string; avatar?: string; role: string; }

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setAccessToken: (token: string) => void;
  updateUser: (user: Partial<User>) => void;
  initAuth: () => Promise<boolean>;  // ← add this
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      login: (user, accessToken) => set({ user, accessToken, isAuthenticated: true }),
      logout: () => set({ user: null, accessToken: null, isAuthenticated: false }),
      setAccessToken: (accessToken) => set({ accessToken }),
      updateUser: (updates) => set(s => ({ user: s.user ? { ...s.user, ...updates } : null })),
      initAuth: async () => {
        try {
          const res = await fetch("/api/auth/me", { credentials: "include" });
          if (!res.ok) return false;
          const json = await res.json();
          set({ user: json.user, accessToken: json.accessToken ?? null, isAuthenticated: true });
          return true;
        } catch {
          return false;
        }
      },
    }),
    { name: "auth-store", partialize: s => ({ user: s.user, accessToken: s.accessToken, isAuthenticated: s.isAuthenticated }) }
  )
);
