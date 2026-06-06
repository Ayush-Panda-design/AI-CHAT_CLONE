"use client";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Copy, Check, RefreshCw, User, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Message } from "@/types";
import "highlight.js/styles/github-dark.css";

interface Props { message: Message; isLast: boolean; isStreaming: boolean; }

export function MessageBubble({ message, isLast, isStreaming }: Props) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  async function copyMessage() {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={cn("flex gap-3 group", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex-shrink-0 flex items-center justify-center mt-1">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
        </div>
      )}

      <div className={cn("max-w-2xl", isUser ? "items-end" : "items-start", "flex flex-col gap-1")}>
        <div className={cn(
          "rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-cyan-500/15 border border-cyan-500/20 text-foreground rounded-br-sm"
            : "bg-card border border-border text-foreground rounded-bl-sm"
        )}>
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose-chat">
              {(() => {
                const text = message.content.trim();
                const isRawImage = text.startsWith("data:image/") || /^https?:\/\/.*?\.(png|jpg|jpeg|gif|webp)(\?.*)?$/i.test(text);
                
                if (isRawImage) {
                  // eslint-disable-next-line @next/next/no-img-element
                  return <img src={text} alt="Generated image" className="rounded-lg max-w-full h-auto" />;
                }

                return (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                    components={{
                      pre({ children, ...props }) {
                        return <CodeBlock>{children}</CodeBlock>;
                      },
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                );
              })()}
              {isStreaming && isLast && (
                <span className="inline-block w-0.5 h-4 bg-cyan-400 ml-0.5 animate-pulse align-middle" />
              )}
            </div>
          )}
        </div>

        {!isUser && !isStreaming && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
            <button onClick={copyMessage}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground bg-secondary rounded-lg px-2 py-1 transition-colors">
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copied ? "Copied" : "Copy"}
            </button>
            {message.model && (
              <span className="text-xs text-muted-foreground bg-secondary rounded-lg px-2 py-1">
                {message.model.split("/").pop()}
              </span>
            )}
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-secondary border border-border flex-shrink-0 flex items-center justify-center mt-1">
          <User className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}

function CodeBlock({ children }: { children: React.ReactNode }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const code = (children as any)?.props?.children as string;
    if (code) {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="relative group/code rounded-lg overflow-hidden border border-border my-3">
      <div className="flex items-center justify-between bg-card px-4 py-2 border-b border-border">
        <span className="text-xs text-muted-foreground font-mono">
          {(children as any)?.props?.className?.replace("hljs language-", "") || "code"}
        </span>
        <button onClick={copy}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto">{children}</pre>
    </div>
  );
}
