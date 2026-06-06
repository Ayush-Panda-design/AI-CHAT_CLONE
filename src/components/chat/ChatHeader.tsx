"use client";
import { Sun, Moon, Monitor, ChevronDown, User, Settings, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuthStore } from "@/store/authStore";
import { Avatar } from "@/components/ui/Avatar";
import { ModelSelector } from "@/components/chat/ModelSelector";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export function ChatHeader({ chatId }: { chatId: string }) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [userOpen, setUserOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click (important for mobile tap-outside)
  useEffect(() => {
    function handleOutside(e: MouseEvent | TouchEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserOpen(false);
      }
    }
    if (userOpen) {
      document.addEventListener("mousedown", handleOutside);
      document.addEventListener("touchstart", handleOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, [userOpen]);

  const themes = [
    { value: "dark", icon: Moon },
    { value: "light", icon: Sun },
    { value: "system", icon: Monitor },
  ];

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    logout();
    router.push("/auth/login");
  }

  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-3 sm:px-4 bg-background/80 backdrop-blur-sm flex-shrink-0 gap-2">
      {/* ModelSelector shrinks gracefully on mobile */}
      <div className="min-w-0 flex-1 sm:flex-none">
        <ModelSelector />
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
        {/* Theme Toggle — hidden labels on mobile, icons only */}
        <div className="flex items-center bg-secondary rounded-lg p-0.5">
          {themes.map(t => (
            <button
              key={t.value}
              onClick={() => setTheme(t.value)}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                theme === t.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label={t.value}
            >
              <t.icon className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setUserOpen(!userOpen)}
            className="flex items-center gap-1.5 rounded-lg p-1.5 hover:bg-secondary transition-colors"
          >
            <Avatar src={user?.avatar} name={user?.name} size={28} />
            <ChevronDown className="w-3 h-3 text-muted-foreground hidden sm:block" />
          </button>

          {userOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 glass border border-border rounded-xl shadow-xl z-50">
              <div className="p-3 border-b border-border">
                <div className="font-medium text-sm truncate">{user?.name}</div>
                <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
              </div>
              <div className="p-1">
                {[
                  { icon: User, label: "Profile", href: "/profile" },
                  { icon: Settings, label: "Settings", href: "/settings" },
                ].map(item => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setUserOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm hover:bg-secondary transition-colors"
                  >
                    <item.icon className="w-4 h-4 text-muted-foreground" />
                    {item.label}
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm hover:bg-destructive/10 hover:text-destructive transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}