import { repository } from "@/lib/db/repository";
import { MasterProfileWorkspace } from "@/components/profile/master-profile-workspace";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const userId = "user-default";
  const profile = await repository.getProfile(userId);

  return <MasterProfileWorkspace initialProfile={profile} />;
}
