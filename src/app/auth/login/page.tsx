"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Zap, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Min 6 characters"),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Login failed");

      // Clear any previous session (e.g. old Google account)
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth-store");
      }

      login(json.user, json.accessToken);
      toast.success("Welcome back!");
      router.push("/chat");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_0%,rgba(6,182,212,0.06),transparent)]" />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass rounded-2xl p-8 border border-border/80"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold mb-6">
            <div className="w-9 h-9 rounded-xl bg-cyan-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-black" />
            </div>
            <span className="text-gradient">AduraAI</span>
          </Link>
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground text-sm mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input {...register("email")} type="email" placeholder="you@example.com" className="pl-10" />
            </div>
            {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input {...register("password")} type={showPass ? "text" : "password"} placeholder="••••••••" className="pl-10 pr-10" />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-destructive text-xs mt-1">{errors.password.message}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="mt-4">
          <a href="/api/auth/google" className="w-full">
            <Button variant="outline" className="w-full">
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M5.27 9.77A7.5 7.5 0 0112 4.5c1.92 0 3.65.72 4.97 1.89l3.7-3.7A12 12 0 000 12c0 1.99.49 3.86 1.35 5.52l4.02-3.1A7.5 7.5 0 015.27 9.77z"/>
                <path fill="#34A853" d="M12 19.5c-2.43 0-4.6-.93-6.24-2.44l-4.02 3.1A12 12 0 0012 24c3.23 0 6.17-1.2 8.38-3.15l-3.9-3.02A7.46 7.46 0 0112 19.5z"/>
                <path fill="#4A90D9" d="M23.49 12.27c0-.79-.07-1.56-.19-2.27H12v4.51h6.47a5.58 5.58 0 01-2.39 3.65l3.9 3.02C22.13 19.17 23.49 15.88 23.49 12.27z"/>
                <path fill="#FBBC05" d="M5.76 14.42l-4.02 3.1A12 12 0 001.35 17.52 11.9 11.9 0 010 12c0-1.38.24-2.7.66-3.94l4.02 3.1A7.52 7.52 0 005.27 14.23z"/>
              </svg>
              Continue with Google
            </Button>
          </a>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="text-cyan-400 hover:text-cyan-300">Sign up</Link>
        </p>
      </motion.div>
    </div>
  );
}
