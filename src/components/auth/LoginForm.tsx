export const dynamic = "force-static";
import LoginForm from "@/components/auth/LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - NexusAI",
  description: "Sign in to your NexusAI account",
};

export default function LoginPage() {
  return <LoginForm />;
}
