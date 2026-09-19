import { repository } from "@/lib/db/repository";
import { InterviewWorkspace } from "@/components/interview/interview-workspace";

export const dynamic = "force-dynamic";

export default async function InterviewPage() {
  const sessions = repository.getInterviewSessions();

  return <InterviewWorkspace initialSessions={sessions} />;
}
