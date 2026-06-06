"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Zap, Shield, MessageSquare, Cpu, Star, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";

const features = [
  { icon: Zap, title: "Streaming Responses", desc: "Real-time token streaming with abort & regenerate support." },
  { icon: Cpu, title: "Multiple AI Models", desc: "Access GPT-4o, Claude 3.5, Gemini, Llama & more via OpenRouter." },
  { icon: MessageSquare, title: "Persistent Chat History", desc: "All conversations saved to MongoDB with search & pin." },
  { icon: Shield, title: "Secure Authentication", desc: "JWT + Google OAuth with HttpOnly cookies and refresh tokens." },
];

const testimonials = [
  { name: "Alex Chen", role: "ML Engineer", text: "The streaming implementation is flawless. Best open-source AI chat I've used." },
  { name: "Sarah Kim", role: "Product Designer", text: "The dark UI is stunning. Clean, fast and production-ready out of the box." },
  { name: "Marcus Silva", role: "Full-Stack Dev", text: "Saved me weeks of work. The architecture is solid and well documented." },
];

const pricing = [
  { name: "Starter", price: "$0", features: ["10 chats/day", "3 AI models", "Chat history 7 days", "Community support"] },
  { name: "Pro", price: "$12", features: ["Unlimited chats", "All AI models", "Unlimited history", "Priority support", "API access"], popular: true },
  { name: "Team", price: "$39", features: ["Everything in Pro", "5 team seats", "Admin dashboard", "Custom models", "SLA support"] },
];

const faqs = [
  { q: "Which AI models are supported?", a: "We support 100+ models via OpenRouter including GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro, Llama 3, Mistral and more." },
  { q: "Is my data secure?", a: "Yes. Messages are stored encrypted. We use HttpOnly cookies and never log API keys. Full GDPR compliance." },
  { q: "Can I self-host?", a: "Absolutely. Clone the repo, add your environment variables and deploy to Vercel + MongoDB Atlas in minutes." },
  { q: "How does streaming work?", a: "We use Server-Sent Events with ReadableStream from OpenRouter, giving you real-time token streaming with full abort support." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center">
              <Zap className="w-4 h-4 text-black" />
            </div>
            <span className="text-gradient">AduraAI</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            {["Features","Models","Pricing","FAQ"].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} className="hover:text-foreground transition-colors">{l}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login"><Button variant="ghost" size="sm">Login</Button></Link>
            <Link href="/auth/register"><Button size="sm">Get Started <ArrowRight className="ml-1 w-3 h-3"/></Button></Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(6,182,212,0.08),transparent)]" />
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-1.5 text-sm text-cyan-400 mb-8">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              Production-Ready AI Chat Platform
            </div>
            <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-1.5 text-sm text-cyan-400 mb-8">
  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
  Production-Ready AI Chat Platform
</div>

<div className="flex justify-center mb-8">
  <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 text-sm text-emerald-400">
    <span className="w-2 h-2 rounded-full bg-emerald-400" />
    💡 Use free models like <span className="font-semibold mx-1">Owl Alpha</span>, <span className="font-semibold mx-1">MoonshotAI</span> or <span className="font-semibold mx-1">Zai: GLM</span> to get started — no payment needed
  </div>
</div>

<h1 className="text-5xl md:text-7xl font-bold ...">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
              Chat with the world&apos;s<br />
              <span className="text-gradient">best AI models</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              A fully open-source, production-grade AI chat application  
              streaming responses, and 100+ AI models via OpenRouter.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/register">
                <Button size="lg" className="glow-cyan w-full sm:w-auto">
                  Start chatting free <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <a href="https://github.com" target="_blank">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  View on GitHub
                </Button>
              </a>
            </div>
          </motion.div>

          {/* Chat Preview */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-20 glass rounded-2xl overflow-hidden border border-border/60 glow-cyan"
          >
            <div className="bg-card/80 border-b border-border px-4 py-3 flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
              </div>
              <span className="text-xs text-muted-foreground font-mono">AduraAI – GPT-4o</span>
            </div>
            <div className="p-6 space-y-4 text-left min-h-48">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary flex-shrink-0 flex items-center justify-center text-xs font-bold">U</div>
                <div className="bg-secondary rounded-2xl rounded-tl-sm px-4 py-3 text-sm max-w-md">
                  Explain quantum entanglement in simple terms
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex-shrink-0 flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 text-sm max-w-lg leading-relaxed">
                  Quantum entanglement is like having two magic coins 🪙 — when you flip one and it lands heads, 
                  the other instantly lands tails, <span className="text-cyan-400">no matter how far apart they are</span>...
                  <span className="inline-block w-0.5 h-4 bg-cyan-400 ml-1 animate-pulse align-middle" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        <div className="flex justify-center mt-16">
          <ChevronDown className="w-6 h-6 text-muted-foreground animate-bounce" />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything you need</h2>
            <p className="text-muted-foreground text-lg">Built for developers and power users alike</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-6 hover:border-cyan-500/30 transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4 group-hover:bg-cyan-500/20 transition-colors">
                  <f.icon className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Models */}
      <section id="models" className="py-24 px-6 bg-card/30">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">100+ AI Models</h2>
          <p className="text-muted-foreground mb-12">Access the world&apos;s best models through a single interface</p>
          <div className="flex flex-wrap justify-center gap-3">
            {["GPT-4o","GPT-4 Turbo","Claude 3.5 Sonnet","Claude 3 Opus","Gemini 1.5 Pro",
              "Llama 3 70B","Mistral Large","DeepSeek V2","Qwen 2 72B","Phi-3 Medium"].map(m => (
              <div key={m} className="glass rounded-full px-5 py-2 text-sm border border-border/80 hover:border-cyan-500/40 hover:text-cyan-400 transition-all cursor-default">
                {m}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Loved by developers</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-6"
              >
                <div className="flex mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-cyan-400 text-cyan-400" />)}
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                <div>
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 bg-card/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple pricing</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {pricing.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`rounded-2xl p-8 flex flex-col relative ${p.popular ? "bg-cyan-500/10 border-2 border-cyan-500/50 glow-cyan" : "glass"}`}
              >
                {p.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <div className="text-sm text-muted-foreground mb-1">{p.name}</div>
                  <div className="text-4xl font-bold">{p.price}<span className="text-muted-foreground text-lg font-normal">/mo</span></div>
                </div>
                <ul className="space-y-3 flex-1 mb-8">
                  {p.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <div className="w-4 h-4 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
                <Button variant={p.popular ? "default" : "outline"} className="w-full">
                  Get started
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Frequently asked questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="glass rounded-2xl p-6"
              >
                <h3 className="font-semibold mb-2">{f.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <div className="w-6 h-6 rounded bg-cyan-500 flex items-center justify-center">
              <Zap className="w-3 h-3 text-black" />
            </div>
            NexusAI
          </div>
          <div className="flex gap-6">
            {["Privacy","Terms","GitHub","Docs"].map(l => (
              <a key={l} href="#" className="hover:text-foreground transition-colors">{l}</a>
            ))}
          </div>
          <div>© 2026 NexusAI. MIT License.</div>
        </div>
      </footer>
    </div>
  );
}
