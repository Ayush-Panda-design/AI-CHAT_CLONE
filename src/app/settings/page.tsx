"use client";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { motion } from "framer-motion";
import { User, Lock, Trash2, Bell, Palette, Shield } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const [name, setName] = useState(user?.name ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${useAuthStore.getState().accessToken}` },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to save");
      updateUser({ name });
      toast.success("Profile updated");
    } catch { toast.error("Failed to save changes"); }
    finally { setSaving(false); }
  }

  const sections = [
    { icon: User, label: "Profile" },
    { icon: Lock, label: "Security" },
    { icon: Palette, label: "Appearance" },
    { icon: Bell, label: "Notifications" },
    { icon: Shield, label: "Privacy" },
    { icon: Trash2, label: "Danger Zone" },
  ];

  return (
    <div className="min-h-screen bg-background px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Settings</h1>
        <div className="grid md:grid-cols-4 gap-6">
          <nav className="space-y-1">
            {sections.map(s => (
              <button key={s.label} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground text-left">
                <s.icon className="w-4 h-4" /> {s.label}
              </button>
            ))}
          </nav>
          <div className="md:col-span-3 space-y-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl p-6 border border-border">
              <h2 className="font-semibold mb-4">Profile</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Display Name</label>
                  <Input value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Email</label>
                  <Input value={user?.email} disabled className="opacity-60" />
                </div>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.1 } }}
              className="glass rounded-2xl p-6 border border-destructive/20">
              <h2 className="font-semibold mb-2 text-destructive">Danger Zone</h2>
              <p className="text-sm text-muted-foreground mb-4">Permanently delete your account and all data.</p>
              <Button variant="destructive" size="sm">Delete Account</Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
