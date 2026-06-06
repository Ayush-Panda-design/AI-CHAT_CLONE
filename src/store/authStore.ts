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
  initAuth: () => Promise<boolean>;
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

      updateUser: (updates) =>
        set((s) => ({ user: s.user ? { ...s.user, ...updates } : null })),

      initAuth: async () => {
        try {
          // 1. Try current token/cookie
          const res = await fetch("/api/auth/me", { credentials: "include" });

          if (res.ok) {
            const json = await res.json();
            set({ user: json.user, isAuthenticated: true });
            return true;
          }

          // 2. Token expired — try refresh
          if (res.status === 401) {
            const refreshRes = await fetch("/api/auth/refresh", {
              method: "POST",
              credentials: "include",
            });

            if (!refreshRes.ok) {
              set({ user: null, accessToken: null, isAuthenticated: false });
              return false;
            }

            const refreshJson = await refreshRes.json();

            // 3. Retry /me with new token
            const retryRes = await fetch("/api/auth/me", { credentials: "include" });

            if (!retryRes.ok) {
              set({ user: null, accessToken: null, isAuthenticated: false });
              return false;
            }

            const retryJson = await retryRes.json();
            set({
              user: retryJson.user,
              accessToken: refreshJson.accessToken ?? null,
              isAuthenticated: true,
            });
            return true;
          }

          return false;
        } catch {
          set({ user: null, accessToken: null, isAuthenticated: false });
          return false;
        }
      },
    }),
    {
      name: "auth-store",
      partialize: (s) => ({
        user: s.user,
        accessToken: s.accessToken,
        isAuthenticated: s.isAuthenticated,
      }),
    }
  )
);
