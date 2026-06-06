"use client";
import { useState } from "react";
import { ChevronDown, Search, Cpu } from "lucide-react";
import { useModelStore } from "@/store/modelStore";
import { useModels } from "@/hooks/useModels";
import { cn } from "@/lib/utils";

export function ModelSelector() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { selectedModel, setSelectedModel } = useModelStore();
  const { models, isLoading } = useModels();

  const filtered = models?.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.id.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  const currentModel = models?.find(m => m.id === selectedModel);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-xl border border-border bg-secondary px-3 py-2 text-sm hover:border-cyan-500/40 transition-colors"
      >
        <Cpu className="w-3.5 h-3.5 text-cyan-400" />
        <span className="max-w-40 truncate">{currentModel?.name ?? selectedModel ?? "Select Model"}</span>
        <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-80 glass border border-border rounded-xl shadow-xl z-50">
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search models..."
                className="w-full bg-input border border-border rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-cyan-500"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto p-1">
            {isLoading ? (
              [...Array(4)].map((_, i) => <div key={i} className="h-10 rounded-lg bg-secondary animate-pulse mb-1" />)
            ) : filtered.length === 0 ? (
              <div className="text-xs text-muted-foreground text-center py-4">No models found</div>
            ) : (
              filtered.map(model => (
                <button
                  key={model.id}
                  onClick={() => { setSelectedModel(model.id); setOpen(false); }}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm hover:bg-secondary transition-colors text-left",
                    selectedModel === model.id && "bg-cyan-500/10 text-cyan-400"
                  )}
                >
                  <div>
                    <div className="font-medium text-xs flex items-center gap-1.5">
                      {model.name}
                      {(model.id.includes("stable-diffusion") || model.id.includes("pollinations")) && <span title="Supports Images">🖼️</span>}
                    </div>
                    <div className="text-xs text-muted-foreground">{model.id}</div>
                  </div>
                  {model.pricing && (
                    <div className="text-xs text-muted-foreground">${model.pricing.prompt}/1k</div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
