import mongoose, { Schema, Document, Types } from "mongoose";

export interface IMessage extends Omit<Document, "model"> {
  chatId: Types.ObjectId;
  role: "user" | "assistant" | "system";
  content: string;
  model?: string;
  tokenUsage?: { prompt: number; completion: number; total: number };
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  chatId: { type: Schema.Types.ObjectId, ref: "Chat", required: true, index: true },
  role: { type: String, enum: ["user", "assistant", "system"], required: true },
  content: { type: String, required: true },
  model: { type: String },
  tokenUsage: {
    prompt: Number,
    completion: Number,
    total: Number,
  },
}, { timestamps: { createdAt: true, updatedAt: false } });

MessageSchema.index({ chatId: 1, createdAt: 1 });

export const Message = mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);
