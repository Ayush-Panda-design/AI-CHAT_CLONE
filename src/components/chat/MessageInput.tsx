"use client";
import { useState, useRef, useCallback } from "react";
import { Send, Square, Paperclip, Mic, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onSend: (message: string, image?: string) => void;
  isStreaming: boolean;
  onAbort: () => void;
}

export function MessageInput({ onSend, isStreaming, onAbort }: Props) {
  const [value, setValue] = useState("");
  const [imageData, setImageData] = useState<string>("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function adjustHeight() {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`;
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      import("sonner").then(({ toast }) => toast.error("Please select an image file"));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      import("sonner").then(({ toast }) => toast.error("Image must be less than 2MB"));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === "string") {
        setImageData(e.target.result);
      }
    };
    reader.readAsDataURL(file);
    
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleSend() {
    if ((!value.trim() && !imageData) || isStreaming) return;
    onSend(value.trim(), imageData || undefined);
    setValue("");
    setImageData("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="p-4 border-t border-border bg-background/80 backdrop-blur-sm">
      <div className="max-w-3xl mx-auto">
        <div className={cn(
          "flex items-end gap-3 rounded-2xl border bg-card px-4 py-3 transition-colors",
          "focus-within:border-cyan-500/50 border-border"
        )}>
          <div className="flex-1 flex flex-col min-w-0">
            {imageData && (
              <div className="relative w-16 h-16 mb-2 rounded-lg border border-border overflow-hidden bg-background">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageData} alt="Attachment" className="w-full h-full object-cover" />
                <button
                  onClick={() => setImageData("")}
                  className="absolute top-1 right-1 w-4 h-4 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            <textarea
              ref={textareaRef}
              value={value}
              onChange={e => { setValue(e.target.value); adjustHeight(); }}
              onKeyDown={handleKeyDown}
              placeholder="Message AduraAI... (Shift+Enter for newline)"
              rows={1}
              className="w-full bg-transparent resize-none outline-none text-sm placeholder:text-muted-foreground leading-6 max-h-48 overflow-y-auto"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0 pb-0.5">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <AnimatePresence mode="wait">
              {isStreaming ? (
                <motion.button
                  key="stop"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  onClick={onAbort}
                  className="w-9 h-9 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center justify-center hover:bg-destructive/20 transition-colors"
                >
                  <Square className="w-4 h-4 fill-current" />
                </motion.button>
              ) : (
                <motion.button
                  key="send"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  onClick={handleSend}
                  disabled={!value.trim() && !imageData}
                  className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
                    (value.trim() || imageData)
                      ? "bg-cyan-500 text-black hover:bg-cyan-400 shadow-lg shadow-cyan-500/20"
                      : "bg-secondary text-muted-foreground cursor-not-allowed"
                  )}
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          AduraAI can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}
