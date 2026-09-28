import { NextRequest, NextResponse } from "next/server";
import { atsScanner } from "@/lib/ats/scanner";
import { parseResumeDocument } from "@/lib/ats/documentParser";
import { repository } from "@/lib/db/repository";
import { ATSScanRequestSchema } from "@/lib/validation/ats.schema";
import { getUser } from "@/lib/auth/getUser";
import { handleApiError } from "@/lib/apiError";
import { rateLimit, RATE_LIMITS } from "@/lib/rateLimit";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await getUser(req);
    const scans = await repository.getATSScans(userId);
    return NextResponse.json({ success: true, data: scans });
  } catch (error) {
    return handleApiError(error, "GET /api/ats/scan");
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await getUser(req);

    const { limited } = rateLimit(`ats-scan:${userId}`, RATE_LIMITS.ai.maxRequests, RATE_LIMITS.ai.windowMs);
    if (limited) {
      return NextResponse.json(
        { success: false, error: "Too many scan requests. Please wait a few seconds." },
        { status: 429 }
      );
    }

    const contentType = req.headers.get("content-type") || "";

    // 1. MULTIPART FILE UPLOAD (PDF, PNG, JPG, JPEG, WEBP, TXT)
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json(
          { success: false, error: "No file was uploaded. Please select a resume file (PDF or Image)." },
          { status: 400 }
        );
      }

      // Max 12MB limit
      const MAX_SIZE = 12 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        return NextResponse.json(
          { success: false, error: "File size exceeds the 12MB limit. Please upload a smaller file." },
          { status: 400 }
        );
      }

      const arrayBuf = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuf);

      try {
        const parsedDoc = await parseResumeDocument(buffer, file.type, file.name);

        if (!parsedDoc.text || parsedDoc.text.trim().length < 20) {
          return NextResponse.json(
            {
              success: false,
              error:
                "Could not extract sufficient text from this document. Please ensure the document is clear and readable.",
            },
            { status: 400 }
          );
        }

        const scanResult = atsScanner.analyzeResume(
          parsedDoc.text,
          file.name,
          undefined,
          parsedDoc.sourceType
        );

        const saved = await repository.saveATSScan(scanResult, userId);

        return NextResponse.json({
          success: true,
          data: saved,
          extractedText: parsedDoc.text,
          parsedVia: parsedDoc.extractedVia,
          wordCount: parsedDoc.wordCount,
        });
      } catch (parseError: any) {
        console.error("[POST /api/ats/scan file parse error]", parseError);
        return NextResponse.json(
          {
            success: false,
            error: parseError.message || "Failed to parse document. Please check the file format.",
          },
          { status: 400 }
        );
      }
    }

    // 2. RAW JSON PAYLOAD (Text input or active resume payload)
    const body = await req.json();
    const validated = ATSScanRequestSchema.parse(body);

    const result = atsScanner.analyzeResume(
      validated.resumeText,
      validated.resumeName,
      validated.resumeId,
      "manual"
    );

    const saved = await repository.saveATSScan(result, userId);

    return NextResponse.json({
      success: true,
      data: saved,
      extractedText: validated.resumeText,
    });
  } catch (error) {
    return handleApiError(error, "POST /api/ats/scan");
  }
}

// DELETE handler for ATS scan results
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await getUser(req);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Scan ID is required." }, { status: 400 });
    }

    const deleted = await repository.deleteATSScan(id, userId);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "ATS scan not found or unauthorized." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "ATS scan deleted." });
  } catch (error) {
    return handleApiError(error, "DELETE /api/ats/scan");
  }
}
