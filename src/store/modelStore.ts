import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ModelState {
  selectedModel: string;
  setSelectedModel: (model: string) => void;
}

export const useModelStore = create<ModelState>()(
  persist(
    (set) => ({
      selectedModel: "openai/gpt-4o",
      setSelectedModel: (model) => set({ selectedModel: model }),
    }),
    { name: "model-store" }
  )
);
