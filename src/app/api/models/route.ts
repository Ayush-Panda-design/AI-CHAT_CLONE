export const revalidate = 3600;
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const baseUrl = process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";
    const res = await fetch(`${baseUrl}/models`, {
      headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` },
      next: { revalidate: 3600 },
    });
    const data = await res.json();
    const models = data.data ?? [];
    
    // Add free image model if not present
    const sdxlId = "pollinations/ai";
    if (!models.some((m: any) => m.id === sdxlId)) {
      models.push({
        id: sdxlId,
        name: "Free Image Generator (Pollinations)",
        pricing: { prompt: "0", completion: "0" }
      });
    }

    return NextResponse.json({ models });
  } catch {
    return NextResponse.json({ models: [] });
  }
}
