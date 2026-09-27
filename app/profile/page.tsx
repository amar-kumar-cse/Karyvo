import { repository, SEED_PROFILE } from "@/lib/db/repository";
import { getServerUserId } from "@/lib/auth/getUser";
import { MasterProfileWorkspace } from "@/components/profile/master-profile-workspace";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  try {
    const userId = await getServerUserId();
    const profile = await repository.getProfile(userId);
    return <MasterProfileWorkspace initialProfile={profile} />;
  } catch (err) {
    console.error("[ProfilePage] Failed to load:", err);
    return <MasterProfileWorkspace initialProfile={SEED_PROFILE} />;
  }
}
