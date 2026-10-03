import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/auth/config";

export const dynamic = "force-dynamic";

export async function GET() {
  const timestamp = new Date().toISOString();
  let dbStatus = "unconfigured";

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (isDemoMode()) {
    dbStatus = "demo-mode";
  } else if (url && key && !url.includes("your-project") && key !== "your-anon-key") {
    dbStatus = "configured";
  }

  return NextResponse.json(
    {
      status: "ok",
      uptime: process.uptime(),
      timestamp,
      environment: process.env.NODE_ENV || "development",
      database: dbStatus,
    },
    { status: 200 }
  );
}
