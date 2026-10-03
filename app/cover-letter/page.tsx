import { repository } from "@/lib/db/repository";
import { requireServerUserId } from "@/lib/auth/getUser";
import { CoverLetterWorkspace } from "@/components/cover-letter/cover-letter-workspace";

export const dynamic = "force-dynamic";

export default async function CoverLetterPage() {
  const userId = await requireServerUserId("/cover-letter");
  try {
    const letters = await repository.getCoverLetters(userId);
    return <CoverLetterWorkspace initialLetters={letters} />;
  } catch (err) {
    console.error("[CoverLetterPage] Failed to load:", err);
    return <CoverLetterWorkspace initialLetters={[]} />;
  }
}
