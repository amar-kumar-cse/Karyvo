import { repository } from "@/lib/db/repository";
import { DashboardWorkspace } from "@/components/dashboard/dashboard-workspace";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const profile = repository.getProfile();
  const resumes = repository.getResumes();
  const versions = resumes[0] ? repository.getVersionsByResumeId(resumes[0].id) : [];
  const atsScans = repository.getATSScans();
  const interviews = repository.getInterviewSessions();

  return (
    <DashboardWorkspace
      profile={profile}
      resumes={resumes}
      versions={versions}
      atsScans={atsScans}
      interviews={interviews}
    />
  );
}
