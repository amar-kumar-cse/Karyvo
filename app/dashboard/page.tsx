import { repository, createEmptyProfile } from "@/lib/db/repository";
import { requireServerUserId } from "@/lib/auth/getUser";
import { DashboardWorkspace } from "@/components/dashboard/dashboard-workspace";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const userId = await requireServerUserId("/dashboard");
  try {
    const profile = await repository.getProfile(userId);
    const resumes = await repository.getResumes(userId);
    const versions = resumes[0]
      ? await repository.getVersionsByResumeId(resumes[0].id, userId)
      : [];
    const atsScans = await repository.getATSScans(userId);
    const interviews = await repository.getInterviewSessions(userId);

    return (
      <DashboardWorkspace
        profile={profile}
        resumes={resumes}
        versions={versions}
        atsScans={atsScans}
        interviews={interviews}
      />
    );
  } catch (err) {
    console.error("[DashboardPage] Failed to load:", err);
    return (
      <DashboardWorkspace
        profile={createEmptyProfile(userId)}
        resumes={[]}
        versions={[]}
        atsScans={[]}
        interviews={[]}
      />
    );
  }
}
