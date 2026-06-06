export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Chat } from "@/models/Chat";

export async function GET(req: NextRequest) {
  const payload = verifyAuth(req);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const chats = await Chat.find({ userId: payload.userId })
    .sort({ isPinned: -1, updatedAt: -1 })
    .lean();

  return NextResponse.json({ chats });
}

export async function POST(req: NextRequest) {
  const payload = verifyAuth(req);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const chat = await Chat.create({
    userId: payload.userId,
    title: "New Chat",
    selectedModel: "openai/gpt-4o",
  });

  return NextResponse.json({ chat }, { status: 201 });
}
