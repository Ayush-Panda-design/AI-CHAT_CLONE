export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Session } from "@/models/Session";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const { email, password } = schema.parse(await req.json());
    await connectDB();

    const user = await User.findOne({ email }).select("+password");
    if (!user || !user.password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const accessToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" }
    );
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: "7d" }
    );

    // Save session
    await Session.findOneAndUpdate(
      { userId: user._id },
      { refreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      { upsert: true }
    );

    const res = NextResponse.json({
      user: { _id: user._id, name: user.name, email: user.email, avatar: user.avatar, role: user.role },
      accessToken,
    });

    res.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return res;
  } catch (e: unknown) {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
