import { repository, SEED_PROFILE } from "@/lib/db/repository";
import { getServerUserId } from "@/lib/auth/getUser";
import { CoverLetterWorkspace } from "@/components/cover-letter/cover-letter-workspace";

export const dynamic = "force-dynamic";

export default async function CoverLetterPage() {
  try {
    const userId = await getServerUserId();
    const letters = await repository.getCoverLetters(userId);
    return <CoverLetterWorkspace initialLetters={letters} />;
  } catch (err) {
    console.error("[CoverLetterPage] Failed to load:", err);
    return <CoverLetterWorkspace initialLetters={[]} />;
  }
}
