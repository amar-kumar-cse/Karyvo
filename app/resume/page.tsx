import { repository } from "@/lib/db/repository";
import { getServerUserId } from "@/lib/auth/getUser";
import { ResumeBuilderWorkspace } from "@/components/resume/resume-builder-workspace";
import { SEED_PROFILE } from "@/lib/db/repository";

export const dynamic = "force-dynamic";

export default async function ResumePage() {
  try {
    const userId = await getServerUserId();
    const profile = await repository.getProfile(userId);
    const resumes = await repository.getResumes(userId);
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
        profile={SEED_PROFILE}
        versions={[]}
      />
    );
  }
}
