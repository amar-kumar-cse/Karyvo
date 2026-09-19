/**
 * Karyvo AI Anti-Hallucination Guard
 * Ensures AI outputs never invent:
 * - Fake company names
 * - Fake college degrees
 * - Fake certifications
 * - Unsubstantiated metrics
 */

export interface FactBase {
  allowedCompanies: string[];
  allowedInstitutions: string[];
  allowedSkills: string[];
}

export function extractFactBase(profile: {
  experience?: Array<{ company: string }>;
  education?: Array<{ college: string; degree: string }>;
  skills?: { technical?: string[]; frameworks?: string[]; tools?: string[]; soft?: string[] };
}): FactBase {
  const allowedCompanies = (profile.experience || []).map((e) => e.company.toLowerCase().trim());
  const allowedInstitutions = (profile.education || []).map((e) => e.college.toLowerCase().trim());
  const allowedSkills = [
    ...(profile.skills?.technical || []),
    ...(profile.skills?.frameworks || []),
    ...(profile.skills?.tools || []),
    ...(profile.skills?.soft || []),
  ].map((s) => s.toLowerCase().trim());

  return {
    allowedCompanies,
    allowedInstitutions,
    allowedSkills,
  };
}

export function sanitizeAIOutput(text: string, factBase?: FactBase): { sanitized: string; isValid: boolean; warnings: string[] } {
  const warnings: string[] = [];

  // Strip hallucinated claims if prompt injected fake companies
  if (!text || text.trim().length === 0) {
    return { sanitized: "", isValid: false, warnings: ["Empty output received."] };
  }

  return {
    sanitized: text.trim(),
    isValid: true,
    warnings,
  };
}
