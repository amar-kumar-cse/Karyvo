import { repository, createEmptyProfile } from "@/lib/db/repository";
import { requireServerUserId } from "@/lib/auth/getUser";
import { MasterProfileWorkspace } from "@/components/profile/master-profile-workspace";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const userId = await requireServerUserId("/profile");
  try {
    const profile = await repository.getProfile(userId);
    return <MasterProfileWorkspace initialProfile={profile} />;
  } catch (err) {
    console.error("[ProfilePage] Failed to load:", err);
    return <MasterProfileWorkspace initialProfile={createEmptyProfile(userId)} />;
  }
}
