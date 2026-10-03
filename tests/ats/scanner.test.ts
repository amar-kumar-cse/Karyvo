import { describe, it, expect } from "vitest";
import { atsScanner } from "@/lib/ats/scanner";

describe("ATS Scanner Service", () => {
  it("scores an empty resume low with actionable issues", () => {
    const result = atsScanner.analyzeResume("", "Empty.pdf");
    expect(result.overallScore).toBeLessThan(60);
    expect(result.verdict).toBe("Needs Attention - Key Gaps Detected");
    expect(result.issues.length).toBeGreaterThan(0);
  });

  it("evaluates a well-formatted technical resume with power verbs and metrics", () => {
    const sampleResume = `
      JOHN DOE
      Email: john.doe@example.com | Phone: +91 9876543210 | Bangalore, India
      LinkedIn: linkedin.com/in/johndoe | GitHub: github.com/johndoe

      EXPERIENCE
      Senior Backend Engineer | Acme Corp (2022 - Present)
      - Architected high-throughput microservices handling 4.2M daily requests with sub-50ms latency.
      - Optimized database queries in PostgreSQL and Redis, reducing p99 response times by 35%.
      - Engineered automated CI/CD pipelines deploying Docker containers to Kubernetes on AWS.

      EDUCATION
      B.Tech in Computer Science | National Institute of Technology (2018 - 2022) | CGPA: 8.9/10

      PROJECTS
      Distributed Cache Engine
      - Developed an in-memory key-value store in Go and Rust supporting 100k concurrent connections.

      SKILLS
      TypeScript, Node.js, Go, Python, PostgreSQL, Redis, Docker, Kubernetes, AWS, Git, System Design
    `;

    const result = atsScanner.analyzeResume(sampleResume, "John_Doe_Resume.pdf");
    expect(result.overallScore).toBeGreaterThanOrEqual(75);
    expect(["DevOps & Cloud Engineer", "Backend & Systems Engineer"]).toContain(result.detectedRole);
    expect(result.detectedSkills).toContain("PostgreSQL");
    expect(result.formattingScore).toBeGreaterThanOrEqual(70);
    expect(result.quantificationScore).toBeGreaterThanOrEqual(70);
    expect(result.verdict).toMatch(/Good Health|Excellent Health/);
  });
});
