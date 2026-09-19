import { z } from "zod";

export const ATSScanRequestSchema = z.object({
  resumeText: z.string().min(20, "Resume text must be at least 20 characters"),
  resumeName: z.string().default("My Resume.pdf"),
  resumeId: z.string().optional(),
});
