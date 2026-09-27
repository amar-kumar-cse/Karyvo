import { repository, SEED_PROFILE } from "@/lib/db/repository";
import { getServerUserId } from "@/lib/auth/getUser";
import { InterviewWorkspace } from "@/components/interview/interview-workspace";

export const dynamic = "force-dynamic";

export default async function InterviewPage() {
  try {
    const userId = await getServerUserId();
    const sessions = await repository.getInterviewSessions(userId);
    return <InterviewWorkspace initialSessions={sessions} />;
  } catch (err) {
    console.error("[InterviewPage] Failed to load:", err);
    return <InterviewWorkspace initialSessions={[]} />;
  }
}
