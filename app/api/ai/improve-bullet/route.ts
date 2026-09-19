import { NextResponse } from "next/server";
import { karyvoAI } from "@/lib/ai/provider";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { bullet, context } = body;

    if (!bullet || typeof bullet !== "string") {
      return NextResponse.json({ success: false, error: "Bullet text is required" }, { status: 400 });
    }

    if (bullet.trim().length > 2000) {
      return NextResponse.json({ success: false, error: "Bullet text exceeds maximum limit of 2,000 characters." }, { status: 400 });
    }

    const result = await karyvoAI.improveBullet(bullet, context);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("POST /api/ai/improve-bullet error:", error);
    return NextResponse.json({ success: false, error: "Failed to improve bullet point." }, { status: 500 });
  }
}
