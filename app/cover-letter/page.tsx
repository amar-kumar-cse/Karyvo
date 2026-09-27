import { repository } from "@/lib/db/repository";
import { CoverLetterWorkspace } from "@/components/cover-letter/cover-letter-workspace";

export const dynamic = "force-dynamic";

export default async function CoverLetterPage() {
  const userId = "user-default";
  const letters = await repository.getCoverLetters(userId);

  return <CoverLetterWorkspace initialLetters={letters} />;
}
