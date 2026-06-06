import mongoose, { Schema, Document, Types } from "mongoose";

export interface IChat extends Document {
  userId: Types.ObjectId;
  title: string;
  selectedModel: string;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema = new Schema<IChat>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  title: { type: String, default: "New Chat", maxlength: 200 },
  selectedModel: { type: String, default: "openai/gpt-4o" },
  isPinned: { type: Boolean, default: false },
}, { timestamps: true });

ChatSchema.index({ userId: 1, updatedAt: -1 });
ChatSchema.index({ userId: 1, isPinned: -1 });

export const Chat = mongoose.models.Chat || mongoose.model<IChat>("Chat", ChatSchema);
