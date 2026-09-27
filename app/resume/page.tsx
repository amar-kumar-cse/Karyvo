import { repository } from "@/lib/db/repository";
import { ResumeBuilderWorkspace } from "@/components/resume/resume-builder-workspace";

export const dynamic = "force-dynamic";

export default async function ResumePage() {
  const userId = "user-default";
  const profile = await repository.getProfile(userId);
  const resumes = await repository.getResumes(userId);
  const primaryResume = resumes[0];
  const versions = primaryResume ? await repository.getVersionsByResumeId(primaryResume.id, userId) : [];

  return (
    <ResumeBuilderWorkspace
      initialResume={primaryResume}
      profile={profile}
      versions={versions}
    />
  );
}
