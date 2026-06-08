"use client";
import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence, useInView, useMotionValue, useSpring } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Zap, Shield, MessageSquare, Cpu, Star, ChevronDown, Github, Twitter, Menu, X, Check, Sparkles, Globe, Braces, Database, Layers } from "lucide-react";
import { Button } from "@/components/ui/Button";

/* ─── DATA ─── */
const features = [
  { icon: Zap,          title: "Streaming Responses",    desc: "Real-time token streaming with abort & regenerate support.",         color: "cyan"    },
  { icon: Cpu,          title: "Multiple AI Models",      desc: "Access GPT-4o, Claude 3.5, Gemini, Llama & more via OpenRouter.",    color: "violet"  },
  { icon: MessageSquare,title: "Persistent Chat History", desc: "All conversations saved to MongoDB with search & pin.",              color: "emerald" },
  { icon: Shield,       title: "Secure Authentication",   desc: "JWT + Google OAuth with HttpOnly cookies and refresh tokens.",       color: "rose"    },
  { icon: Globe,        title: "Multi-Language",          desc: "Communicate in 100+ languages with auto-detection and translation.", color: "sky"     },
  { icon: Braces,       title: "Code Highlighting",       desc: "Syntax highlighting for 50+ languages with one-click copy.",        color: "amber"   },
  { icon: Database,     title: "Conversation Export",     desc: "Export chats as Markdown, PDF, or JSON for offline access.",        color: "teal"    },
  { icon: Layers,       title: "System Prompts",          desc: "Save and reuse custom system prompts for different workflows.",     color: "fuchsia" },
];

const testimonials = [
  { name: "Alex Chen",    role: "ML Engineer",      text: "The streaming implementation is flawless. Best open-source AI chat I've used.",     avatar: "AC", rating: 5 },
  { name: "Sarah Kim",    role: "Product Designer", text: "The dark UI is stunning. Clean, fast and production-ready out of the box.",          avatar: "SK", rating: 5 },
  { name: "Marcus Silva", role: "Full-Stack Dev",   text: "Saved me weeks of work. The architecture is solid and well documented.",            avatar: "MS", rating: 5 },
  { name: "Priya Nair",   role: "AI Researcher",    text: "Switching between models mid-conversation is a game-changer for my research.",      avatar: "PN", rating: 5 },
  { name: "Tom Weber",    role: "Startup CTO",      text: "We replaced three tools with this. Export and API features alone are worth it.",    avatar: "TW", rating: 5 },
];

const pricing = [
  { name: "Starter", price: "$0",  period: "forever",    features: ["10 chats/day","3 AI models","Chat history 7 days","Community support"],                                        popular: false },
  { name: "Pro",     price: "$12", period: "per month",  features: ["Unlimited chats","All AI models","Unlimited history","Priority support","API access","Export (PDF/MD/JSON)"],  popular: true  },
  { name: "Team",    price: "$39", period: "per month",  features: ["Everything in Pro","5 team seats","Admin dashboard","Custom models","SLA support","SSO & audit logs"],         popular: false },
];

const faqs = [
  { q: "Which AI models are supported?", a: "We support 100+ models via OpenRouter including GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro, Llama 3, Mistral and more." },
  { q: "Is my data secure?",             a: "Yes. Messages are stored encrypted. We use HttpOnly cookies and never log API keys. Full GDPR compliance." },
  { q: "Can I self-host?",               a: "Absolutely. Clone the repo, add your environment variables and deploy to Vercel + MongoDB Atlas in minutes." },
  { q: "How does streaming work?",       a: "We use Server-Sent Events with ReadableStream from OpenRouter, giving you real-time token streaming with full abort support." },
  { q: "Is there an API?",               a: "Pro and Team plans include API access so you can integrate AduraAI directly into your own applications and workflows." },
];

const models = [
  "GPT-4o","GPT-4 Turbo","Claude 3.5 Sonnet","Claude 3 Opus",
  "Gemini 1.5 Pro","Llama 3 70B","Mistral Large","DeepSeek V2","Qwen 2 72B","Phi-3 Medium",
];

const stats = [
  { value: "100+",  label: "AI Models"   },
  { value: "50k+",  label: "Developers"  },
  { value: "99.9%", label: "Uptime"      },
  { value: "2ms",   label: "Avg Latency" },
];

const colorMap: Record<string, { bg: string; border: string; text: string }> = {
  cyan:    { bg: "bg-cyan-500/10",    border: "border-cyan-500/25",    text: "text-cyan-400"    },
  violet:  { bg: "bg-violet-500/10",  border: "border-violet-500/25",  text: "text-violet-400"  },
  emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/25", text: "text-emerald-400" },
  rose:    { bg: "bg-rose-500/10",    border: "border-rose-500/25",    text: "text-rose-400"    },
  sky:     { bg: "bg-sky-500/10",     border: "border-sky-500/25",     text: "text-sky-400"     },
  amber:   { bg: "bg-amber-500/10",   border: "border-amber-500/25",   text: "text-amber-400"   },
  teal:    { bg: "bg-teal-500/10",    border: "border-teal-500/25",    text: "text-teal-400"    },
  fuchsia: { bg: "bg-fuchsia-500/10", border: "border-fuchsia-500/25", text: "text-fuchsia-400" },
};

/* ─── CURSOR GLOW ─── */
function CursorGlow() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 80, damping: 20 });
  const sy = useSpring(y, { stiffness: 80, damping: 20 });
  useEffect(() => {
    const move = (e: MouseEvent) => { x.set(e.clientX); y.set(e.clientY); };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);
  return (
    <motion.div
      style={{ left: sx, top: sy, translateX: "-50%", translateY: "-50%" }}
      className="pointer-events-none fixed z-0 w-96 h-96 rounded-full opacity-[0.035] bg-cyan-400 blur-[80px]"
    />
  );
}

/* ─── ANIMATED COUNTER ─── */
function Counter({ target }: { target: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const numeric = parseFloat(target.replace(/[^0-9.]/g, ""));
  const suffix = target.replace(/[0-9.]/g, "");
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let v = 0;
    const step = numeric / 40;
    const t = setInterval(() => {
      v += step;
      if (v >= numeric) { setCount(numeric); clearInterval(t); }
      else setCount(Math.floor(v * 10) / 10);
    }, 30);
    return () => clearInterval(t);
  }, [inView, numeric]);
  return <span ref={ref}>{count}{suffix}</span>;
}

/* ─── GRID BG ─── */
function GridBg() {
  return (
    <div className="pointer-events-none absolute inset-0 opacity-[0.025]"
      style={{ backgroundImage: "linear-gradient(rgb(6 182 212) 1px,transparent 1px),linear-gradient(90deg,rgb(6 182 212) 1px,transparent 1px)", backgroundSize: "48px 48px" }} />
  );
}

/* ─── TYPING DOTS ─── */
function TypingDots() {
  return (
    <span className="inline-flex items-center gap-0.5 ml-1 align-middle">
      {[0,1,2].map(i => (
        <motion.span key={i} className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block"
          animate={{ opacity:[0.3,1,0.3], y:[0,-3,0] }}
          transition={{ duration:0.8, repeat:Infinity, delay:i*0.15 }} />
      ))}
    </span>
  );
}

/* ─── FLOATING BADGE ─── */
function FloatingBadge({ children, delay=0, className="" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity:0, scale:0.8, y:10 }} animate={{ opacity:1, scale:1, y:0 }}
      transition={{ delay, type:"spring", stiffness:200, damping:15 }}
      className={`absolute glass rounded-xl px-3 py-2 text-xs font-medium border border-border/60 shadow-xl flex items-center gap-2 z-20 ${className}`}
    >{children}</motion.div>
  );
}

/* ─── TESTIMONIAL MARQUEE ─── */
function TestimonialMarquee() {
  const doubled = [...testimonials, ...testimonials];
  return (
    <div className="overflow-hidden relative">
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      <motion.div className="flex gap-5 w-max"
        animate={{ x:[0, -(testimonials.length * 296)] }}
        transition={{ duration:28, repeat:Infinity, ease:"linear" }}>
        {doubled.map((t,i) => (
          <div key={i} className="glass rounded-2xl p-5 w-72 flex-shrink-0 border border-border/60">
            <div className="flex gap-0.5 mb-3">
              {Array(t.rating).fill(0).map((_,j) => <Star key={j} className="w-3.5 h-3.5 fill-cyan-400 text-cyan-400" />)}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center text-xs font-bold text-white">{t.avatar}</div>
              <div>
                <div className="text-sm font-semibold">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

/* ─── FAQ ITEM ─── */
function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }}
      viewport={{ once:true }} transition={{ delay:index*0.07 }}
      className={`glass rounded-2xl overflow-hidden transition-colors duration-300 ${open ? "border-cyan-500/30" : "border-border/60"}`}
    >
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-white/[0.02] transition-colors">
        <span className="font-semibold text-sm">{q}</span>
        <motion.div animate={{ rotate: open ? 45 : 0 }} transition={{ type:"spring", stiffness:300, damping:20 }}
          className="flex-shrink-0 w-5 h-5 rounded-full border border-border flex items-center justify-center">
          <span className="text-xs leading-none text-muted-foreground">+</span>
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }}
            exit={{ height:0, opacity:0 }} transition={{ duration:0.28, ease:"easeInOut" }} className="overflow-hidden">
            <p className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-4">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── MAIN ─── */
export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeModel, setActiveModel] = useState(0);
  const { scrollY } = useScroll();
  const navBg = useTransform(scrollY, [0,80], ["rgba(0,0,0,0)","rgba(0,0,0,0.85)"]);

  useEffect(() => {
    const t = setInterval(() => setActiveModel(p => (p+1) % models.length), 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-cyan-500/20 selection:text-cyan-300">
      <CursorGlow />

      {/* ── NAV ── */}
      <motion.nav style={{ backgroundColor: navBg }}
        className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl border-b border-border/40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-xl">
            <motion.div whileHover={{ rotate:180, scale:1.1 }} transition={{ type:"spring", stiffness:260, damping:20 }}
              className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Zap className="w-4 h-4 text-black" />
            </motion.div>
            <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">AduraAI</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            {["Features","Models","Pricing","FAQ"].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`}
                className="relative hover:text-foreground transition-colors group">
                {l}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-cyan-400 group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Login</Button>
            </Link>
            <Link href="/auth/register">
              <motion.div whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}>
                <Button size="sm" className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold shadow-lg shadow-cyan-500/25">
                  Get Started <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
                </Button>
              </motion.div>
            </Link>
          </div>

          <button className="md:hidden text-muted-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }}
              exit={{ height:0, opacity:0 }}
              className="md:hidden overflow-hidden border-t border-border/40 bg-background/95 backdrop-blur-xl">
              <div className="px-6 py-4 space-y-3">
                {["Features","Models","Pricing","FAQ"].map(l => (
                  <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setMobileOpen(false)}
                    className="block py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">{l}</a>
                ))}
                <div className="pt-2 flex flex-col gap-2">
                  <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">Login</Button>
                  </Link>
                  <Link href="/auth/register" onClick={() => setMobileOpen(false)}>
                    <Button size="sm" className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold">Get Started</Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-16 px-6 min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-10%,rgba(6,182,212,0.09),transparent_70%)]" />
        <GridBg />
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-violet-500/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 w-full">
          {/* Badge */}
          <motion.div initial={{ opacity:0, y:20, scale:0.9 }} animate={{ opacity:1, y:0, scale:1 }}
            transition={{ duration:0.5, type:"spring" }}
            className="inline-flex items-center gap-2.5 bg-cyan-500/8 border border-cyan-500/20 rounded-full px-4 py-1.5 text-sm text-cyan-400 mb-10">
            <motion.span animate={{ scale:[1,1.4,1] }} transition={{ duration:1.5, repeat:Infinity }}
              className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
            Production-Ready AI Chat Platform
            <span className="w-px h-3.5 bg-cyan-500/30" />
            <Sparkles className="w-3.5 h-3.5" />
          </motion.div>

          {/* Headline */}
          <div className="overflow-hidden mb-6">
            <motion.h1 initial={{ y:80, opacity:0 }} animate={{ y:0, opacity:1 }}
              transition={{ duration:0.7, ease:[0.16,1,0.3,1] }}
              className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.06]">
              Chat with the world&apos;s<br />
              <span className="relative inline-block mt-1">
                <span className="bg-gradient-to-r from-cyan-300 via-cyan-400 to-cyan-500 bg-clip-text text-transparent">
                  best AI models
                </span>
                <motion.span initial={{ scaleX:0 }} animate={{ scaleX:1 }}
                  transition={{ delay:0.9, duration:0.6, ease:"easeOut" }}
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400/0 via-cyan-400 to-cyan-400/0 origin-left" />
              </span>
            </motion.h1>
          </div>

          {/* Subtitle */}
          <motion.p initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }}
            className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
            Stream responses, switch models mid-conversation, and build AI-powered workflows — all in one beautiful interface.
          </motion.p>

          {/* CTAs */}
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.55 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/auth/register">
              <motion.div whileHover={{ scale:1.04, y:-2 }} whileTap={{ scale:0.97 }}>
                <Button size="lg" className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold shadow-xl shadow-cyan-500/25 px-8 w-full sm:w-auto">
                  Start chatting free
                  <motion.span animate={{ x:[0,4,0] }} transition={{ duration:1.5, repeat:Infinity }} className="ml-2 inline-block">
                    <ArrowRight className="w-4 h-4" />
                  </motion.span>
                </Button>
              </motion.div>
            </Link>
            <a href="https://github.com/Ayush-Panda-design/AI-CHAT_CLONE">
              <motion.div whileHover={{ scale:1.04, y:-2 }} whileTap={{ scale:0.97 }}>
                <Button size="lg" variant="outline" className="border-border/70 hover:border-border w-full sm:w-auto gap-2">
                  <Github className="w-4 h-4" /> View on GitHub
                </Button>
              </motion.div>
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.75 }}
            className="flex flex-wrap items-center justify-center gap-8 mb-16 text-center">
            {stats.map((s,i) => (
              <motion.div key={s.label} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
                transition={{ delay:0.8+i*0.08 }}>
                <div className="text-2xl font-extrabold"><Counter target={s.value} /></div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Chat preview */}
          <motion.div initial={{ opacity:0, y:60 }} animate={{ opacity:1, y:0 }}
            transition={{ duration:0.9, delay:0.3, ease:[0.16,1,0.3,1] }} className="relative">
            <FloatingBadge delay={1.2} className="-top-4 left-4 md:left-8">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400">Live streaming</span>
            </FloatingBadge>
            <FloatingBadge delay={1.4} className="-top-4 right-4 md:right-8">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span className="text-muted-foreground">
                <AnimatePresence mode="wait">
                  <motion.span key={activeModel} initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
                    exit={{ opacity:0, y:-6 }} transition={{ duration:0.25 }} className="inline-block">
                    {models[activeModel]}
                  </motion.span>
                </AnimatePresence>
              </span>
            </FloatingBadge>

            <motion.div whileHover={{ y:-6, boxShadow:"0 40px 80px rgba(6,182,212,0.12)" }}
              transition={{ type:"spring", stiffness:200 }}
              className="glass rounded-2xl overflow-hidden border border-border/60 shadow-2xl">
              <div className="bg-card/80 border-b border-border/60 px-4 py-3 flex items-center gap-3">
                <div className="flex gap-1.5">
                  {["bg-red-500/70","bg-yellow-500/70","bg-emerald-500/70"].map((c,i) => (
                    <motion.div key={i} className={`w-3 h-3 rounded-full ${c}`} whileHover={{ scale:1.3 }} />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground font-mono flex-1 text-center">AduraAI – GPT-4o</span>
                <motion.div animate={{ opacity:[0.3,1,0.3] }} transition={{ duration:2, repeat:Infinity }}
                  className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <div className="p-6 space-y-4 text-left min-h-52">
                <motion.div initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.9 }}
                  className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary flex-shrink-0 flex items-center justify-center text-xs font-bold border border-border/60">U</div>
                  <div className="bg-secondary rounded-2xl rounded-tl-sm px-4 py-3 text-sm max-w-md border border-border/40">
                    Explain quantum entanglement in simple terms
                  </div>
                </motion.div>
                <motion.div initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }} transition={{ delay:1.1 }}
                  className="flex gap-3">
                  <motion.div
                    animate={{ boxShadow:["0 0 0 rgba(6,182,212,0)","0 0 20px rgba(6,182,212,0.4)","0 0 0 rgba(6,182,212,0)"] }}
                    transition={{ duration:2, repeat:Infinity }}
                    className="w-8 h-8 rounded-full bg-cyan-500/15 border border-cyan-500/30 flex-shrink-0 flex items-center justify-center">
                    <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  </motion.div>
                  <div className="bg-card border border-border/60 rounded-2xl rounded-tl-sm px-4 py-3 text-sm max-w-lg leading-relaxed">
                    Quantum entanglement is like two magic coins 🪙 — flip one and it lands heads, the other{" "}
                    <span className="text-cyan-400 font-medium">instantly</span> lands tails, no matter how far apart they are
                    <TypingDots />
                  </div>
                </motion.div>
              </div>
              <div className="border-t border-border/60 px-4 py-3 flex gap-3 items-center bg-card/40">
                <div className="flex-1 bg-secondary/50 border border-border/40 rounded-xl px-4 py-2.5 text-sm text-muted-foreground">Ask anything...</div>
                <motion.div whileHover={{ scale:1.1, boxShadow:"0 0 20px rgba(6,182,212,0.5)" }} whileTap={{ scale:0.95 }}
                  className="w-9 h-9 rounded-xl bg-cyan-500 flex items-center justify-center cursor-pointer flex-shrink-0 shadow-lg shadow-cyan-500/30">
                  <ArrowRight className="w-4 h-4 text-black" />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <motion.div animate={{ y:[0,8,0] }} transition={{ duration:2, repeat:Infinity }}>
            <ChevronDown className="w-5 h-5 text-muted-foreground/50" />
          </motion.div>
        </div>
      </section>

      {/* ── MODEL TICKER ── */}
      <div className="border-y border-border/40 py-3.5 overflow-hidden bg-card/20">
        <motion.div className="flex gap-6 w-max"
          animate={{ x:[0, -(models.length * 120)] }} transition={{ duration:18, repeat:Infinity, ease:"linear" }}>
          {[...models,...models,...models].map((m,i) => (
            <span key={i} className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap px-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/50" />{m}
            </span>
          ))}
        </motion.div>
      </div>

      {/* ── FEATURES ── */}
      <section id="features" className="py-28 px-6 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(6,182,212,0.03),transparent)]" />
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
            className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-cyan-500/70 uppercase mb-4">
              <span className="w-8 h-px bg-cyan-500/40" /> Features <span className="w-8 h-px bg-cyan-500/40" />
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Everything you need</h2>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">Built for developers and power users who demand the best</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f,i) => {
              const c = colorMap[f.color];
              return (
                <motion.div key={f.title}
                  initial={{ opacity:0, y:28 }} whileInView={{ opacity:1, y:0 }}
                  viewport={{ once:true }} transition={{ delay:i*0.07 }}
                  whileHover={{ y:-6, transition:{ type:"spring", stiffness:300 } }}
                  className="group glass rounded-2xl p-6 border border-border/60 hover:border-border transition-all cursor-default relative overflow-hidden">
                  <motion.div whileHover={{ rotate:[0,-8,8,0], scale:1.1 }} transition={{ duration:0.4 }}
                    className={`w-11 h-11 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center mb-4`}>
                    <f.icon className={`w-5 h-5 ${c.text}`} />
                  </motion.div>
                  <h3 className="font-semibold text-sm mb-2">{f.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                  <motion.div initial={{ scaleX:0 }} whileInView={{ scaleX:1 }} viewport={{ once:true }}
                    transition={{ delay:0.3+i*0.06, duration:0.5 }}
                    className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-${f.color}-500/40 to-transparent origin-left`} />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── MODELS ── */}
      <section id="models" className="py-28 px-6 bg-card/20 border-y border-border/40">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} className="mb-14">
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-cyan-500/70 uppercase mb-4">
              <span className="w-8 h-px bg-cyan-500/40" /> Models <span className="w-8 h-px bg-cyan-500/40" />
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">100+ AI Models</h2>
            <p className="text-muted-foreground max-w-md mx-auto">Access the world&apos;s most capable models through a single, beautiful interface</p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {models.map((m,i) => (
              <motion.div key={m} initial={{ opacity:0, scale:0.85 }} whileInView={{ opacity:1, scale:1 }}
                viewport={{ once:true }} transition={{ delay:i*0.05 }}
                whileHover={{ scale:1.06, y:-3 }}
                className="glass rounded-full px-5 py-2 text-sm border border-border/70 hover:border-cyan-500/40 hover:text-cyan-300 transition-all cursor-default">
                {m}
              </motion.div>
            ))}
            <motion.div initial={{ opacity:0, scale:0.85 }} whileInView={{ opacity:1, scale:1 }}
              viewport={{ once:true }} transition={{ delay:models.length*0.05 }}
              className="glass rounded-full px-5 py-2 text-sm border border-dashed border-border/50 text-muted-foreground/60">
              +90 more
            </motion.div>
          </div>

          {/* Mini comparison */}
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
            className="glass rounded-2xl border border-border/60 overflow-hidden max-w-2xl mx-auto">
            {[
              { name:"GPT-4o",            quality:96, ctx:"128k" },
              { name:"Claude 3.5 Sonnet", quality:98, ctx:"200k" },
              { name:"Gemini 1.5 Pro",    quality:94, ctx:"1M"   },
            ].map((m,i) => (
              <div key={m.name} className={`flex items-center gap-4 px-6 py-4 text-sm ${i<2?"border-b border-border/40":""}`}>
                <span className="font-medium w-40 text-left text-xs">{m.name}</span>
                <div className="flex-1">
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <motion.div initial={{ width:0 }} whileInView={{ width:`${m.quality}%` }}
                      viewport={{ once:true }} transition={{ duration:1, delay:i*0.15, ease:"easeOut" }}
                      className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full" />
                  </div>
                </div>
                <span className="text-xs text-muted-foreground w-8 text-right">{m.quality}</span>
                <span className="text-xs text-muted-foreground/60 w-8 text-right">{m.ctx}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-28 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 text-center mb-14">
          <motion.div initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}>
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-cyan-500/70 uppercase mb-4">
              <span className="w-8 h-px bg-cyan-500/40" /> Testimonials <span className="w-8 h-px bg-cyan-500/40" />
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">Loved by developers</h2>
          </motion.div>
        </div>
        <TestimonialMarquee />
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-28 px-6 bg-card/20 border-y border-border/40">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
            className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-cyan-500/70 uppercase mb-4">
              <span className="w-8 h-px bg-cyan-500/40" /> Pricing <span className="w-8 h-px bg-cyan-500/40" />
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Simple pricing</h2>
            <p className="text-muted-foreground">No hidden fees. Cancel anytime.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {pricing.map((p,i) => (
              <motion.div key={p.name}
                initial={{ opacity:0, y:32, scale:0.95 }} whileInView={{ opacity:1, y:0, scale:1 }}
                viewport={{ once:true }} transition={{ delay:i*0.1, type:"spring", stiffness:100 }}
                whileHover={{ y:-8, transition:{ type:"spring", stiffness:300 } }}
                className={`rounded-2xl p-8 flex flex-col relative ${p.popular
                  ? "bg-gradient-to-b from-cyan-500/10 to-cyan-500/5 border-2 border-cyan-500/40 shadow-xl shadow-cyan-500/10"
                  : "glass border border-border/60"}`}>
                {p.popular && (
                  <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5 }}
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-cyan-500 text-black text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-cyan-500/30 whitespace-nowrap flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" /> Most Popular
                  </motion.div>
                )}
                <div className="mb-6">
                  <div className="text-sm text-muted-foreground mb-2 font-medium">{p.name}</div>
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-5xl font-extrabold tracking-tight ${p.popular?"text-cyan-300":""}`}>{p.price}</span>
                    <div className="text-muted-foreground text-sm">
                      <div className="leading-none">/mo</div>
                      <div className="text-xs mt-0.5">{p.period}</div>
                    </div>
                  </div>
                </div>
                <ul className="space-y-3 flex-1 mb-8">
                  {p.features.map((f,j) => (
                    <motion.li key={f} initial={{ opacity:0, x:-8 }} whileInView={{ opacity:1, x:0 }}
                      viewport={{ once:true }} transition={{ delay:0.2+j*0.06 }}
                      className="flex items-center gap-3 text-sm">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${p.popular?"bg-cyan-500/20":"bg-secondary"}`}>
                        <Check className={`w-3 h-3 ${p.popular?"text-cyan-400":"text-muted-foreground"}`} />
                      </div>
                      {f}
                    </motion.li>
                  ))}
                </ul>
                <Link href="/auth/register">
                  <motion.div whileHover={{ scale:1.03 }} whileTap={{ scale:0.98 }}>
                    <Button variant={p.popular?"default":"outline"}
                      className={`w-full ${p.popular?"bg-cyan-500 hover:bg-cyan-400 text-black font-bold shadow-lg shadow-cyan-500/20":""}`}>
                      Get started
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-28 px-6">
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
            className="text-center mb-14">
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-cyan-500/70 uppercase mb-4">
              <span className="w-8 h-px bg-cyan-500/40" /> FAQ <span className="w-8 h-px bg-cyan-500/40" />
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">Common questions</h2>
          </motion.div>
          <div className="space-y-3">
            {faqs.map((f,i) => <FaqItem key={i} q={f.q} a={f.a} index={i} />)}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-6">
        <motion.div initial={{ opacity:0, scale:0.95 }} whileInView={{ opacity:1, scale:1 }} viewport={{ once:true }}
          className="max-w-3xl mx-auto relative overflow-hidden rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/8 via-transparent to-violet-500/8 p-12 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_120%,rgba(6,182,212,0.12),transparent)] pointer-events-none" />
          <GridBg />
          <motion.div animate={{ rotate:360 }} transition={{ duration:25, repeat:Infinity, ease:"linear" }}
            className="absolute top-4 right-8 opacity-5 text-8xl select-none pointer-events-none">⚡</motion.div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-1.5 text-sm text-cyan-400 mb-6">
              <motion.span animate={{ scale:[1,1.4,1] }} transition={{ duration:1.5, repeat:Infinity }}
                className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
              Join 50,000+ developers
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">Ready to ship faster?</h2>
            <p className="text-muted-foreground mb-8">Start for free. No credit card required.</p>
            <Link href="/auth/register">
              <motion.div whileHover={{ scale:1.06, boxShadow:"0 0 40px rgba(6,182,212,0.35)" }}
                whileTap={{ scale:0.97 }} className="inline-block">
                <Button size="lg" className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-10 shadow-xl shadow-cyan-500/30">
                  Start for free <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border/40 py-14 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-10 mb-10">
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center gap-2.5 font-bold text-lg mb-3">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-black" />
                </div>
                AduraAI
              </Link>
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                The most powerful open-source AI chat platform. Built for developers.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-sm">
              {[
                { heading:"Product", links:["Features","Models","Pricing","Changelog"] },
                { heading:"Company", links:["About","Blog","Careers","Press"] },
                { heading:"Legal",   links:["Privacy","Terms","Security","Docs"] },
              ].map(col => (
                <div key={col.heading}>
                  <div className="font-semibold text-foreground mb-3">{col.heading}</div>
                  {col.links.map(l => (
                    <a key={l} href="#" className="block text-muted-foreground hover:text-foreground transition-colors mb-2">{l}</a>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-border/40 text-sm text-muted-foreground">
            <div>© 2026 AduraAI. MIT License.</div>
            <div className="flex items-center gap-4">
              <a href="https://github.com/Ayush-Panda-design/AI-CHAT_CLONE"
                className="hover:text-foreground transition-colors flex items-center gap-1.5">
                <Github className="w-4 h-4" /> GitHub
              </a>
              <a href="#" className="hover:text-foreground transition-colors flex items-center gap-1.5">
                <Twitter className="w-4 h-4" /> Twitter
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
