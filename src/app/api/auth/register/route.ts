export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = schema.parse(body);

    await connectDB();

    const existing = await User.findOne({ email });
    if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 400 });

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hashed, provider: "email" });

    return NextResponse.json({
      message: "Account created",
      user: { _id: user._id, name: user.name, email: user.email },
    }, { status: 201 });
  } catch (e: unknown) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.errors[0].message }, { status: 422 });
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
