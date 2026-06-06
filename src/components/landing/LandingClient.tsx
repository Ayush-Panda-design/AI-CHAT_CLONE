"use client";
import { useState, useEffect, useRef } from "react";

/* ─── Data (unchanged from original) ─── */
const features = [
  { icon: "⚡", title: "Streaming Responses", desc: "Real-time token streaming with abort & regenerate support." },
  { icon: "🧠", title: "Multiple AI Models", desc: "Access GPT-4o, Claude 3.5, Gemini, Llama & more via OpenRouter." },
  { icon: "💬", title: "Persistent Chat History", desc: "All conversations saved to MongoDB with search & pin." },
  { icon: "🔒", title: "Secure Authentication", desc: "JWT + Google OAuth with HttpOnly cookies and refresh tokens." },
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

const models = ["GPT-4o","GPT-4 Turbo","Claude 3.5 Sonnet","Claude 3 Opus","Gemini 1.5 Pro","Llama 3 70B","Mistral Large","DeepSeek V2","Qwen 2 72B","Phi-3 Medium"];

/* ─── Hooks ─── */
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

/* ─── Architecture Diagram (interactive SVG) ─── */
function ArchDiagram() {
  const [active, setActive] = useState(null);
  const nodes = [
    { id: "client", x: 60, y: 160, w: 120, h: 48, label: "Client", sub: "React + Next.js", color: "#06b6d4", bg: "rgba(6,182,212,0.12)", border: "rgba(6,182,212,0.4)" },
    { id: "api", x: 240, y: 160, w: 120, h: 48, label: "API Route", sub: "Next.js Edge", color: "#a78bfa", bg: "rgba(167,139,250,0.12)", border: "rgba(167,139,250,0.4)" },
    { id: "auth", x: 240, y: 60, w: 120, h: 48, label: "Auth", sub: "JWT + OAuth", color: "#34d399", bg: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.4)" },
    { id: "openrouter", x: 420, y: 160, w: 130, h: 48, label: "OpenRouter", sub: "100+ models", color: "#f97316", bg: "rgba(249,115,22,0.12)", border: "rgba(249,115,22,0.4)" },
    { id: "mongo", x: 240, y: 260, w: 120, h: 48, label: "MongoDB", sub: "Chat history", color: "#06b6d4", bg: "rgba(6,182,212,0.08)", border: "rgba(6,182,212,0.3)" },
  ];
  const edges = [
    { from: "client", to: "api", label: "SSE stream" },
    { from: "client", to: "auth", label: "token" },
    { from: "api", to: "openrouter", label: "prompt" },
    { from: "api", to: "mongo", label: "save" },
  ];
  const getCenter = (id: string) => { const n = nodes.find(x => x.id === id)!; return { x: n.x + n.w / 2, y: n.y + n.h / 2 }; };
  const activeNode = active ? nodes.find(n => n.id === active) : null;

  return (
    <div style={{ position: "relative" }}>
      <svg viewBox="0 0 600 340" width="100%" style={{ overflow: "visible" }}>
        <defs>
          <marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M2 1L8 5L2 9" fill="none" stroke="rgba(100,116,139,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </marker>
        </defs>
        {edges.map(({ from, to, label }) => {
          const a = getCenter(from), b = getCenter(to);
          const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
          const isActive = active === from || active === to;
          return (
            <g key={from + to}>
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={isActive ? "rgba(6,182,212,0.7)" : "rgba(100,116,139,0.35)"}
                strokeWidth={isActive ? 1.5 : 1} strokeDasharray={isActive ? "none" : "4 3"}
                markerEnd="url(#ah)" style={{ transition: "all 0.25s" }} />
              <text x={mx + 6} y={my - 6} fontSize="10" fill="rgba(148,163,184,0.8)" textAnchor="middle">{label}</text>
            </g>
          );
        })}
        {nodes.map(n => (
          <g key={n.id} style={{ cursor: "pointer" }} onClick={() => setActive(active === n.id ? null : n.id)}>
            <rect x={n.x} y={n.y} width={n.w} height={n.h} rx="10"
              fill={active === n.id ? n.bg.replace("0.12", "0.25").replace("0.08","0.2") : n.bg}
              stroke={active === n.id ? n.color : n.border}
              strokeWidth={active === n.id ? 1.5 : 0.75}
              style={{ transition: "all 0.2s" }} />
            <text x={n.x + n.w / 2} y={n.y + 17} textAnchor="middle" fontSize="13" fontWeight="600" fill={n.color}>{n.label}</text>
            <text x={n.x + n.w / 2} y={n.y + 33} textAnchor="middle" fontSize="10" fill="rgba(148,163,184,0.8)">{n.sub}</text>
          </g>
        ))}
      </svg>
      {activeNode && (
        <div style={{ marginTop: 8, padding: "10px 16px", background: activeNode.bg, border: `1px solid ${activeNode.border}`, borderRadius: 10, fontSize: 13, color: activeNode.color }}>
          <strong>{activeNode.label}</strong> — {activeNode.sub}
        </div>
      )}
      <p style={{ fontSize: 12, color: "rgba(148,163,184,0.6)", marginTop: 8, textAlign: "center" }}>Click any node to highlight connections</p>
    </div>
  );
}

/* ─── Request Flow Diagram ─── */
function FlowDiagram() {
  const [step, setStep] = useState(0);
  const steps = [
    { label: "User types message", color: "#06b6d4", desc: "Input captured, model + history attached" },
    { label: "Edge API receives", color: "#a78bfa", desc: "Auth validated, rate limit checked" },
    { label: "OpenRouter call", color: "#f97316", desc: "Streamed response via SSE begins" },
    { label: "Tokens stream back", color: "#34d399", desc: "UI renders tokens in real-time" },
    { label: "Saved to MongoDB", color: "#06b6d4", desc: "Full exchange persisted for history" },
  ];
  useEffect(() => {
    const t = setInterval(() => setStep(s => (s + 1) % steps.length), 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {steps.map((s, i) => (
          <div key={i} onClick={() => setStep(i)} style={{
            display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
            borderRadius: 10, cursor: "pointer",
            background: step === i ? `${s.color}18` : "rgba(30,41,59,0.4)",
            border: `1px solid ${step === i ? s.color + "55" : "rgba(51,65,85,0.5)"}`,
            transition: "all 0.3s"
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              background: step === i ? s.color : "rgba(51,65,85,0.8)",
              color: step === i ? "#000" : "rgba(148,163,184,0.7)",
              fontSize: 12, fontWeight: 700, flexShrink: 0, transition: "all 0.3s"
            }}>{i + 1}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: step === i ? s.color : "rgba(203,213,225,0.8)" }}>{s.label}</div>
              {step === i && <div style={{ fontSize: 11, color: "rgba(148,163,184,0.7)", marginTop: 2 }}>{s.desc}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Animated counter ─── */
function Counter({ target, suffix = "" }) {
  const [val, setVal] = useState(0);
  const [ref, inView] = useInView(0.5);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / 40;
    const t = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(t); }
      else setVal(Math.floor(start));
    }, 30);
    return () => clearInterval(t);
  }, [inView, target]);
  return <span ref={ref}>{val}{suffix}</span>;
}

/* ─── FAQ Accordion ─── */
function FAQ({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: "1px solid rgba(51,65,85,0.6)", borderRadius: 12, overflow: "hidden", transition: "border-color 0.2s", borderColor: open ? "rgba(6,182,212,0.3)" : undefined }}>
      <button onClick={() => setOpen(!open)} style={{
        width: "100%", textAlign: "left", padding: "16px 20px", background: "rgba(15,23,42,0.6)",
        border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12
      }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#cbd5e1" }}>{q}</span>
        <span style={{ color: "#06b6d4", fontSize: 20, lineHeight: 1, transform: open ? "rotate(45deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}>+</span>
      </button>
      <div style={{ maxHeight: open ? 200 : 0, overflow: "hidden", transition: "max-height 0.3s ease" }}>
        <p style={{ padding: "0 20px 16px", fontSize: 13, color: "rgba(148,163,184,0.85)", lineHeight: 1.7, margin: 0 }}>{a}</p>
      </div>
    </div>
  );
}

/* ─── Animated typing demo ─── */
function TypingDemo() {
  const [text, setText] = useState("");
  const [phase, setPhase] = useState(0);
  const full = "Quantum entanglement is like having two magic coins — when you flip one and it lands heads, the other instantly lands tails, no matter how far apart they are...";
  useEffect(() => {
    if (phase === 0) {
      if (text.length < full.length) {
        const t = setTimeout(() => setText(full.slice(0, text.length + 1)), 22);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => setPhase(1), 3000);
        return () => clearTimeout(t);
      }
    } else {
      if (text.length > 0) {
        const t = setTimeout(() => setText(t => t.slice(0, -1)), 8);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => setPhase(0), 600);
        return () => clearTimeout(t);
      }
    }
  }, [text, phase]);
  return (
    <span>
      {text}
      <span style={{ display: "inline-block", width: 2, height: "1em", background: "#06b6d4", marginLeft: 1, verticalAlign: "text-bottom", animation: "blink 1s step-end infinite" }} />
    </span>
  );
}

/* ─── Main Landing Page ─── */
export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [featRef, featInView] = useInView();
  const [statsRef, statsInView] = useInView();
  const [pricingRef, pricingInView] = useInView();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html{scroll-behavior:smooth}
    body{font-family:'DM Sans',sans-serif;background:#030712;color:#e2e8f0;overflow-x:hidden;line-height:1.6}
    ::selection{background:#06b6d430;color:#06b6d4}
    @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
    @keyframes spin-slow{to{transform:rotate(360deg)}}
    @keyframes fade-up{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fade-in{from{opacity:0}to{opacity:1}}
    @keyframes pulse-ring{0%{transform:scale(1);opacity:0.6}100%{transform:scale(1.6);opacity:0}}
    @keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
    .fade-up{opacity:0;transform:translateY(28px);transition:opacity 0.5s ease,transform 0.5s ease}
    .fade-up.visible{opacity:1;transform:translateY(0)}
    a{color:inherit;text-decoration:none}
    button{font-family:inherit;cursor:pointer}
    ::-webkit-scrollbar{width:6px}
    ::-webkit-scrollbar-track{background:#0a0f1a}
    ::-webkit-scrollbar-thumb{background:#1e293b;border-radius:3px}
  `;

  return (
    <>
      <style>{css}</style>
      <div style={{ minHeight: "100vh", background: "#030712", color: "#e2e8f0", overflowX: "hidden" }}>

        {/* ── Ambient background ── */}
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
          <div style={{ position: "absolute", top: "-20%", left: "30%", width: 600, height: 600, background: "radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)", borderRadius: "50%" }} />
          <div style={{ position: "absolute", top: "40%", right: "-10%", width: 500, height: 500, background: "radial-gradient(circle, rgba(167,139,250,0.04) 0%, transparent 70%)", borderRadius: "50%" }} />
        </div>

        {/* ── Nav ── */}
        <nav style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          background: scrolled ? "rgba(3,7,18,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(51,65,85,0.4)" : "1px solid transparent",
          transition: "all 0.3s"
        }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <a href="#" style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'Space Mono',monospace", fontWeight: 700, fontSize: 18 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#06b6d4,#0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>⚡</div>
              <span style={{ background: "linear-gradient(90deg,#06b6d4,#38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AduraAI</span>
            </a>
            <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
              {["features","models","pricing","faq"].map(id => (
                <button key={id} onClick={() => scrollTo(id)} style={{ background: "none", border: "none", color: "rgba(148,163,184,0.8)", fontSize: 14, fontWeight: 500, textTransform: "capitalize", display: window.innerWidth < 768 ? "none" : "block", transition: "color 0.2s" }}
                  onMouseOver={e => (e.target as HTMLElement).style.color = "#e2e8f0"} onMouseOut={e => (e.target as HTMLElement).style.color = "rgba(148,163,184,0.8)"}>{id}</button>
              ))}
              <a href="#" style={{ padding: "8px 18px", borderRadius: 8, border: "1px solid rgba(51,65,85,0.7)", fontSize: 13, fontWeight: 500, color: "rgba(203,213,225,0.8)", background: "transparent", transition: "all 0.2s" }}
                onMouseOver={e => { (e.target as HTMLElement).style.borderColor = "rgba(6,182,212,0.4)"; (e.target as HTMLElement).style.color = "#06b6d4"; }}
                onMouseOut={e => { (e.target as HTMLElement).style.borderColor = "rgba(51,65,85,0.7)"; (e.target as HTMLElement).style.color = "rgba(203,213,225,0.8)"; }}>
                Login
              </a>
              <a href="#" style={{ padding: "8px 18px", borderRadius: 8, background: "linear-gradient(135deg,#06b6d4,#0ea5e9)", color: "#000", fontSize: 13, fontWeight: 700, transition: "opacity 0.2s" }}
                onMouseOver={e => (e.target as HTMLElement).style.opacity = "0.88"} onMouseOut={e => (e.target as HTMLElement).style.opacity = "1"}>
                Get Started →
              </a>
            </div>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section style={{ position: "relative", zIndex: 1, paddingTop: 140, paddingBottom: 80, paddingLeft: 24, paddingRight: 24 }}>
          <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center", animation: "fade-up 0.7s ease forwards" }}>
            {/* Badge 1 */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)", borderRadius: 100, padding: "6px 16px", fontSize: 13, color: "#67e8f9", marginBottom: 16 }}>
              <span style={{ position: "relative", display: "inline-block" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#06b6d4", display: "inline-block" }} />
                <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#06b6d4", animation: "pulse-ring 1.5s ease-out infinite" }} />
              </span>
              Production-Ready AI Chat Platform
            </div>

            {/* Badge 2 */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: 100, padding: "6px 16px", fontSize: 13, color: "#6ee7b7", flexWrap: "wrap", justifyContent: "center" }}>
                💡 Use free models like <strong>Owl Alpha</strong>, <strong>MoonshotAI</strong> or <strong>Zai: GLM</strong> — no payment needed
              </div>
            </div>

            <h1 style={{ fontSize: "clamp(2.4rem,6vw,4.5rem)", fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.03em", marginBottom: 24, fontFamily: "'DM Sans',sans-serif" }}>
              Chat with the world's{" "}
              <span style={{ background: "linear-gradient(135deg,#06b6d4 0%,#38bdf8 50%,#a78bfa 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                best AI models
              </span>
            </h1>

            <p style={{ fontSize: "clamp(1rem,2vw,1.2rem)", color: "rgba(148,163,184,0.9)", maxWidth: 620, margin: "0 auto 40px", lineHeight: 1.7 }}>
              A fully open-source, production-grade AI chat application with streaming responses, and 100+ AI models via OpenRouter.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
              <a href="#" style={{ padding: "14px 28px", borderRadius: 10, background: "linear-gradient(135deg,#06b6d4,#0ea5e9)", color: "#000", fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, boxShadow: "0 0 32px rgba(6,182,212,0.25)", transition: "transform 0.2s, box-shadow 0.2s" }}
                onMouseOver={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 0 48px rgba(6,182,212,0.4)"; }}
                onMouseOut={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 0 32px rgba(6,182,212,0.25)"; }}>
                Start chatting free →
              </a>
              <a href="https://github.com" target="_blank" rel="noreferrer" style={{ padding: "14px 28px", borderRadius: 10, border: "1px solid rgba(51,65,85,0.8)", color: "#94a3b8", fontSize: 15, fontWeight: 500, transition: "all 0.2s" }}
                onMouseOver={e => { e.currentTarget.style.borderColor = "rgba(148,163,184,0.4)"; e.currentTarget.style.color = "#e2e8f0"; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = "rgba(51,65,85,0.8)"; e.currentTarget.style.color = "#94a3b8"; }}>
                ⭐ View on GitHub
              </a>
            </div>
          </div>

          {/* ── Chat preview ── */}
          <div style={{ maxWidth: 760, margin: "64px auto 0", position: "relative", animation: "fade-up 0.8s 0.2s ease forwards", opacity: 0 }}>
            <div style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(51,65,85,0.6)", borderRadius: 16, overflow: "hidden", boxShadow: "0 0 60px rgba(6,182,212,0.12)" }}>
              <div style={{ background: "rgba(15,23,42,0.9)", borderBottom: "1px solid rgba(51,65,85,0.4)", padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ display: "flex", gap: 6 }}>
                  {["#ef4444","#eab308","#22c55e"].map(c => <div key={c} style={{ width: 11, height: 11, borderRadius: "50%", background: c + "99" }} />)}
                </div>
                <span style={{ fontSize: 12, color: "rgba(148,163,184,0.6)", fontFamily: "'Space Mono',monospace" }}>AduraAI – GPT-4o</span>
              </div>
              <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16, minHeight: 160 }}>
                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(30,41,59,0.9)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#94a3b8" }}>U</div>
                  <div style={{ background: "rgba(30,41,59,0.8)", borderRadius: "16px 16px 16px 4px", padding: "10px 16px", fontSize: 14, color: "#cbd5e1", maxWidth: "80%" }}>
                    Explain quantum entanglement in simple terms
                  </div>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(6,182,212,0.12)", border: "1px solid rgba(6,182,212,0.3)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>⚡</div>
                  <div style={{ background: "rgba(15,23,42,0.9)", border: "1px solid rgba(51,65,85,0.4)", borderRadius: "16px 16px 16px 4px", padding: "10px 16px", fontSize: 14, color: "#cbd5e1", maxWidth: "85%", lineHeight: 1.6 }}>
                    <TypingDemo />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll chevron */}
          <div style={{ textAlign: "center", marginTop: 48 }}>
            <span style={{ color: "rgba(100,116,139,0.5)", fontSize: 22, animation: "float 2s ease-in-out infinite" }}>↓</span>
          </div>
        </section>

        {/* ── Stats ── */}
        <section ref={statsRef} style={{ position: "relative", zIndex: 1, padding: "48px 24px" }}>
          <div style={{ maxWidth: 800, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 24 }}>
            {[
              { val: 100, suffix: "+", label: "AI Models" },
              { val: 50, suffix: "K+", label: "Active users" },
              { val: 99, suffix: ".9%", label: "Uptime SLA" },
              { val: 0, suffix: "ms", label: "Cold start*" },
            ].map(({ val, suffix, label }) => (
              <div key={label} style={{ textAlign: "center", padding: "24px 16px", background: "rgba(15,23,42,0.5)", border: "1px solid rgba(51,65,85,0.4)", borderRadius: 12 }}>
                <div style={{ fontSize: 36, fontWeight: 700, fontFamily: "'Space Mono',monospace", color: "#06b6d4", lineHeight: 1 }}>
                  {statsInView ? <Counter target={val} suffix={suffix} /> : `0${suffix}`}
                </div>
                <div style={{ fontSize: 12, color: "rgba(148,163,184,0.6)", marginTop: 6 }}>{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features ── */}
        <section id="features" ref={featRef} style={{ position: "relative", zIndex: 1, padding: "80px 24px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <h2 style={{ fontSize: "clamp(1.8rem,4vw,2.6rem)", fontWeight: 700, marginBottom: 12 }}>Everything you need</h2>
              <p style={{ color: "rgba(148,163,184,0.7)", fontSize: 16 }}>Built for developers and power users alike</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 20 }}>
              {features.map((f, i) => (
                <div key={f.title} className={`fade-up ${featInView ? "visible" : ""}`}
                  style={{ transitionDelay: `${i * 80}ms`, background: "rgba(15,23,42,0.6)", border: "1px solid rgba(51,65,85,0.5)", borderRadius: 14, padding: "28px 24px", transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s" }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = "rgba(6,182,212,0.3)"; e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.3)"; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = "rgba(51,65,85,0.5)"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 16 }}>{f.icon}</div>
                  <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, color: "#e2e8f0" }}>{f.title}</h3>
                  <p style={{ fontSize: 13, color: "rgba(148,163,184,0.75)", lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Architecture diagrams ── */}
        <section style={{ position: "relative", zIndex: 1, padding: "80px 24px", background: "rgba(6,182,212,0.02)", borderTop: "1px solid rgba(51,65,85,0.3)", borderBottom: "1px solid rgba(51,65,85,0.3)" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <h2 style={{ fontSize: "clamp(1.8rem,4vw,2.6rem)", fontWeight: 700, marginBottom: 12 }}>How it's built</h2>
              <p style={{ color: "rgba(148,163,184,0.7)", fontSize: 16 }}>Production architecture you can trust — and explore</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 24 }}>
              <div style={{ background: "rgba(15,23,42,0.7)", border: "1px solid rgba(51,65,85,0.5)", borderRadius: 14, padding: 28 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: "#06b6d4", marginBottom: 20 }}>System architecture</h3>
                <ArchDiagram />
              </div>
              <div style={{ background: "rgba(15,23,42,0.7)", border: "1px solid rgba(51,65,85,0.5)", borderRadius: 14, padding: 28 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: "#a78bfa", marginBottom: 20 }}>Request lifecycle</h3>
                <FlowDiagram />
              </div>
            </div>
          </div>
        </section>

        {/* ── Models (marquee) ── */}
        <section id="models" style={{ position: "relative", zIndex: 1, padding: "80px 0" }}>
          <div style={{ textAlign: "center", marginBottom: 40, padding: "0 24px" }}>
            <h2 style={{ fontSize: "clamp(1.8rem,4vw,2.6rem)", fontWeight: 700, marginBottom: 12 }}>100+ AI Models</h2>
            <p style={{ color: "rgba(148,163,184,0.7)", fontSize: 16 }}>Access the world's best models through a single interface</p>
          </div>
          <div style={{ overflow: "hidden", padding: "8px 0" }}>
            <div style={{ display: "flex", gap: 12, width: "max-content", animation: "marquee 20s linear infinite" }}>
              {[...models, ...models].map((m, i) => (
                <div key={i} style={{ padding: "10px 20px", background: "rgba(15,23,42,0.8)", border: "1px solid rgba(51,65,85,0.5)", borderRadius: 100, fontSize: 13, color: "#94a3b8", whiteSpace: "nowrap", flexShrink: 0 }}>{m}</div>
              ))}
            </div>
          </div>
          <style>{`@keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>
        </section>

        {/* ── Testimonials ── */}
        <section style={{ position: "relative", zIndex: 1, padding: "80px 24px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <h2 style={{ fontSize: "clamp(1.8rem,4vw,2.6rem)", fontWeight: 700, marginBottom: 12 }}>Loved by developers</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 20 }}>
              {testimonials.map((t, i) => (
                <div key={t.name} style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(51,65,85,0.5)", borderRadius: 14, padding: 24, transition: "border-color 0.2s" }}
                  onMouseOver={e => e.currentTarget.style.borderColor = "rgba(6,182,212,0.25)"}
                  onMouseOut={e => e.currentTarget.style.borderColor = "rgba(51,65,85,0.5)"}>
                  <div style={{ display: "flex", gap: 2, marginBottom: 14 }}>
                    {"★★★★★".split("").map((s, j) => <span key={j} style={{ color: "#06b6d4", fontSize: 14 }}>{s}</span>)}
                  </div>
                  <p style={{ fontSize: 13, color: "rgba(148,163,184,0.85)", lineHeight: 1.7, marginBottom: 16 }}>"{t.text}"</p>
                  <div style={{ borderTop: "1px solid rgba(51,65,85,0.4)", paddingTop: 14 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: "rgba(148,163,184,0.6)" }}>{t.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing ── */}
        <section id="pricing" ref={pricingRef} style={{ position: "relative", zIndex: 1, padding: "80px 24px", background: "rgba(6,182,212,0.02)", borderTop: "1px solid rgba(51,65,85,0.3)" }}>
          <div style={{ maxWidth: 960, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <h2 style={{ fontSize: "clamp(1.8rem,4vw,2.6rem)", fontWeight: 700, marginBottom: 12 }}>Simple pricing</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 20 }}>
              {pricing.map((p, i) => (
                <div key={p.name} className={`fade-up ${pricingInView ? "visible" : ""}`}
                  style={{ transitionDelay: `${i * 100}ms`, position: "relative", borderRadius: 16, padding: 32, display: "flex", flexDirection: "column",
                    background: p.popular ? "rgba(6,182,212,0.07)" : "rgba(15,23,42,0.6)",
                    border: p.popular ? "1.5px solid rgba(6,182,212,0.45)" : "1px solid rgba(51,65,85,0.5)",
                    boxShadow: p.popular ? "0 0 40px rgba(6,182,212,0.1)" : "none"
                  }}>
                  {p.popular && (
                    <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg,#06b6d4,#0ea5e9)", color: "#000", fontSize: 11, fontWeight: 700, padding: "4px 14px", borderRadius: 100 }}>Most Popular</div>
                  )}
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 13, color: "rgba(148,163,184,0.7)", marginBottom: 6 }}>{p.name}</div>
                    <div style={{ fontSize: 40, fontWeight: 700, fontFamily: "'Space Mono',monospace", color: p.popular ? "#06b6d4" : "#e2e8f0" }}>
                      {p.price}<span style={{ fontSize: 16, fontWeight: 400, color: "rgba(148,163,184,0.6)" }}>/mo</span>
                    </div>
                  </div>
                  <ul style={{ listStyle: "none", flexGrow: 1, marginBottom: 28, display: "flex", flexDirection: "column", gap: 10 }}>
                    {p.features.map(f => (
                      <li key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#cbd5e1" }}>
                        <span style={{ width: 18, height: 18, borderRadius: "50%", background: p.popular ? "rgba(6,182,212,0.2)" : "rgba(51,65,85,0.6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: p.popular ? "#06b6d4" : "#64748b", flexShrink: 0 }}>✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a href="#" style={{ display: "block", textAlign: "center", padding: "12px", borderRadius: 10, background: p.popular ? "linear-gradient(135deg,#06b6d4,#0ea5e9)" : "transparent", color: p.popular ? "#000" : "#94a3b8", border: p.popular ? "none" : "1px solid rgba(51,65,85,0.7)", fontSize: 14, fontWeight: 600, transition: "all 0.2s" }}
                    onMouseOver={e => { if (!p.popular) { e.currentTarget.style.borderColor = "rgba(6,182,212,0.4)"; e.currentTarget.style.color = "#06b6d4"; }}}
                    onMouseOut={e => { if (!p.popular) { e.currentTarget.style.borderColor = "rgba(51,65,85,0.7)"; e.currentTarget.style.color = "#94a3b8"; }}}>
                    Get started
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" style={{ position: "relative", zIndex: 1, padding: "80px 24px" }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <h2 style={{ fontSize: "clamp(1.8rem,4vw,2.6rem)", fontWeight: 700, marginBottom: 12 }}>Frequently asked questions</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {faqs.map((f, i) => <FAQ key={i} {...f} />)}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={{ position: "relative", zIndex: 1, padding: "80px 24px", textAlign: "center", borderTop: "1px solid rgba(51,65,85,0.3)" }}>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <h2 style={{ fontSize: "clamp(2rem,5vw,3rem)", fontWeight: 700, marginBottom: 16 }}>
              Ready to build smarter?
            </h2>
            <p style={{ color: "rgba(148,163,184,0.75)", fontSize: 16, marginBottom: 32 }}>
              Join thousands of developers using AduraAI to ship faster with AI.
            </p>
            <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "16px 36px", borderRadius: 12, background: "linear-gradient(135deg,#06b6d4,#0ea5e9)", color: "#000", fontSize: 16, fontWeight: 700, boxShadow: "0 0 48px rgba(6,182,212,0.3)", transition: "transform 0.2s, box-shadow 0.2s" }}
              onMouseOver={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 0 64px rgba(6,182,212,0.45)"; }}
              onMouseOut={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 0 48px rgba(6,182,212,0.3)"; }}>
              Start for free →
            </a>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer style={{ position: "relative", zIndex: 1, borderTop: "1px solid rgba(51,65,85,0.4)", padding: "40px 24px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'Space Mono',monospace", fontWeight: 700, fontSize: 16 }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: "linear-gradient(135deg,#06b6d4,#0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>⚡</div>
              <span style={{ background: "linear-gradient(90deg,#06b6d4,#38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AduraAI</span>
            </div>
            <div style={{ display: "flex", gap: 24 }}>
              {["Privacy","Terms","GitHub","Docs"].map(l => (
                <a key={l} href="#" style={{ fontSize: 13, color: "rgba(100,116,139,0.8)", transition: "color 0.2s" }}
                  onMouseOver={e => (e.target as HTMLElement).style.color = "#94a3b8"} onMouseOut={e => (e.target as HTMLElement).style.color = "rgba(100,116,139,0.8)"}>{l}</a>
              ))}
            </div>
            <div style={{ fontSize: 12, color: "rgba(100,116,139,0.6)" }}>© 2026 AduraAI. MIT License.</div>
          </div>
        </footer>
      </div>
    </>
  );
}
