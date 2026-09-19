import { NextResponse } from "next/server";
import { repository } from "@/lib/db/repository";
import { SaveResumeRequestSchema } from "@/lib/validation/resume.schema";
import { Resume } from "@/types/resume";

export async function GET(req: Request) {
  try {
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
    console.error("GET /api/resume error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch resume." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = SaveResumeRequestSchema.parse(body);

    const resumeId = validated.id || `res-${Date.now()}`;
    const existing = repository.getResumeById(resumeId);

    const resumeToSave: Resume = {
      id: resumeId,
      userId: existing?.userId || "user-default",
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
  } catch (error: any) {
    console.error("POST /api/resume error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Invalid resume data." },
      { status: 400 }
    );
  }
}
