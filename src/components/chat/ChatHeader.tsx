"use client";
import { Sun, Moon, Monitor, ChevronDown, User, Settings, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuthStore } from "@/store/authStore";
import { useModelStore } from "@/store/modelStore";
import { Avatar } from "@/components/ui/Avatar";
import { ModelSelector } from "@/components/chat/ModelSelector";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function ChatHeader({ chatId }: { chatId: string }) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [userOpen, setUserOpen] = useState(false);

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
    <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-background/80 backdrop-blur-sm flex-shrink-0">
      <ModelSelector />

      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <div className="flex items-center bg-secondary rounded-lg p-0.5">
          {themes.map(t => (
            <button
              key={t.value}
              onClick={() => setTheme(t.value)}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                theme === t.value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <t.icon className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserOpen(!userOpen)}
            className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-secondary transition-colors"
          >
            <Avatar src={user?.avatar} name={user?.name} size={28} />
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </button>

          {userOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 glass border border-border rounded-xl shadow-xl z-50">
              <div className="p-3 border-b border-border">
                <div className="font-medium text-sm">{user?.name}</div>
                <div className="text-xs text-muted-foreground">{user?.email}</div>
              </div>
              <div className="p-1">
                {[
                  { icon: User, label: "Profile", href: "/profile" },
                  { icon: Settings, label: "Settings", href: "/settings" },
                ].map(item => (
                  <Link key={item.label} href={item.href} onClick={() => setUserOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-secondary transition-colors">
                    <item.icon className="w-4 h-4 text-muted-foreground" />
                    {item.label}
                  </Link>
                ))}
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-destructive/10 hover:text-destructive transition-colors text-left">
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
