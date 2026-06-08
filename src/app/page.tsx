"use client";
import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence, useInView } from "framer-motion";

/* ─── PALETTE ─── */
const P = {
  bg:"#0b0507", bgCard:"rgba(255,255,255,0.025)", bgCard2:"rgba(236,72,120,0.07)",
  border:"rgba(255,255,255,0.07)", borderPk:"rgba(236,72,120,0.38)",
  pink:"#ec4899", rose:"#fb7185", coral:"#f43f5e", gold:"#fda4af",
  dim:"#9f4f6a", muted:"#6b3347", text:"#fce7f3", sub:"#c084a0",
  faint:"#3d1a28", grad:"linear-gradient(135deg,#ec4899,#f43f5e)",
};

/* ─── DATA ─── */
const FEATURES = [
  { icon:"⚡", title:"Streaming Responses",    desc:"Real-time token streaming with abort & regenerate support.",          accent:"#ec4899" },
  { icon:"🧠", title:"Multiple AI Models",      desc:"Access GPT-4o, Claude 3.5, Gemini, Llama & more via OpenRouter.",     accent:"#f43f5e" },
  { icon:"💬", title:"Persistent Chat History", desc:"All conversations saved to MongoDB with search & pin.",               accent:"#fb7185" },
  { icon:"🔒", title:"Secure Authentication",   desc:"JWT + Google OAuth with HttpOnly cookies and refresh tokens.",        accent:"#fda4af" },
];

const TESTIMONIALS = [
  { name:"Alex Chen",    role:"ML Engineer",     text:"The streaming implementation is flawless. Best open-source AI chat I've used.",   avatar:"AC" },
  { name:"Sarah Kim",    role:"Product Designer", text:"The dark UI is stunning. Clean, fast and production-ready out of the box.",       avatar:"SK" },
  { name:"Marcus Silva", role:"Full-Stack Dev",   text:"Saved me weeks of work. The architecture is solid and well documented.",          avatar:"MS" },
];

const PRICING = [
  { name:"Starter", price:"$0",  features:["10 chats/day","3 AI models","Chat history 7 days","Community support"],                          popular:false },
  { name:"Pro",     price:"$12", features:["Unlimited chats","All AI models","Unlimited history","Priority support","API access"],            popular:true  },
  { name:"Team",    price:"$39", features:["Everything in Pro","5 team seats","Admin dashboard","Custom models","SLA support"],               popular:false },
];

const FAQS = [
  { q:"Which AI models are supported?", a:"We support 100+ models via OpenRouter including GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro, Llama 3, Mistral and more." },
  { q:"Is my data secure?",             a:"Yes. Messages are stored encrypted. We use HttpOnly cookies and never log API keys. Full GDPR compliance." },
  { q:"Can I self-host?",               a:"Absolutely. Clone the repo, add your environment variables and deploy to Vercel + MongoDB Atlas in minutes." },
  { q:"How does streaming work?",       a:"We use Server-Sent Events with ReadableStream from OpenRouter, giving you real-time token streaming with full abort support." },
];

const MODELS = [
  { name:"GPT-4o",           vendor:"OpenAI",    speed:98, quality:96, ctx:"128k", color:"#ec4899", icon:"🟢" },
  { name:"Claude 3.5 Sonnet",vendor:"Anthropic", speed:91, quality:97, ctx:"200k", color:"#f43f5e", icon:"🔴" },
  { name:"Gemini 1.5 Pro",   vendor:"Google",    speed:88, quality:94, ctx:"1M",   color:"#fb7185", icon:"🟠" },
  { name:"Llama 3 70B",      vendor:"Meta",      speed:95, quality:89, ctx:"8k",   color:"#fda4af", icon:"🟡" },
  { name:"Mistral Large",    vendor:"Mistral",   speed:93, quality:88, ctx:"32k",  color:"#f9a8d4", icon:"🔵" },
  { name:"DeepSeek V2",      vendor:"DeepSeek",  speed:85, quality:90, ctx:"128k", color:"#fecdd3", icon:"🟣" },
];

const ARCH_NODES = [
  { id:"client",  label:"Browser / App",  x:50,  y:8,   icon:"💻", color:"#ec4899" },
  { id:"auth",    label:"Auth Layer",      x:18,  y:32,  icon:"🔒", color:"#f43f5e" },
  { id:"api",     label:"API Gateway",     x:50,  y:32,  icon:"⚡", color:"#ec4899" },
  { id:"stream",  label:"Stream Engine",   x:82,  y:32,  icon:"🌊", color:"#fb7185" },
  { id:"router",  label:"Model Router",    x:50,  y:58,  icon:"🔀", color:"#fda4af" },
  { id:"mongo",   label:"MongoDB",         x:18,  y:80,  icon:"🗄️", color:"#f43f5e" },
  { id:"openr",   label:"OpenRouter",      x:50,  y:80,  icon:"🌐", color:"#ec4899" },
  { id:"cache",   label:"Redis Cache",     x:82,  y:80,  icon:"⚡", color:"#fb7185" },
];
const ARCH_EDGES = [
  ["client","auth"],["client","api"],["client","stream"],
  ["api","router"],["auth","mongo"],["router","openr"],
  ["stream","cache"],["api","mongo"],["router","cache"],
];

const CHAT_WORDS = "Quantum entanglement is like having two magic coins — when you flip one and it lands heads, the other instantly lands tails, no matter how far apart they are...".split(" ");

/* ─── MICRO COMPONENTS ─── */
function Particle({ x, y, size, dur, delay, color }) {
  return (
    <motion.div style={{ position:"absolute", left:`${x}%`, top:`${y}%`, width:size, height:size,
                         borderRadius:"50%", background:color, pointerEvents:"none" }}
      animate={{ y:[0,-26,0], opacity:[0.06,0.28,0.06], scale:[1,1.4,1] }}
      transition={{ duration:dur, delay, repeat:Infinity, ease:"easeInOut" }} />
  );
}

function TypingText({ words }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setShown(p => p < words.length ? p+1 : p), 75);
    return () => clearInterval(t);
  }, [words.length]);
  return (
    <>
      {words.slice(0, shown).map((w,i) => (
        <motion.span key={i} initial={{ opacity:0, y:6, filter:"blur(3px)" }}
          animate={{ opacity:1, y:0, filter:"blur(0px)" }} transition={{ duration:0.25 }}
          style={{ marginRight:"4px", display:"inline-block" }}>{w}</motion.span>
      ))}
      {shown < words.length && (
        <motion.span animate={{ opacity:[1,0,1] }} transition={{ duration:0.65, repeat:Infinity }}
          style={{ display:"inline-block", width:2, height:14, background:P.pink,
                   verticalAlign:"middle", marginLeft:2, borderRadius:1 }} />
      )}
    </>
  );
}

function OrbitRing({ size, dur, delay, dotColor }) {
  return (
    <motion.div style={{ position:"absolute", width:size, height:size, borderRadius:"50%",
                         border:`1px dashed ${dotColor}22`, top:"50%", left:"50%",
                         marginTop:-size/2, marginLeft:-size/2 }}
      animate={{ rotate:360 }} transition={{ duration:dur, delay, repeat:Infinity, ease:"linear" }}>
      <motion.div style={{ position:"absolute", top:-6, left:"50%", marginLeft:-6, width:12, height:12,
                           borderRadius:"50%", background:dotColor, boxShadow:`0 0 12px ${dotColor}` }}
        animate={{ scale:[1,1.7,1] }} transition={{ duration:2.5, repeat:Infinity }} />
    </motion.div>
  );
}

/* ─── ARCH DIAGRAM (SVG-based, animated) ─── */
function ArchDiagram() {
  const [activeNode, setActiveNode] = useState(null);
  const [pulse, setPulse] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setPulse(p => (p+1) % ARCH_EDGES.length), 900);
    return () => clearInterval(t);
  }, []);

  const W = 520, H = 340;
  const nx = id => ARCH_NODES.find(n=>n.id===id).x / 100 * W;
  const ny = id => ARCH_NODES.find(n=>n.id===id).y / 100 * H;

  return (
    <motion.div initial={{ opacity:0, y:40 }} whileInView={{ opacity:1, y:0 }}
      viewport={{ once:true }} transition={{ duration:0.8 }}
      style={{ background:"rgba(236,72,120,0.04)", border:`1px solid ${P.borderPk}`,
               borderRadius:22, padding:28, overflow:"hidden" }}>
      <div style={{ fontSize:12, color:P.pink, fontWeight:700, letterSpacing:"0.12em",
                    textTransform:"uppercase", marginBottom:18 }}>Architecture Diagram</div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", height:"auto", display:"block" }}>
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Edges */}
        {ARCH_EDGES.map(([a,b], i) => {
          const active = pulse === i;
          return (
            <g key={i}>
              <line x1={nx(a)} y1={ny(a)} x2={nx(b)} y2={ny(b)}
                stroke={active ? P.pink : "rgba(236,72,120,0.18)"} strokeWidth={active ? 1.5 : 1}
                strokeDasharray={active ? "none" : "4 4"} />
              {active && (
                <motion.circle r={4} fill={P.pink} filter="url(#glow)"
                  initial={{ offsetDistance:"0%", opacity:1 }}
                  animate={{ offsetDistance:"100%", opacity:[1,1,0] }}
                  transition={{ duration:0.9, ease:"easeInOut" }}
                  style={{
                    offsetPath:`path('M ${nx(a)} ${ny(a)} L ${nx(b)} ${ny(b)}')`,
                    offsetDistance:"0%",
                  }}>
                  <animateMotion dur="0.9s" begin="0s"
                    path={`M ${nx(a)} ${ny(a)} L ${nx(b)} ${ny(b)}`} />
                </motion.circle>
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {ARCH_NODES.map((node, i) => {
          const isActive = activeNode === node.id;
          return (
            <motion.g key={node.id} style={{ cursor:"pointer" }}
              onHoverStart={() => setActiveNode(node.id)}
              onHoverEnd={() => setActiveNode(null)}
              initial={{ opacity:0, scale:0 }}
              whileInView={{ opacity:1, scale:1 }}
              viewport={{ once:true }}
              transition={{ delay:i*0.08, type:"spring", stiffness:200 }}>

              {isActive && (
                <motion.circle cx={nx(node.id)} cy={ny(node.id)} r={26}
                  fill="none" stroke={node.color} strokeWidth={1}
                  initial={{ r:18, opacity:0.8 }} animate={{ r:30, opacity:0 }}
                  transition={{ duration:0.8, repeat:Infinity }} />
              )}

              <motion.rect
                x={nx(node.id)-36} y={ny(node.id)-18} width={72} height={36} rx={10}
                fill={isActive ? `${node.color}25` : "rgba(255,255,255,0.05)"}
                stroke={isActive ? node.color : "rgba(236,72,120,0.25)"}
                strokeWidth={isActive ? 1.5 : 1}
                filter={isActive ? "url(#glow)" : "none"}
                animate={{ fill: isActive ? `${node.color}25` : "rgba(255,255,255,0.05)" }}
                transition={{ duration:0.25 }} />

              <text x={nx(node.id)} y={ny(node.id)-4} textAnchor="middle"
                fill={isActive ? node.color : P.gold} fontSize={14} fontFamily="sans-serif">
                {node.icon}
              </text>
              <text x={nx(node.id)} y={ny(node.id)+11} textAnchor="middle"
                fill={isActive ? node.color : P.sub} fontSize={8.5}
                fontWeight={isActive ? "700" : "500"} fontFamily="sans-serif">
                {node.label}
              </text>
            </motion.g>
          );
        })}
      </svg>

      {/* Legend */}
      <div style={{ display:"flex", gap:24, marginTop:14, flexWrap:"wrap" }}>
        {[["Data flow","solid line"],["Signal packet","pink dot"],["Hover node","for details"]].map(([k,v])=>(
          <div key={k} style={{ fontSize:11, color:P.muted, display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ width:16, height:1.5, background:P.pink, display:"inline-block", borderRadius:1 }} />
            <span style={{ color:P.sub }}>{k}</span> <span style={{ color:P.muted }}>— {v}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ─── MODEL CARDS with animated bars ─── */
function ModelCards() {
  const [active, setActive] = useState(0);
  const ref = useRef();
  const inView = useInView(ref, { once:true });

  return (
    <div ref={ref}>
      {/* Selector tabs */}
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:24 }}>
        {MODELS.map((m,i)=>(
          <motion.button key={m.name} onClick={()=>setActive(i)}
            whileHover={{ scale:1.05 }} whileTap={{ scale:0.97 }}
            style={{ padding:"8px 16px", borderRadius:100, fontSize:13, fontWeight:600, cursor:"pointer",
                     border: active===i ? `1px solid ${P.borderPk}` : `1px solid ${P.border}`,
                     background: active===i ? `${P.pink}18` : "rgba(255,255,255,0.03)",
                     color: active===i ? P.rose : P.sub, transition:"all 0.2s" }}>
            {m.name.split(" ")[0]}
          </motion.button>
        ))}
      </div>

      {/* Active model detail */}
      <AnimatePresence mode="wait">
        <motion.div key={active}
          initial={{ opacity:0, y:16, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }}
          exit={{ opacity:0, y:-12, scale:0.97 }} transition={{ duration:0.32, ease:"easeOut" }}
          style={{ background:"rgba(236,72,120,0.05)", border:`1px solid ${P.borderPk}`,
                   borderRadius:20, padding:28 }}>

          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start",
                        flexWrap:"wrap", gap:16, marginBottom:28 }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:8 }}>
                <motion.div animate={{ rotate:[0,360] }} transition={{ duration:8, repeat:Infinity, ease:"linear" }}
                  style={{ width:42, height:42, borderRadius:12, background:`${MODELS[active].color}25`,
                           border:`1px solid ${MODELS[active].color}50`,
                           display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>
                  {MODELS[active].icon}
                </motion.div>
                <div>
                  <div style={{ fontSize:20, fontWeight:800, color:P.text }}>{MODELS[active].name}</div>
                  <div style={{ fontSize:13, color:P.sub }}>{MODELS[active].vendor}</div>
                </div>
              </div>
            </div>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
              {[["Context", MODELS[active].ctx], ["Speed", `${MODELS[active].speed}/100`], ["Quality", `${MODELS[active].quality}/100`]].map(([k,v])=>(
                <div key={k} style={{ background:"rgba(255,255,255,0.04)", border:`1px solid ${P.border}`,
                                      borderRadius:10, padding:"8px 14px", textAlign:"center" }}>
                  <div style={{ fontSize:11, color:P.muted, marginBottom:2 }}>{k}</div>
                  <div style={{ fontSize:14, fontWeight:700, color:P.rose }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Animated stat bars */}
          {[["Speed",MODELS[active].speed,P.pink],["Quality",MODELS[active].quality,P.coral],["Availability",94,P.rose]].map(([label, val, col])=>(
            <div key={label} style={{ marginBottom:18 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:7,
                            fontSize:13, color:P.sub }}>
                <span>{label}</span>
                <motion.span key={`${active}-${label}`}
                  initial={{ opacity:0 }} animate={{ opacity:1 }}
                  style={{ fontWeight:700, color:col }}>{val}%</motion.span>
              </div>
              <div style={{ height:6, background:"rgba(255,255,255,0.06)", borderRadius:6, overflow:"hidden" }}>
                <motion.div
                  key={`${active}-bar-${label}`}
                  initial={{ width:"0%" }} animate={{ width:`${val}%` }}
                  transition={{ duration:0.9, ease:"easeOut", delay:0.1 }}
                  style={{ height:"100%", background:`linear-gradient(90deg, ${col}, ${col}88)`, borderRadius:6,
                           boxShadow:`0 0 8px ${col}60` }} />
              </div>
            </div>
          ))}

          {/* Live token stream preview */}
          <div style={{ marginTop:24, background:"rgba(0,0,0,0.25)", borderRadius:12, padding:16,
                        fontFamily:"monospace", fontSize:12, color:P.sub, position:"relative",
                        border:`1px solid rgba(236,72,120,0.12)` }}>
            <div style={{ fontSize:10, color:P.muted, marginBottom:8, letterSpacing:"0.1em" }}>LIVE STREAM PREVIEW</div>
            <TokenStream model={MODELS[active]} inView={inView} />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Mini model grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(150px,1fr))", gap:10, marginTop:16 }}>
        {MODELS.map((m,i)=>(
          <motion.div key={m.name} onClick={()=>setActive(i)}
            whileHover={{ y:-4, scale:1.03, borderColor:P.borderPk }}
            style={{ background: active===i ? `${P.pink}10` : "rgba(255,255,255,0.025)",
                     border: active===i ? `1px solid ${P.borderPk}` : `1px solid ${P.border}`,
                     borderRadius:14, padding:"14px 16px", cursor:"pointer", transition:"all 0.2s" }}>
            <div style={{ fontSize:14, fontWeight:700, color: active===i ? P.rose : P.text, marginBottom:4 }}>
              {m.name.split(" ").slice(0,2).join(" ")}
            </div>
            <div style={{ fontSize:11, color:P.muted, marginBottom:10 }}>{m.vendor}</div>
            <div style={{ height:3, background:"rgba(255,255,255,0.06)", borderRadius:3 }}>
              <motion.div initial={{ width:0 }} animate={{ width: inView ? `${m.quality}%` : 0 }}
                transition={{ duration:1, delay:i*0.1 }}
                style={{ height:"100%", background:m.color, borderRadius:3 }} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function TokenStream({ model, inView }) {
  const responses = {
    "GPT-4o": "I can help you with code, analysis, creative writing, math, and much more. What would you like to explore today?",
    "Claude 3.5 Sonnet": "I'm here to assist with thoughtful, nuanced responses. I excel at reasoning, coding, and long-form analysis.",
    "Gemini 1.5 Pro": "With my 1M token context window, I can process entire codebases, books, or datasets in a single conversation.",
    "Llama 3 70B": "As an open-source model, I offer flexibility and can be self-hosted for full data privacy and control.",
    "Mistral Large": "Built for enterprise use cases, I balance speed and quality for production deployments at scale.",
    "DeepSeek V2": "Optimized for coding and technical tasks, I deliver expert-level software engineering assistance.",
  };
  const text = responses[model.name] || "Hello! How can I assist you today?";
  const words = text.split(" ");
  const [shown, setShown] = useState(0);

  useEffect(() => {
    setShown(0);
    if (!inView) return;
    const t = setTimeout(() => {
      const interval = setInterval(() => setShown(p => {
        if (p >= words.length) { clearInterval(interval); return p; }
        return p + 1;
      }), 60);
      return () => clearInterval(interval);
    }, 200);
    return () => clearTimeout(t);
  }, [model.name, inView]);

  return (
    <span style={{ lineHeight:1.7 }}>
      <span style={{ color:P.pink, marginRight:6 }}>{model.name}:</span>
      {words.slice(0,shown).map((w,i)=>(
        <motion.span key={i} initial={{ opacity:0 }} animate={{ opacity:1 }}
          transition={{ duration:0.15 }} style={{ marginRight:"4px" }}>{w}</motion.span>
      ))}
      {shown < words.length && (
        <motion.span animate={{ opacity:[1,0,1] }} transition={{ duration:0.5, repeat:Infinity }}
          style={{ display:"inline-block", width:6, height:12, background:P.pink,
                   verticalAlign:"middle", borderRadius:1, marginLeft:2 }} />
      )}
    </span>
  );
}

/* ─── FLOW DIAGRAM (how it works) ─── */
function FlowDiagram() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep(p => (p+1)%5), 1800);
    return () => clearInterval(t);
  }, []);

  const steps = [
    { icon:"💬", label:"User types query",     color:P.pink   },
    { icon:"🔒", label:"Auth & rate limit",    color:P.coral  },
    { icon:"🔀", label:"Model Router selects", color:P.rose   },
    { icon:"🌐", label:"OpenRouter API call",  color:P.gold   },
    { icon:"🌊", label:"Stream to browser",    color:P.pink   },
  ];

  return (
    <motion.div initial={{ opacity:0, y:40 }} whileInView={{ opacity:1, y:0 }}
      viewport={{ once:true }} transition={{ duration:0.8 }}
      style={{ background:"rgba(236,72,120,0.04)", border:`1px solid ${P.borderPk}`,
               borderRadius:22, padding:28 }}>
      <div style={{ fontSize:12, color:P.pink, fontWeight:700, letterSpacing:"0.12em",
                    textTransform:"uppercase", marginBottom:24 }}>Request Flow</div>

      <div style={{ display:"flex", alignItems:"center", gap:0, overflowX:"auto", paddingBottom:8 }}>
        {steps.map((s,i)=>(
          <div key={i} style={{ display:"flex", alignItems:"center", flexShrink:0 }}>
            <motion.div
              animate={{
                background: step===i ? `${s.color}28` : "rgba(255,255,255,0.04)",
                borderColor: step===i ? s.color : "rgba(255,255,255,0.1)",
                scale: step===i ? 1.08 : 1,
              }}
              transition={{ duration:0.35 }}
              style={{ border:`1.5px solid rgba(255,255,255,0.1)`, borderRadius:16,
                       padding:"14px 16px", textAlign:"center", minWidth:100, position:"relative" }}>

              {step===i && (
                <motion.div
                  style={{ position:"absolute", inset:-1, borderRadius:16, border:`1.5px solid ${s.color}`,
                           boxShadow:`0 0 18px ${s.color}55` }}
                  animate={{ opacity:[0.5,1,0.5] }} transition={{ duration:0.9, repeat:Infinity }} />
              )}

              <motion.div style={{ fontSize:24, marginBottom:6 }}
                animate={{ rotate: step===i ? [0,-8,8,0] : 0 }}
                transition={{ duration:0.4 }}>{s.icon}</motion.div>
              <div style={{ fontSize:11, color: step===i ? s.color : P.sub,
                            fontWeight: step===i ? 700 : 500, lineHeight:1.4 }}>{s.label}</div>

              {step===i && (
                <motion.div style={{ width:6, height:6, borderRadius:"50%", background:s.color,
                                     margin:"8px auto 0", boxShadow:`0 0 8px ${s.color}` }}
                  animate={{ scale:[1,1.6,1] }} transition={{ duration:0.7, repeat:Infinity }} />
              )}
            </motion.div>

            {i < steps.length-1 && (
              <div style={{ width:32, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <motion.div
                  animate={{ opacity: step===i ? 1 : 0.25, scaleX: step===i ? 1.2 : 1 }}
                  style={{ fontSize:16, color:P.pink }}>→</motion.div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Step description */}
      <AnimatePresence mode="wait">
        <motion.div key={step}
          initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }}
          exit={{ opacity:0, x:-10 }} transition={{ duration:0.25 }}
          style={{ marginTop:18, padding:"12px 16px", background:"rgba(0,0,0,0.2)",
                   borderRadius:10, fontSize:13, color:P.sub,
                   borderLeft:`3px solid ${steps[step].color}` }}>
          Step {step+1} of 5 — <span style={{ color:P.rose, fontWeight:600 }}>{steps[step].label}</span>
          {[
            " — Your message is captured and sent securely over HTTPS.",
            " — JWT token validated; rate limits enforced per user tier.",
            " — The model router picks the optimal AI based on your config.",
            " — Encrypted request dispatched to OpenRouter's inference API.",
            " — Tokens stream back in real-time via Server-Sent Events.",
          ][step]}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── MAIN COMPONENT ─── */
export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState(null);
  const [hovCard, setHovCard] = useState(null);
  const { scrollY } = useScroll();
  const navBg   = useTransform(scrollY, [0,80],  ["rgba(11,5,7,0)","rgba(11,5,7,0.97)"]);
  const heroY   = useTransform(scrollY, [0,500], [0,-100]);
  const heroOpa = useTransform(scrollY, [0,380], [1,0]);

  const particles = Array.from({length:18},(_,i)=>({
    x:Math.random()*100, y:Math.random()*100,
    size:Math.random()*5+2, dur:Math.random()*4+3, delay:Math.random()*5,
    color:[P.pink,P.coral,P.rose,P.gold][i%4],
  }));

  return (
    <div style={{ minHeight:"100vh", background:P.bg, color:P.text, overflowX:"hidden",
                  fontFamily:"'DM Sans','Outfit',sans-serif" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700;800;900&family=Playfair+Display:ital,wght@0,700;0,900;1,700&display=swap');
        html{scroll-behavior:smooth}*{margin:0;padding:0;box-sizing:border-box}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-track{background:#0b0507}
        ::-webkit-scrollbar-thumb{background:#ec4899;border-radius:3px}
      `}</style>

      {/* ── NAV ── */}
      <motion.nav style={{ position:"fixed", top:0, insetInline:0, zIndex:50, backgroundColor:navBg,
                           backdropFilter:"blur(24px)", borderBottom:"1px solid rgba(236,72,120,0.1)" }}>
        <div style={{ maxWidth:1280, margin:"0 auto", padding:"0 28px", height:64,
                      display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <motion.a href="/" whileHover={{ scale:1.04 }}
            style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none",
                     fontWeight:900, fontSize:21, color:P.text }}>
            <motion.div style={{ width:36, height:36, borderRadius:10, background:P.grad,
                                 display:"flex", alignItems:"center", justifyContent:"center" }}
              animate={{ rotate:[0,360] }} transition={{ duration:9, repeat:Infinity, ease:"linear" }}>
              <span style={{ fontSize:17 }}>✦</span>
            </motion.div>
            <span style={{ background:P.grad, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>AduraAI</span>
          </motion.a>

          <div style={{ display:"flex", gap:32, fontSize:14, color:P.sub }}>
            {["Features","Models","Pricing","FAQ"].map((l,i)=>(
              <motion.a key={l} href={`#${l.toLowerCase()}`}
                style={{ textDecoration:"none", color:"inherit" }}
                whileHover={{ color:P.pink, y:-2 }}
                initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
                transition={{ delay:i*0.07 }}>{l}</motion.a>
            ))}
          </div>

          <div style={{ display:"flex", gap:12 }}>
            <motion.a href="/auth/login" whileHover={{ scale:1.04, borderColor:P.borderPk, color:P.pink }}
              style={{ padding:"8px 20px", borderRadius:9, border:`1px solid ${P.border}`,
                       background:"transparent", color:P.sub, fontSize:14, textDecoration:"none",
                       transition:"all 0.2s" }}>Login</motion.a>
            <motion.a href="/auth/register"
              whileHover={{ scale:1.04, boxShadow:`0 0 28px ${P.pink}55` }} whileTap={{ scale:0.97 }}
              style={{ padding:"8px 20px", borderRadius:9, background:P.grad, color:"white",
                       fontSize:14, textDecoration:"none", fontWeight:700 }}>Get Started →</motion.a>
          </div>
        </div>
      </motion.nav>

      {/* ── HERO ── */}
      <section style={{ paddingTop:148, paddingBottom:100, paddingInline:24, position:"relative",
                        overflow:"hidden", minHeight:"100vh", display:"flex", alignItems:"center" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 80% 55% at 50% -5%, rgba(236,72,120,0.14), transparent 70%)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", inset:0, backgroundImage:`linear-gradient(${P.pink}05 1px,transparent 1px),linear-gradient(90deg,${P.pink}05 1px,transparent 1px)`, backgroundSize:"60px 60px" }} />
        {particles.map((p,i)=><Particle key={i} {...p} />)}

        {/* Orbits */}
        <div style={{ position:"absolute", right:"4%", top:"15%", width:320, height:320 }}>
          <OrbitRing size={200} dur={12} delay={0}  dotColor={P.pink} />
          <OrbitRing size={290} dur={19} delay={-6} dotColor={P.coral} />
        </div>

        <motion.div style={{ maxWidth:940, margin:"0 auto", textAlign:"center",
                             position:"relative", y:heroY, opacity:heroOpa }}>

          {/* Badge */}
          <motion.div initial={{ opacity:0, scale:0.75, y:24 }} animate={{ opacity:1, scale:1, y:0 }}
            transition={{ duration:0.6, type:"spring" }}
            style={{ display:"inline-flex", alignItems:"center", gap:8,
                     background:"rgba(236,72,120,0.09)", border:`1px solid ${P.borderPk}`,
                     borderRadius:100, padding:"8px 22px", fontSize:13, color:P.rose, marginBottom:44 }}>
            <motion.span animate={{ scale:[1,1.5,1] }} transition={{ duration:1.4, repeat:Infinity }}
              style={{ width:8, height:8, borderRadius:"50%", background:P.pink, display:"inline-block" }} />
            Production-Ready AI Chat Platform
          </motion.div>

          <h1 style={{ fontSize:"clamp(42px,7.5vw,88px)", fontWeight:900, lineHeight:1.08,
                       marginBottom:30, letterSpacing:"-0.035em", fontFamily:"'Playfair Display',serif" }}>
            {"Chat with the world's".split(" ").map((w,i)=>(
              <motion.span key={i} initial={{ opacity:0, y:44, rotateX:-30 }} animate={{ opacity:1, y:0, rotateX:0 }}
                transition={{ delay:0.25+i*0.1, duration:0.65, type:"spring", stiffness:130 }}
                style={{ display:"inline-block", marginRight:"0.22em" }}>{w}</motion.span>
            ))}
            <br />
            <motion.span initial={{ opacity:0, scale:0.85 }} animate={{ opacity:1, scale:1 }}
              transition={{ delay:0.85, duration:0.8, type:"spring" }}
              style={{ background:`linear-gradient(90deg,${P.pink},${P.coral},${P.rose},${P.pink})`,
                       backgroundSize:"250% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
                       display:"inline-block" }}>
              <motion.span animate={{ backgroundPosition:["0% center","250% center"] }}
                transition={{ duration:3.5, repeat:Infinity, ease:"linear" }}
                style={{ display:"inherit", WebkitBackgroundClip:"inherit", WebkitTextFillColor:"inherit",
                         background:"inherit", backgroundSize:"inherit" }}>best AI models</motion.span>
            </motion.span>
          </h1>

          <motion.p initial={{ opacity:0, y:22 }} animate={{ opacity:1, y:0 }} transition={{ delay:1.1 }}
            style={{ fontSize:18, color:P.sub, marginBottom:52, maxWidth:540, margin:"0 auto 52px", lineHeight:1.7 }}>
            The most powerful open-source AI chat platform. Stream responses, switch models, build faster.
          </motion.p>

          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:1.3 }}
            style={{ display:"flex", gap:16, justifyContent:"center", flexWrap:"wrap" }}>
            <motion.a href="/auth/register"
              whileHover={{ scale:1.06, boxShadow:`0 0 44px ${P.pink}60` }} whileTap={{ scale:0.97 }}
              style={{ padding:"15px 36px", borderRadius:13, background:P.grad, color:"white",
                       fontSize:16, fontWeight:800, textDecoration:"none", display:"flex", alignItems:"center" }}>
              <motion.span animate={{ x:[0,5,0] }} transition={{ duration:1.6, repeat:Infinity }}>Start chatting free →</motion.span>
            </motion.a>
            <motion.a href="https://github.com/Ayush-Panda-design/AI-CHAT_CLONE"
              whileHover={{ scale:1.05, borderColor:P.borderPk, color:P.rose }}
              style={{ padding:"15px 36px", borderRadius:13, border:`1px solid ${P.border}`,
                       background:"rgba(255,255,255,0.03)", color:P.sub, fontSize:16, fontWeight:600,
                       textDecoration:"none", transition:"all 0.2s" }}>View on GitHub</motion.a>
          </motion.div>

          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.6 }}
            style={{ display:"flex", gap:52, justifyContent:"center", marginTop:68, fontSize:14, color:P.muted }}>
            {[["100+","AI Models"],["50k+","Developers"],["99.9%","Uptime"]].map(([n,l])=>(
              <div key={l} style={{ textAlign:"center" }}>
                <motion.div whileHover={{ scale:1.12 }}
                  style={{ fontSize:30, fontWeight:900, background:P.grad,
                           WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", marginBottom:4 }}>{n}</motion.div>
                <div>{l}</div>
              </div>
            ))}
          </motion.div>

          {/* Chat preview */}
          <motion.div initial={{ opacity:0, y:80, rotateX:18 }} animate={{ opacity:1, y:0, rotateX:0 }}
            transition={{ duration:1.1, delay:0.55, type:"spring", stiffness:70 }}
            style={{ marginTop:84, perspective:1000 }}>
            <motion.div whileHover={{ y:-10, boxShadow:`0 32px 90px ${P.pink}22` }}
              transition={{ type:"spring", stiffness:200 }}
              style={{ background:"rgba(255,255,255,0.025)", borderRadius:22,
                       border:`1px solid ${P.borderPk}`, overflow:"hidden",
                       boxShadow:`0 0 60px ${P.pink}12` }}>
              <div style={{ background:"rgba(255,255,255,0.03)", borderBottom:`1px solid ${P.border}`,
                            padding:"13px 18px", display:"flex", alignItems:"center", gap:14 }}>
                <div style={{ display:"flex", gap:7 }}>
                  {["#f43f5e","#fb923c","#4ade80"].map((c,i)=>(
                    <motion.div key={i} style={{ width:12, height:12, borderRadius:"50%", background:c, opacity:0.75 }}
                      whileHover={{ opacity:1, scale:1.35 }} />
                  ))}
                </div>
                <span style={{ fontSize:12, color:P.muted, fontFamily:"monospace" }}>AduraAI – GPT-4o</span>
                <motion.div animate={{ opacity:[0.3,1,0.3] }} transition={{ duration:2, repeat:Infinity }}
                  style={{ marginLeft:"auto", width:8, height:8, borderRadius:"50%", background:"#4ade80" }} />
              </div>
              <div style={{ padding:26, display:"flex", flexDirection:"column", gap:18, minHeight:200, textAlign:"left" }}>
                <motion.div style={{ display:"flex", gap:13 }}
                  initial={{ opacity:0, x:-22 }} animate={{ opacity:1, x:0 }} transition={{ delay:1.6 }}>
                  <div style={{ width:38, height:38, borderRadius:"50%", background:`${P.pink}22`, display:"flex",
                                alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:13,
                                flexShrink:0, color:P.rose }}>U</div>
                  <div style={{ background:`${P.pink}12`, border:`1px solid ${P.pink}20`,
                                borderRadius:"16px 16px 16px 4px", padding:"11px 18px", fontSize:14,
                                maxWidth:380, color:P.text }}>
                    Explain quantum entanglement in simple terms
                  </div>
                </motion.div>
                <motion.div style={{ display:"flex", gap:13 }}
                  initial={{ opacity:0, x:-22 }} animate={{ opacity:1, x:0 }} transition={{ delay:1.95 }}>
                  <motion.div style={{ width:38, height:38, borderRadius:"50%", background:`${P.pink}18`,
                                       border:`1px solid ${P.borderPk}`, display:"flex", alignItems:"center",
                                       justifyContent:"center", flexShrink:0, fontSize:17 }}
                    animate={{ boxShadow:[`0 0 0px ${P.pink}00`,`0 0 18px ${P.pink}55`,`0 0 0px ${P.pink}00`] }}
                    transition={{ duration:2.2, repeat:Infinity }}>✦</motion.div>
                  <div style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${P.border}`,
                                borderRadius:"16px 16px 16px 4px", padding:"11px 18px",
                                fontSize:14, maxWidth:500, lineHeight:1.7, color:P.text }}>
                    <TypingText words={CHAT_WORDS} />
                  </div>
                </motion.div>
              </div>
              <div style={{ borderTop:`1px solid ${P.border}`, padding:"13px 18px",
                            display:"flex", gap:12, alignItems:"center" }}>
                <div style={{ flex:1, background:"rgba(255,255,255,0.04)", border:`1px solid ${P.border}`,
                              borderRadius:11, padding:"10px 15px", fontSize:14, color:P.muted }}>Ask anything...</div>
                <motion.div whileHover={{ scale:1.12, boxShadow:`0 0 16px ${P.pink}70` }}
                  style={{ width:40, height:40, borderRadius:11, background:P.grad,
                           display:"flex", alignItems:"center", justifyContent:"center",
                           cursor:"pointer", fontSize:16, fontWeight:700 }}>↑</motion.div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div animate={{ y:[0,12,0] }} transition={{ duration:2.2, repeat:Infinity }}
          style={{ position:"absolute", bottom:38, left:"50%", transform:"translateX(-50%)",
                   color:P.muted, fontSize:22 }}>↓</motion.div>
      </section>

      {/* ── HOW IT WORKS (Flow diagram) ── */}
      <section style={{ padding:"100px 24px", borderTop:`1px solid ${P.border}` }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <motion.div initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
            style={{ textAlign:"center", marginBottom:56 }}>
            <div style={{ fontSize:12, color:P.pink, fontWeight:700, letterSpacing:"0.13em",
                          textTransform:"uppercase", marginBottom:12 }}>HOW IT WORKS</div>
            <h2 style={{ fontSize:"clamp(30px,4.5vw,52px)", fontWeight:900, letterSpacing:"-0.03em",
                         fontFamily:"'Playfair Display',serif" }}>Request lifecycle</h2>
            <p style={{ color:P.sub, marginTop:12, fontSize:17 }}>Watch your message travel from keyboard to AI response</p>
          </motion.div>
          <FlowDiagram />
        </div>
      </section>

      {/* ── ARCHITECTURE ── */}
      <section style={{ padding:"100px 24px", background:"rgba(236,72,120,0.015)",
                        borderTop:`1px solid ${P.border}`, borderBottom:`1px solid ${P.border}` }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <motion.div initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
            style={{ textAlign:"center", marginBottom:56 }}>
            <div style={{ fontSize:12, color:P.pink, fontWeight:700, letterSpacing:"0.13em",
                          textTransform:"uppercase", marginBottom:12 }}>ARCHITECTURE</div>
            <h2 style={{ fontSize:"clamp(30px,4.5vw,52px)", fontWeight:900, letterSpacing:"-0.03em",
                         fontFamily:"'Playfair Display',serif" }}>System architecture</h2>
            <p style={{ color:P.sub, marginTop:12, fontSize:17 }}>Hover nodes to explore — watch packets travel live</p>
          </motion.div>
          <ArchDiagram />
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding:"120px 24px", position:"relative", overflow:"hidden" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <motion.div initial={{ opacity:0, y:40 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
            style={{ textAlign:"center", marginBottom:72 }}>
            <div style={{ fontSize:12, color:P.pink, fontWeight:700, letterSpacing:"0.13em",
                          textTransform:"uppercase", marginBottom:12 }}>FEATURES</div>
            <h2 style={{ fontSize:"clamp(32px,5vw,56px)", fontWeight:900, marginBottom:14,
                         letterSpacing:"-0.03em", fontFamily:"'Playfair Display',serif" }}>Everything you need</h2>
            <p style={{ color:P.sub, fontSize:18 }}>Built for developers and power users alike</p>
          </motion.div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:22 }}>
            {FEATURES.map((f,i)=>(
              <motion.div key={f.title}
                initial={{ opacity:0, y:44 }} whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }} transition={{ delay:i*0.11 }}
                whileHover={{ y:-9, scale:1.025 }}
                onHoverStart={()=>setHovCard(i)} onHoverEnd={()=>setHovCard(null)}
                style={{ background:hovCard===i ? P.bgCard2 : P.bgCard,
                         border:`1px solid ${hovCard===i ? P.borderPk : P.border}`,
                         borderRadius:22, padding:30, cursor:"default",
                         transition:"background 0.3s,border-color 0.3s", position:"relative", overflow:"hidden" }}>
                <motion.div style={{ position:"absolute", inset:0,
                                     background:`radial-gradient(circle at 50% -10%,${f.accent}10,transparent 65%)`,
                                     pointerEvents:"none" }}
                  animate={{ opacity:hovCard===i ? 1 : 0 }} />
                <motion.div style={{ width:54, height:54, borderRadius:15, background:`${f.accent}18`,
                                     border:`1px solid ${f.accent}35`, display:"flex", alignItems:"center",
                                     justifyContent:"center", marginBottom:22, fontSize:23 }}
                  whileHover={{ rotate:[0,-12,12,0], scale:1.12 }} transition={{ duration:0.35 }}>
                  {f.icon}
                </motion.div>
                <h3 style={{ fontWeight:800, fontSize:17, marginBottom:10, color:P.text }}>{f.title}</h3>
                <p style={{ fontSize:14, color:P.sub, lineHeight:1.75 }}>{f.desc}</p>
                <motion.div style={{ height:2, background:`linear-gradient(90deg,${f.accent},transparent)`,
                                     borderRadius:1, marginTop:22, originX:0 }}
                  initial={{ scaleX:0 }} whileInView={{ scaleX:1 }} viewport={{ once:true }}
                  transition={{ delay:0.35+i*0.1, duration:0.65 }} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MODELS (animated interactive cards) ── */}
      <section id="models" style={{ padding:"120px 24px", borderTop:`1px solid ${P.border}`,
                                    borderBottom:`1px solid ${P.border}`,
                                    background:"rgba(236,72,120,0.015)" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <motion.div initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
            style={{ textAlign:"center", marginBottom:56 }}>
            <div style={{ fontSize:12, color:P.pink, fontWeight:700, letterSpacing:"0.13em",
                          textTransform:"uppercase", marginBottom:12 }}>MODELS</div>
            <h2 style={{ fontSize:"clamp(32px,5vw,56px)", fontWeight:900, marginBottom:14,
                         letterSpacing:"-0.03em", fontFamily:"'Playfair Display',serif" }}>100+ AI Models</h2>
            <p style={{ color:P.sub, fontSize:18 }}>Click any model to explore speed, quality & live token preview</p>
          </motion.div>
          <ModelCards />
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding:"120px 24px" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <motion.div initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
            style={{ textAlign:"center", marginBottom:72 }}>
            <div style={{ fontSize:12, color:P.pink, fontWeight:700, letterSpacing:"0.13em",
                          textTransform:"uppercase", marginBottom:12 }}>TESTIMONIALS</div>
            <h2 style={{ fontSize:"clamp(32px,5vw,56px)", fontWeight:900, letterSpacing:"-0.03em",
                         fontFamily:"'Playfair Display',serif" }}>Loved by developers</h2>
          </motion.div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:22 }}>
            {TESTIMONIALS.map((t,i)=>(
              <motion.div key={t.name}
                initial={{ opacity:0, y:44, rotateY:-14 }} whileInView={{ opacity:1, y:0, rotateY:0 }}
                viewport={{ once:true }} transition={{ delay:i*0.14, duration:0.7, type:"spring" }}
                whileHover={{ y:-7, scale:1.02 }}
                style={{ background:P.bgCard, border:`1px solid ${P.border}`, borderRadius:22, padding:30 }}>
                <div style={{ display:"flex", gap:3, marginBottom:20 }}>
                  {Array(5).fill(0).map((_,j)=>(
                    <motion.span key={j} initial={{ opacity:0, scale:0 }}
                      whileInView={{ opacity:1, scale:1 }} viewport={{ once:true }}
                      transition={{ delay:0.28+i*0.08+j*0.06 }} style={{ color:P.rose, fontSize:17 }}>★</motion.span>
                  ))}
                </div>
                <p style={{ color:P.sub, fontSize:15, lineHeight:1.8, marginBottom:26, fontStyle:"italic" }}>"{t.text}"</p>
                <div style={{ display:"flex", alignItems:"center", gap:13 }}>
                  <motion.div whileHover={{ scale:1.1 }}
                    style={{ width:42, height:42, borderRadius:"50%", background:P.grad, display:"flex",
                             alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:13 }}>{t.avatar}</motion.div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:15 }}>{t.name}</div>
                    <div style={{ fontSize:13, color:P.muted }}>{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ padding:"120px 24px", borderTop:`1px solid ${P.border}`,
                                     borderBottom:`1px solid ${P.border}`,
                                     background:"rgba(236,72,120,0.015)" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <motion.div initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
            style={{ textAlign:"center", marginBottom:72 }}>
            <div style={{ fontSize:12, color:P.pink, fontWeight:700, letterSpacing:"0.13em",
                          textTransform:"uppercase", marginBottom:12 }}>PRICING</div>
            <h2 style={{ fontSize:"clamp(32px,5vw,56px)", fontWeight:900, letterSpacing:"-0.03em",
                         fontFamily:"'Playfair Display',serif" }}>Simple pricing</h2>
          </motion.div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:22 }}>
            {PRICING.map((p,i)=>(
              <motion.div key={p.name}
                initial={{ opacity:0, y:60, scale:0.88 }} whileInView={{ opacity:1, y:0, scale:1 }}
                viewport={{ once:true }} transition={{ delay:i*0.13, type:"spring", stiffness:95 }}
                whileHover={{ y:-9, scale:p.popular ? 1.04 : 1.02 }}
                style={{ position:"relative",
                         background:p.popular ? "rgba(236,72,120,0.08)" : P.bgCard,
                         border:p.popular ? `2px solid ${P.borderPk}` : `1px solid ${P.border}`,
                         borderRadius:26, padding:38, display:"flex", flexDirection:"column",
                         boxShadow:p.popular ? `0 0 70px ${P.pink}18` : "none" }}>
                {p.popular && (
                  <motion.div initial={{ opacity:0, y:-12 }} animate={{ opacity:1, y:0 }}
                    style={{ position:"absolute", top:-15, left:"50%", transform:"translateX(-50%)",
                             background:P.grad, color:"white", fontSize:11, fontWeight:800,
                             padding:"5px 16px", borderRadius:100, whiteSpace:"nowrap",
                             letterSpacing:"0.06em" }}>✦ MOST POPULAR</motion.div>
                )}
                <div style={{ marginBottom:30 }}>
                  <div style={{ fontSize:14, color:P.sub, marginBottom:10, fontWeight:600 }}>{p.name}</div>
                  <div style={{ display:"flex", alignItems:"baseline", gap:4 }}>
                    <span style={{ fontSize:56, fontWeight:900, letterSpacing:"-0.04em",
                                   background:p.popular ? P.grad : "none",
                                   WebkitBackgroundClip:p.popular ? "text" : "none",
                                   WebkitTextFillColor:p.popular ? "transparent" : P.text }}>{p.price}</span>
                    <span style={{ color:P.muted, fontSize:16 }}>/mo</span>
                  </div>
                </div>
                <ul style={{ listStyle:"none", padding:0, margin:"0 0 34px", flex:1,
                             display:"flex", flexDirection:"column", gap:14 }}>
                  {p.features.map((f,j)=>(
                    <motion.li key={f} initial={{ opacity:0, x:-10 }}
                      whileInView={{ opacity:1, x:0 }} viewport={{ once:true }}
                      transition={{ delay:0.2+j*0.08 }}
                      style={{ display:"flex", alignItems:"center", gap:12, fontSize:14, color:P.sub }}>
                      <span style={{ width:20, height:20, borderRadius:"50%",
                                     background:p.popular ? `${P.pink}22` : "rgba(255,255,255,0.05)",
                                     display:"flex", alignItems:"center", justifyContent:"center",
                                     fontSize:10, color:p.popular ? P.pink : P.muted, flexShrink:0 }}>✓</span>
                      {f}
                    </motion.li>
                  ))}
                </ul>
                <motion.a href="/auth/register"
                  whileHover={{ scale:1.04, boxShadow:p.popular ? `0 0 34px ${P.pink}55` : "none" }}
                  whileTap={{ scale:0.97 }}
                  style={{ display:"block", textAlign:"center", padding:"15px", borderRadius:13,
                           background:p.popular ? P.grad : "rgba(255,255,255,0.05)",
                           border:p.popular ? "none" : `1px solid ${P.border}`,
                           color:"white", fontSize:15, fontWeight:700, textDecoration:"none",
                           cursor:"pointer" }}>Get started</motion.a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ padding:"120px 24px" }}>
        <div style={{ maxWidth:760, margin:"0 auto" }}>
          <motion.div initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
            style={{ textAlign:"center", marginBottom:72 }}>
            <div style={{ fontSize:12, color:P.pink, fontWeight:700, letterSpacing:"0.13em",
                          textTransform:"uppercase", marginBottom:12 }}>FAQ</div>
            <h2 style={{ fontSize:"clamp(32px,5vw,56px)", fontWeight:900, letterSpacing:"-0.03em",
                         fontFamily:"'Playfair Display',serif" }}>Frequently asked questions</h2>
          </motion.div>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {FAQS.map((f,i)=>(
              <motion.div key={i} initial={{ opacity:0, y:22 }} whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }} transition={{ delay:i*0.09 }}
                style={{ background:P.bgCard,
                         border:`1px solid ${openFaq===i ? P.borderPk : P.border}`,
                         borderRadius:16, overflow:"hidden", transition:"border-color 0.3s" }}>
                <motion.button onClick={()=>setOpenFaq(openFaq===i ? null : i)}
                  whileHover={{ backgroundColor:"rgba(236,72,120,0.05)" }}
                  style={{ width:"100%", padding:"22px 26px", display:"flex", justifyContent:"space-between",
                           alignItems:"center", background:"none", border:"none", color:P.text,
                           fontSize:16, fontWeight:700, cursor:"pointer", textAlign:"left" }}>
                  {f.q}
                  <motion.span animate={{ rotate:openFaq===i ? 180 : 0 }}
                    transition={{ type:"spring", stiffness:220 }}
                    style={{ fontSize:19, color:P.pink, flexShrink:0, marginLeft:16 }}>⌄</motion.span>
                </motion.button>
                <AnimatePresence>
                  {openFaq===i && (
                    <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }}
                      exit={{ height:0, opacity:0 }} transition={{ duration:0.3, ease:"easeInOut" }}
                      style={{ overflow:"hidden" }}>
                      <p style={{ padding:"0 26px 22px", color:P.sub, fontSize:15, lineHeight:1.78, margin:0 }}>{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding:"80px 24px" }}>
        <motion.div initial={{ opacity:0, scale:0.93 }} whileInView={{ opacity:1, scale:1 }} viewport={{ once:true }}
          style={{ maxWidth:920, margin:"0 auto", textAlign:"center",
                   background:`linear-gradient(135deg,${P.pink}10,${P.coral}08)`,
                   border:`1px solid ${P.borderPk}`, borderRadius:30, padding:"80px 44px",
                   position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", inset:0, background:`radial-gradient(ellipse 65% 50% at 50% 110%,${P.pink}10,transparent)`, pointerEvents:"none" }} />
          <motion.div animate={{ rotate:[0,360] }} transition={{ duration:30, repeat:Infinity, ease:"linear" }}
            style={{ position:"absolute", fontSize:260, color:`${P.pink}04`, top:-60, right:-60,
                     fontFamily:"serif", pointerEvents:"none", lineHeight:1 }}>✦</motion.div>
          {particles.slice(0,8).map((p,i)=><Particle key={i} {...p} color={i%2===0?P.pink:P.coral} />)}

          <div style={{ fontSize:"clamp(28px,4.5vw,52px)", fontWeight:900, marginBottom:20,
                        letterSpacing:"-0.035em", fontFamily:"'Playfair Display',serif", position:"relative" }}>
            {"Ready to ship faster?".split(" ").map((w,i)=>(
              <motion.span key={i} initial={{ opacity:0, y:22 }} whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }} transition={{ delay:i*0.1 }}
                style={{ display:"inline-block", marginRight:"0.22em" }}>{w}</motion.span>
            ))}
          </div>
          <p style={{ color:P.sub, fontSize:18, marginBottom:44, position:"relative" }}>Join 50,000+ developers already using AduraAI.</p>
          <motion.a href="/auth/register"
            whileHover={{ scale:1.07, boxShadow:`0 0 55px ${P.pink}65` }} whileTap={{ scale:0.97 }}
            style={{ display:"inline-flex", alignItems:"center", gap:10, padding:"17px 44px",
                     borderRadius:15, background:P.grad, color:"white", fontSize:18, fontWeight:800,
                     textDecoration:"none", position:"relative" }}>
            <motion.span animate={{ x:[0,7,0] }} transition={{ duration:1.6, repeat:Infinity }}>Start for free →</motion.span>
          </motion.a>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop:`1px solid ${P.border}`, padding:"52px 24px" }}>
        <div style={{ maxWidth:1200, margin:"0 auto", display:"flex", flexWrap:"wrap",
                      alignItems:"center", justifyContent:"space-between", gap:24,
                      fontSize:14, color:P.muted }}>
          <motion.div whileHover={{ scale:1.05 }}
            style={{ display:"flex", alignItems:"center", gap:10, fontWeight:900, fontSize:19, color:P.text }}>
            <div style={{ width:30, height:30, borderRadius:9, background:P.grad,
                          display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>✦</div>
            AduraAI
          </motion.div>
          <div style={{ display:"flex", gap:28 }}>
            {["Privacy","Terms","GitHub","Docs"].map(l=>(
              <motion.a key={l} href="#" whileHover={{ color:P.pink, y:-2 }}
                style={{ textDecoration:"none", color:"inherit", transition:"color 0.2s" }}>{l}</motion.a>
            ))}
          </div>
          <div>© 2026 AduraAI. MIT License.</div>
        </div>
      </footer>
    </div>
  );
}
