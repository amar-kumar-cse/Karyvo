import { describe, expect, it } from "vitest";
import { repository, createEmptyProfile } from "@/lib/db/repository";

describe("Repository (Multi-tenant & fail-closed security)", () => {
  it("returns an empty profile structure for a brand new user (never SEED_PROFILE)", async () => {
    const freshUserId = "11111111-2222-3333-4444-555555555555";
    const profile = await repository.getProfile(freshUserId);

    expect(profile.userId).toBe(freshUserId);
    expect(profile.fullName).toBe("");
    expect(profile.email).toBe("");
    expect(profile.education).toEqual([]);
    expect(profile.experience).toEqual([]);
    expect(profile.summary).toBe("");
  });

  it("returns an empty array of resumes for a new user without creating dummy rows", async () => {
    const freshUserId = "22222222-3333-4444-5555-666666666666";
    const resumes = await repository.getResumes(freshUserId);
    expect(resumes).toEqual([]);
  });

  it("saves and retrieves a profile correctly", async () => {
    const userId = "33333333-4444-5555-6666-777777777777";
    const base = createEmptyProfile(userId);
    base.fullName = "Rohit Verma";
    base.email = "rohit@test.com";

    const saved = await repository.saveProfile(userId, base);
    expect(saved.fullName).toBe("Rohit Verma");

    const fetched = await repository.getProfile(userId);
    expect(fetched.fullName).toBe("Rohit Verma");
    expect(fetched.email).toBe("rohit@test.com");
  });

  it("saves, retrieves, updates, and deletes resumes scoped to user", async () => {
    const userId = "44444444-5555-6666-7777-888888888888";
    const resumeId = "res-test-01";

    const created = await repository.saveResume({
      id: resumeId,
      userId,
      title: "Frontend Developer",
      targetRole: "Frontend Engineer",
      templateId: "modern-tech",
      isPrimary: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      content: { personal: { fullName: "Aman", email: "aman@test.com" } } as any,
    });

    expect(created.id).toBe(resumeId);

    const retrieved = await repository.getResumeById(resumeId, userId);
    expect(retrieved?.title).toBe("Frontend Developer");

    // Other user cannot retrieve it
    const strangerRetrieved = await repository.getResumeById(resumeId, "stranger-user-id");
    expect(strangerRetrieved).toBeUndefined();

    // Delete it
    const deleted = await repository.deleteResume(resumeId, userId);
    expect(deleted).toBe(true);

    const afterDelete = await repository.getResumeById(resumeId, userId);
    expect(afterDelete).toBeUndefined();
  });
});
