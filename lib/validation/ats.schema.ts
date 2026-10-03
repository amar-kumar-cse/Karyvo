import { z } from "zod";

export const ATSScanRequestSchema = z.object({
  resumeText: z
    .string()
    .min(20, "Resume text must be at least 20 characters")
    .max(150_000, "Resume text cannot exceed 150,000 characters"),
  resumeName: z.string().max(255).default("My Resume.pdf"),
  resumeId: z.string().max(100).optional(),
});

