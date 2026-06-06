export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import { Session } from "@/models/Session";

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get("refreshToken")?.value;
  if (!refreshToken) return NextResponse.json({ error: "No refresh token" }, { status: 401 });

  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { userId: string };
    await connectDB();

    const session = await Session.findOne({ refreshToken });
    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    const accessToken = jwt.sign(
      { userId: payload.userId },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" }
    );

    return NextResponse.json({ accessToken });
  } catch {
    return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
  }
}
