import { NextRequest, NextResponse } from "next/server";
import { repository } from "@/lib/db/repository";
import { SaveResumeRequestSchema } from "@/lib/validation/resume.schema";
import { Resume } from "@/types/resume";
import { getUser } from "@/lib/auth/getUser";
import { handleApiError } from "@/lib/apiError";
import { rateLimit, RATE_LIMITS } from "@/lib/rateLimit";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await getUser(req);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const resume = repository.getResumeById(id);
      if (!resume) {
        return NextResponse.json({ success: false, error: "Resume not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: resume });
    }

    const resumes = repository.getResumes();
    return NextResponse.json({ success: true, data: resumes });
  } catch (error) {
    return handleApiError(error, "GET /api/resume");
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await getUser(req);

    const { limited } = rateLimit(`resume:${userId}`, RATE_LIMITS.standard.maxRequests, RATE_LIMITS.standard.windowMs);
    if (limited) {
      return NextResponse.json({ success: false, error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const body = await req.json();
    const validated = SaveResumeRequestSchema.parse(body);

    // M4: Use crypto.randomUUID() instead of Date.now()
    const resumeId = validated.id || `res-${crypto.randomUUID()}`;
    const existing = repository.getResumeById(resumeId);

    const resumeToSave: Resume = {
      id: resumeId,
      userId: existing?.userId || userId,
      title: validated.title,
      targetRole: validated.targetRole,
      templateId: validated.templateId,
      content: validated.content,
      isPrimary: validated.isPrimary,
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = repository.saveResume(resumeToSave);

    // If requested, create a labeled version snapshot
    if (validated.createVersion) {
      const existingVersions = repository.getVersionsByResumeId(resumeId);
      const nextVersionNum = existingVersions.length + 1;
      const label = validated.versionLabel?.trim() || `Version ${nextVersionNum}`;

      repository.createVersion({
        resumeId: saved.id,
        userId: saved.userId,
        versionNumber: nextVersionNum,
        versionLabel: label,
        changeSummary: validated.changeSummary || "Manual checkpoint save",
        snapshot: saved.content,
      });
    }

    return NextResponse.json({ success: true, data: saved });
  } catch (error) {
    return handleApiError(error, "POST /api/resume");
  }
}

// L4: DELETE handler
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await getUser(req);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Resume ID is required." }, { status: 400 });
    }

    const deleted = repository.deleteResume(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Resume not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Resume deleted." });
  } catch (error) {
    return handleApiError(error, "DELETE /api/resume");
  }
}
