import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Message } from "@/models/Message";
import { Chat } from "@/models/Chat";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  const payload = verifyAuth(req);

  if (!payload) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { chatId } = await params;

  await connectDB();

  const chat = await Chat.findOne({
    _id: chatId,
    userId: payload.userId,
  });

  if (!chat) {
    return NextResponse.json(
      { error: "Not found" },
      { status: 404 }
    );
  }

  const messages = await Message.find({
    chatId,
  }).sort({ createdAt: 1 });

  return NextResponse.json({ messages });
}