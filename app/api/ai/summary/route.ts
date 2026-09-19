import { NextResponse } from "next/server";
import { karyvoAI } from "@/lib/ai/provider";
import { repository } from "@/lib/db/repository";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { targetRole } = body;

    const profile = repository.getProfile();
    const summary = await karyvoAI.generateSummary(profile, targetRole || "Software Engineer");

    return NextResponse.json({ success: true, data: { summary } });
  } catch (error) {
    console.error("POST /api/ai/summary error:", error);
    return NextResponse.json({ success: false, error: "Failed to generate professional summary." }, { status: 500 });
  }
}
