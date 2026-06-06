import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Chat } from "@/models/Chat";
import { Message } from "@/models/Message";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const payload = verifyAuth(req);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const chat = await Chat.findOne({ _id: params.id, userId: payload.userId });
  if (!chat) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ chat });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const payload = verifyAuth(req);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  await connectDB();

  const chat = await Chat.findOneAndUpdate(
    { _id: params.id, userId: payload.userId },
    { $set: { title: body.title, isPinned: body.isPinned, selectedModel: body.selectedModel } },
    { new: true }
  );

  if (!chat) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ chat });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const payload = verifyAuth(req);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  await Chat.findOneAndDelete({ _id: params.id, userId: payload.userId });
  await Message.deleteMany({ chatId: params.id });

  return NextResponse.json({ message: "Deleted" });
}
