"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Pin, Trash2, Edit2, Settings,
  MessageSquare, ChevronLeft, Zap, LogOut, User, X
} from "lucide-react";
import { useChats } from "@/hooks/useChats";
import { useAuthStore } from "@/store/authStore";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { chats, isLoading, createChat, deleteChat, renameChat, pinChat } = useChats();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const filtered = chats?.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  const pinned = filtered.filter(c => c.isPinned);
  const recent = filtered.filter(c => !c.isPinned);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  async function handleNewChat() {
    const chat = await createChat();
    if (chat) router.push(`/chat/${chat._id}`);
  }

  async function handleDelete(id: string) {
    await deleteChat(id);
    if (pathname.includes(id)) router.push("/chat");
    toast.success("Chat deleted");
  }

  async function handleRename(id: string) {
    if (!editTitle.trim()) return;
    await renameChat(id, editTitle);
    setEditingId(null);
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    logout();
    router.push("/auth/login");
  }

  // Expose toggle for ChatHeader via a global event
  useEffect(() => {
    function handler() { setMobileOpen(prev => !prev); }
    window.addEventListener("toggle-sidebar", handler);
    return () => window.removeEventListener("toggle-sidebar", handler);
  }, []);

  const sidebarContent = (
    <>
      {/* Header */}
      <div className="p-3 flex items-center justify-between border-b border-border">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500 flex items-center justify-center flex-shrink-0">
              <Zap className="w-3.5 h-3.5 text-black" />
            </div>
            <span className="font-bold text-sm text-gradient">NexusAI</span>
          </Link>
        )}
        {/* Desktop collapse button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn("p-1.5 rounded-lg hover:bg-secondary transition-colors hidden md:block", collapsed && "mx-auto")}
        >
          <motion.div animate={{ rotate: collapsed ? 180 : 0 }}>
            <ChevronLeft className="w-4 h-4" />
          </motion.div>
        </button>
        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="p-1.5 rounded-lg hover:bg-secondary transition-colors md:hidden"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* New Chat */}
      <div className="p-3">
        <button
          onClick={handleNewChat}
          className={cn(
            "w-full flex items-center gap-2 rounded-xl p-2.5 text-sm font-medium",
            "bg-cyan-500/10 border border-cyan-500/20 text-cyan-400",
            "hover:bg-cyan-500/20 transition-colors",
            collapsed && "justify-center"
          )}
        >
          <Plus className="w-4 h-4 flex-shrink-0" />
          {!collapsed && "New Chat"}
        </button>
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="px-3 pb-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search chats..."
              className="w-full bg-input border border-border rounded-lg pl-8 pr-3 py-2 text-xs placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
        </div>
      )}

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-3 space-y-4">
        {!collapsed && pinned.length > 0 && (
          <div>
            <div className="text-xs text-muted-foreground font-medium mb-1.5 flex items-center gap-1">
              <Pin className="w-3 h-3" /> Pinned
            </div>
            {pinned.map(chat => (
              <ChatItem
                key={chat._id}
                chat={chat}
                isActive={pathname.includes(chat._id)}
                editingId={editingId}
                editTitle={editTitle}
                setEditTitle={setEditTitle}
                setEditingId={setEditingId}
                onRename={handleRename}
                onDelete={handleDelete}
                onPin={pinChat}
              />
            ))}
          </div>
        )}

        {!collapsed && (
          <div>
            {pinned.length > 0 && <div className="text-xs text-muted-foreground font-medium mb-1.5">Recent</div>}
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="h-9 rounded-lg bg-secondary animate-pulse mb-1" />
              ))
            ) : recent.length === 0 ? (
              <div className="text-xs text-muted-foreground text-center py-6">No chats yet</div>
            ) : (
              recent.map(chat => (
                <ChatItem
                  key={chat._id}
                  chat={chat}
                  isActive={pathname.includes(chat._id)}
                  editingId={editingId}
                  editTitle={editTitle}
                  setEditTitle={setEditTitle}
                  setEditingId={setEditingId}
                  onRename={handleRename}
                  onDelete={handleDelete}
                  onPin={pinChat}
                />
              ))
            )}
          </div>
        )}

        {collapsed && (
          <div className="space-y-1">
            {chats?.slice(0, 8).map(chat => (
              <Link key={chat._id} href={`/chat/${chat._id}`}
                className={cn("flex justify-center p-2 rounded-lg hover:bg-secondary transition-colors",
                  pathname.includes(chat._id) && "bg-secondary")}
              >
                <MessageSquare className="w-4 h-4" />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* User */}
      <div className="p-3 border-t border-border">
        {collapsed ? (
          <div className="flex justify-center">
            <Avatar src={user?.avatar} name={user?.name} size={32} />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Avatar src={user?.avatar} name={user?.name} size={32} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{user?.name}</div>
              <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
            </div>
            <div className="flex gap-1">
              <Link href="/settings">
                <button className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                  <Settings className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </Link>
              <button onClick={handleLogout} className="p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 280 }}
        className="hidden md:flex flex-col h-full bg-card border-r border-border relative z-10 flex-shrink-0"
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile Overlay + Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-[280px] flex flex-col bg-card border-r border-border z-50 md:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function ChatItem({ chat, isActive, editingId, editTitle, setEditTitle, setEditingId, onRename, onDelete, onPin }: any) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={cn(
        "group flex items-center gap-2 rounded-lg p-2 text-sm cursor-pointer transition-colors mb-0.5",
        isActive ? "bg-secondary text-foreground" : "hover:bg-secondary/60 text-muted-foreground hover:text-foreground"
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
      {editingId === chat._id ? (
        <input
          autoFocus
          value={editTitle}
          onChange={e => setEditTitle(e.target.value)}
          onBlur={() => onRename(chat._id)}
          onKeyDown={e => { if (e.key === "Enter") onRename(chat._id); if (e.key === "Escape") setEditingId(null); }}
          className="flex-1 bg-input border border-cyan-500 rounded px-2 py-0.5 text-xs text-foreground outline-none"
          onClick={e => e.stopPropagation()}
        />
      ) : (
        <Link href={`/chat/${chat._id}`} className="flex-1 truncate text-xs">
          {chat.title}
        </Link>
      )}

      {(hovered || isActive) && editingId !== chat._id && (
        <div className="flex items-center gap-0.5">
          <button onClick={() => { setEditingId(chat._id); setEditTitle(chat.title); }}
            className="p-1 rounded hover:bg-secondary transition-colors">
            <Edit2 className="w-3 h-3" />
          </button>
          <button onClick={() => onPin(chat._id)}
            className={cn("p-1 rounded hover:bg-secondary transition-colors", chat.isPinned && "text-cyan-400")}>
            <Pin className="w-3 h-3" />
          </button>
          <button onClick={() => onDelete(chat._id)}
            className="p-1 rounded hover:bg-destructive/10 hover:text-destructive transition-colors">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}
