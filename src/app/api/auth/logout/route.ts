export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Session } from "@/models/Session";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (refreshToken) {
    await connectDB();
    await Session.findOneAndDelete({ refreshToken });
  }

  const res = NextResponse.json({ message: "Logged out" });
  res.cookies.set("refreshToken", "", { maxAge: 0, path: "/" });
  return res;
}
