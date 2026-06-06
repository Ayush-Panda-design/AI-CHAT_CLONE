export const dynamic = "force-static";
import RegisterForm from "@/components/auth/RegisterForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register - NexusAI",
  description: "Create your NexusAI account",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
