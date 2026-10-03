import { repository } from "@/lib/db/repository";
import { requireServerUserId } from "@/lib/auth/getUser";
import { InterviewWorkspace } from "@/components/interview/interview-workspace";

export const dynamic = "force-dynamic";

export default async function InterviewPage() {
  const userId = await requireServerUserId("/interview");
  try {
    const sessions = await repository.getInterviewSessions(userId);
    return <InterviewWorkspace initialSessions={sessions} />;
  } catch (err) {
    console.error("[InterviewPage] Failed to load:", err);
    return <InterviewWorkspace initialSessions={[]} />;
  }
}
