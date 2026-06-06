"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, Search, Cpu } from "lucide-react";
import { createPortal } from "react-dom";
import { useModelStore } from "@/store/modelStore";
import { useModels } from "@/hooks/useModels";
import { cn } from "@/lib/utils";

export function ModelSelector() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const { selectedModel, setSelectedModel } = useModelStore();
  const { models, isLoading } = useModels();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Compute dropdown position from button bounding rect
  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const vw = window.innerWidth;

    // Width: on mobile nearly full viewport, on desktop 320px
    const dropdownWidth = vw < 640 ? Math.min(vw - 16, 360) : 320;

    // Left-align with button, but clamp so it doesn't overflow right edge
    let left = rect.left;
    if (left + dropdownWidth > vw - 8) {
      left = vw - dropdownWidth - 8;
    }

    setDropdownStyle({
      position: "fixed",
      top: rect.bottom + 8,
      left,
      width: dropdownWidth,
      zIndex: 9999,
    });
  }, []);

  useEffect(() => {
    if (open) {
      updatePosition();
      window.addEventListener("resize", updatePosition);
      window.addEventListener("scroll", updatePosition, true);
    }
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, updatePosition]);

  // Close on outside tap
  useEffect(() => {
    function handleOutside(e: MouseEvent | TouchEvent) {
      const target = e.target as Node;
      if (buttonRef.current?.contains(target)) return;
      if (dropdownRef.current?.contains(target)) return;
      setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", handleOutside);
      document.addEventListener("touchstart", handleOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, [open]);

  const filtered =
    models?.filter(
      (m) =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.id.toLowerCase().includes(search.toLowerCase())
    ) ?? [];

  const currentModel = models?.find((m) => m.id === selectedModel);

  const dropdown = open ? (
    <div
      ref={dropdownRef}
      style={{ ...dropdownStyle, touchAction: "pan-y" }}
      className="glass border border-border rounded-xl shadow-2xl bg-card"
    >
      <div className="p-2 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search models..."
            className="w-full bg-input border border-border rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-cyan-500"
            autoFocus
          />
        </div>
      </div>
      <div className="max-h-64 overflow-y-auto p-1" style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}>
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="h-10 rounded-lg bg-secondary animate-pulse mb-1" />
          ))
        ) : filtered.length === 0 ? (
          <div className="text-xs text-muted-foreground text-center py-4">No models found</div>
        ) : (
          filtered.map((model) => (
            <button
              key={model.id}
              onClick={() => {
                setSelectedModel(model.id);
                setOpen(false);
              }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm hover:bg-secondary transition-colors text-left",
                selectedModel === model.id && "bg-cyan-500/10 text-cyan-400"
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="font-medium text-xs flex items-center gap-1.5 truncate">
                  {model.name}
                  {(model.id.includes("stable-diffusion") ||
                    model.id.includes("pollinations")) && (
                    <span title="Supports Images">🖼️</span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground truncate">{model.id}</div>
              </div>
              {model.pricing && (
                <div className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                  ${model.pricing.prompt}/1k
                </div>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-xl border border-border bg-secondary px-3 py-2 text-sm hover:border-cyan-500/40 transition-colors max-w-[180px] sm:max-w-xs w-full"
      >
        <Cpu className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
        <span className="truncate flex-1 text-left text-xs sm:text-sm">
          {currentModel?.name ?? selectedModel ?? "Select Model"}
        </span>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 text-muted-foreground transition-transform flex-shrink-0",
            open && "rotate-180"
          )}
        />
      </button>

      {/* Portal: renders outside the header DOM tree, so no overlap with chat */}
      {typeof document !== "undefined" && createPortal(dropdown, document.body)}
    </>
  );
}