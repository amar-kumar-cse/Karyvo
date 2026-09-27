import { repository } from "@/lib/db/repository";
import { InterviewWorkspace } from "@/components/interview/interview-workspace";

export const dynamic = "force-dynamic";

export default async function InterviewPage() {
  const userId = "user-default";
  const sessions = await repository.getInterviewSessions(userId);

  return <InterviewWorkspace initialSessions={sessions} />;
}
