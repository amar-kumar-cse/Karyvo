import { repository } from "@/lib/db/repository";
import { ResumeBuilderWorkspace } from "@/components/resume/resume-builder-workspace";

export const dynamic = "force-dynamic";

export default async function ResumePage() {
  const profile = repository.getProfile();
  const resumes = repository.getResumes();
  const primaryResume = resumes[0];
  const versions = primaryResume ? repository.getVersionsByResumeId(primaryResume.id) : [];

  return (
    <ResumeBuilderWorkspace
      initialResume={primaryResume}
      profile={profile}
      versions={versions}
    />
  );
}
