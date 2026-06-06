export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "user" | "admin";
  theme: "dark" | "light" | "system";
  createdAt: string;
}

export interface Chat {
  _id: string;
  userId: string;
  title: string;
  selectedModel: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  chatId: string;
  role: "user" | "assistant" | "system";
  content: string;
  model?: string;
  tokenUsage?: { prompt: number; completion: number; total: number };
  createdAt: string;
  _streaming?: boolean;
}

export interface AIModel {
  id: string;
  name: string;
  description?: string;
  context_length?: number;
  pricing?: { prompt: string; completion: string };
  architecture?: { tokenizer: string; instruct_type: string };
}
