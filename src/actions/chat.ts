"use server";
import { connectDB } from "@/lib/mongodb";
import { Chat } from "@/models/Chat";
import { Message } from "@/models/Message";
import { revalidatePath } from "next/cache";

export async function createChatAction(userId: string) {
  await connectDB();
  const chat = await Chat.create({ userId, title: "New Chat" });
  revalidatePath("/chat");
  return JSON.parse(JSON.stringify(chat));
}

export async function deleteChatAction(chatId: string, userId: string) {
  await connectDB();
  await Chat.findOneAndDelete({ _id: chatId, userId });
  await Message.deleteMany({ chatId });
  revalidatePath("/chat");
}

export async function renameChatAction(chatId: string, userId: string, title: string) {
  await connectDB();
  await Chat.findOneAndUpdate({ _id: chatId, userId }, { title });
  revalidatePath("/chat");
}

export async function updateProfileAction(userId: string, data: { name?: string; avatar?: string; theme?: string }) {
  await connectDB();
  const { User } = await import("@/models/User");
  await User.findByIdAndUpdate(userId, data);
  revalidatePath("/profile");
}
