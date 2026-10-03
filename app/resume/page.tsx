import { repository, createEmptyProfile } from "@/lib/db/repository";
import { requireServerUserId } from "@/lib/auth/getUser";
import { ResumeBuilderWorkspace } from "@/components/resume/resume-builder-workspace";

export const dynamic = "force-dynamic";

export default async function ResumePage() {
  const userId = await requireServerUserId("/resume");
  try {
    const [profile, resumes] = await Promise.all([
      repository.getProfile(userId),
      repository.getResumes(userId),
    ]);
    const primaryResume = resumes[0];
    const versions = primaryResume
      ? await repository.getVersionsByResumeId(primaryResume.id, userId)
      : [];

    return (
      <ResumeBuilderWorkspace
        initialResume={primaryResume}
        profile={profile}
        versions={versions}
      />
    );
  } catch (err) {
    console.error("[ResumePage] Failed to load:", err);
    // Render with safe defaults so the page never crashes
    return (
      <ResumeBuilderWorkspace
        initialResume={undefined}
        profile={createEmptyProfile(userId)}
        versions={[]}
      />
    );
  }
}
