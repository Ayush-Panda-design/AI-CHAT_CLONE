"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Zap, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().min(2, "Min 2 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Min 8 characters"),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name, email: data.email, password: data.password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Registration failed");
      toast.success("Account created! Please sign in.");
      router.push("/auth/login");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_0%,rgba(6,182,212,0.06),transparent)]" />
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md glass rounded-2xl p-8 border border-border/80">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold mb-6">
            <div className="w-9 h-9 rounded-xl bg-cyan-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-black" />
            </div>
            <span className="text-gradient">NexusAI</span>
          </Link>
          <h1 className="text-2xl font-bold">Create account</h1>
          <p className="text-muted-foreground text-sm mt-1">Start chatting with AI models</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {[
            { label: "Full Name", field: "name", type: "text", icon: User, placeholder: "John Doe" },
            { label: "Email", field: "email", type: "email", icon: Mail, placeholder: "you@example.com" },
          ].map(({ label, field, type, icon: Icon, placeholder }) => (
            <div key={field}>
              <label className="text-sm font-medium mb-1.5 block">{label}</label>
              <div className="relative">
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input {...register(field as "name" | "email")} type={type} placeholder={placeholder} className="pl-10" />
              </div>
              {errors[field as keyof FormData] && <p className="text-destructive text-xs mt-1">{errors[field as keyof FormData]?.message}</p>}
            </div>
          ))}

          <div>
            <label className="text-sm font-medium mb-1.5 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input {...register("password")} type={showPass ? "text" : "password"} placeholder="Min 8 characters" className="pl-10 pr-10" />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-destructive text-xs mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input {...register("confirmPassword")} type="password" placeholder="••••••••" className="pl-10" />
            </div>
            {errors.confirmPassword && <p className="text-destructive text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <Button type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-cyan-400 hover:text-cyan-300">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
