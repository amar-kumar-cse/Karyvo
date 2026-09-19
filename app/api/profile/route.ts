import { NextResponse } from "next/server";
import { repository } from "@/lib/db/repository";
import { MasterCareerProfileSchema } from "@/lib/validation/profile.schema";

export async function GET() {
  try {
    const profile = repository.getProfile();
    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    console.error("GET /api/profile error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch master career profile." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = MasterCareerProfileSchema.parse(body);
    const saved = repository.saveProfile(validated);
    return NextResponse.json({ success: true, data: saved });
  } catch (error: any) {
    console.error("POST /api/profile error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Invalid master profile data." },
      { status: 400 }
    );
  }
}
