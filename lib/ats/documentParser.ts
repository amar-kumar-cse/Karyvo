import zlib from "zlib";

export interface ParsedDocumentResult {
  text: string;
  sourceType: "pdf" | "image" | "text" | "unknown";
  wordCount: number;
  extractedVia: "local-parser" | "ai-vision-ocr" | "plain-text";
}

const MAX_FILE_SIZE_BYTES = 12 * 1024 * 1024; // 12 MB max limit
const MAX_PDF_STREAMS = 500; // Guard against deeply nested or malicious PDFs
const MAX_DECOMPRESS_BYTES = 4 * 1024 * 1024; // Guard against zip bombs (4MB limit per stream)

/**
 * Validates file signature (magic bytes) to avoid trusting client MIME or extension blindly.
 */
function detectFileTypeFromMagicBytes(buffer: Buffer): "pdf" | "image" | "unknown" {
  if (buffer.length >= 4 && buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
    return "pdf";
  }
  // PNG: \x89PNG\r\n\x1a\n
  if (buffer.length >= 8 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    return "image";
  }
  // JPEG: \xFF\xD8\xFF
  if (buffer.length >= 3 && buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return "image";
  }
  // WEBP: RIFF....WEBP
  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image";
  }
  return "unknown";
}

/**
 * Standard PDF text extractor using pdf-parse library.
 * Handles CID fonts, hex encodings, Word/Canva exports cleanly.
 */
async function extractTextWithPdfParse(buffer: Buffer): Promise<string> {
  try {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    return result?.text || "";
  } catch (err) {
    console.warn("[extractTextWithPdfParse] parser fallback triggered:", err);
    return "";
  }
}

/**
 * Fallback Pure-Node PDF text stream extractor with strict maxOutputLength zip bomb guards.
 */
function extractTextFromPdfStream(buffer: Buffer): string {
  try {
    const content = buffer.toString("binary");
    const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
    let fullText = "";
    let match: RegExpExecArray | null;
    let streamCount = 0;

    while ((match = streamRegex.exec(content)) !== null && streamCount < MAX_PDF_STREAMS) {
      streamCount++;
      const rawStream = Buffer.from(match[1], "binary");
      let decompressed = "";

      try {
        decompressed = zlib.inflateSync(rawStream, { maxOutputLength: MAX_DECOMPRESS_BYTES }).toString("utf-8");
      } catch {
        try {
          decompressed = zlib.inflateRawSync(rawStream, { maxOutputLength: MAX_DECOMPRESS_BYTES }).toString("utf-8");
        } catch {
          decompressed = rawStream.toString("utf-8");
        }
      }

      // 1. Extract strings from (text) Tj
      const tjMatches = decompressed.match(/\(([\s\S]*?)\)\s*Tj/g) || [];
      for (const tj of tjMatches) {
        const textInside = tj.replace(/^\(/, "").replace(/\)\s*Tj$/, "");
        fullText += textInside + " ";
      }

      // 2. Extract strings from [(text) -10 (more)] TJ
      const tjArrayMatches = decompressed.match(/\[([\s\S]*?)\]\s*TJ/g) || [];
      for (const tja of tjArrayMatches) {
        const parts = tja.match(/\(([\s\S]*?)\)/g) || [];
        for (const p of parts) {
          fullText += p.slice(1, -1) + " ";
        }
      }

      // 3. Fallback: check for ' or " text operators
      const singleQuoteMatches = decompressed.match(/'\(([\s\S]*?)\)/g) || [];
      for (const sq of singleQuoteMatches) {
        fullText += sq.slice(2, -1) + " ";
      }
    }

    // Clean up PDF escaped characters: \( \) \\
    const cleaned = fullText
      .replace(/\\([()\\])/g, "$1")
      .replace(/\\[nrtbf]/g, " ")
      .replace(/[ \t]{2,}/g, " ")
      .trim();

    return cleaned;
  } catch (err) {
    console.warn("[extractTextFromPdfStream] parsing warning:", err);
    return "";
  }
}

/**
 * Robust document parser that extracts text from:
 * - PDF documents (via pdf-parse with local stream & AI Vision fallbacks)
 * - Images (PNG, JPG, JPEG, WEBP via AI Vision OCR)
 * - Plain text / Markdown files
 */
export async function parseResumeDocument(
  fileBuffer: Buffer,
  mimeType: string,
  filename: string
): Promise<ParsedDocumentResult> {
  if (fileBuffer.length > MAX_FILE_SIZE_BYTES) {
    throw new Error(
      `File exceeds maximum allowed size of 12MB (received ${(fileBuffer.length / (1024 * 1024)).toFixed(1)}MB).`
    );
  }

  const cleanMime = (mimeType || "").toLowerCase().trim();
  const lowerName = (filename || "").toLowerCase().trim();
  const magicType = detectFileTypeFromMagicBytes(fileBuffer);

  // 1. PLAIN TEXT / MARKDOWN
  if (
    cleanMime.includes("text/plain") ||
    cleanMime.includes("text/markdown") ||
    lowerName.endsWith(".txt") ||
    lowerName.endsWith(".md")
  ) {
    const rawText = fileBuffer.toString("utf-8").trim();
    return {
      text: rawText,
      sourceType: "text",
      wordCount: countWords(rawText),
      extractedVia: "plain-text",
    };
  }

  // 2. PDF DOCUMENT (Verify magic bytes or declared mime/extension)
  if (magicType === "pdf" || cleanMime.includes("application/pdf") || lowerName.endsWith(".pdf")) {
    // 2a. Try standard pdf-parse first for complete font & CID decoding
    const parsedText = await extractTextWithPdfParse(fileBuffer);
    if (parsedText && parsedText.replace(/\s+/g, "").length >= 50) {
      const cleaned = cleanExtractedText(parsedText);
      return {
        text: cleaned,
        sourceType: "pdf",
        wordCount: countWords(cleaned),
        extractedVia: "local-parser",
      };
    }

    // 2b. Try fallback stream parser
    const localText = extractTextFromPdfStream(fileBuffer);
    if (localText && localText.replace(/\s+/g, "").length >= 50) {
      const cleaned = cleanExtractedText(localText);
      return {
        text: cleaned,
        sourceType: "pdf",
        wordCount: countWords(cleaned),
        extractedVia: "local-parser",
      };
    }

    // 2c. If PDF is image-scanned or complex, use Gemini Vision OCR
    if (process.env.GEMINI_API_KEY) {
      try {
        const aiText = await extractTextWithGemini(fileBuffer, "application/pdf");
        if (aiText && aiText.trim().length >= 20) {
          const cleaned = cleanExtractedText(aiText);
          return {
            text: cleaned,
            sourceType: "pdf",
            wordCount: countWords(cleaned),
            extractedVia: "ai-vision-ocr",
          };
        }
      } catch (geminiErr) {
        console.error("[DocumentParser] Gemini PDF OCR failed:", geminiErr);
      }
    }

    // If local stream parser got some minimal text, return it
    if (localText && localText.trim()) {
      const cleaned = cleanExtractedText(localText);
      return {
        text: cleaned,
        sourceType: "pdf",
        wordCount: countWords(cleaned),
        extractedVia: "local-parser",
      };
    }

    throw new Error(
      "Could not extract readable text from this PDF. Please ensure the document is not password-protected."
    );
  }

  // 3. IMAGE FILES (PNG, JPG, JPEG, WEBP)
  const isImage =
    cleanMime.startsWith("image/") ||
    lowerName.endsWith(".png") ||
    lowerName.endsWith(".jpg") ||
    lowerName.endsWith(".jpeg") ||
    lowerName.endsWith(".webp");

  if (isImage) {
    let imageMime = cleanMime;
    if (!imageMime || imageMime === "application/octet-stream") {
      if (lowerName.endsWith(".png")) imageMime = "image/png";
      else if (lowerName.endsWith(".webp")) imageMime = "image/webp";
      else imageMime = "image/jpeg";
    }

    if (!process.env.GEMINI_API_KEY) {
      throw new Error(
        "AI OCR service is required to scan resume images. Please configure GEMINI_API_KEY or upload a standard text PDF."
      );
    }

    try {
      const aiText = await extractTextWithGemini(fileBuffer, imageMime);
      if (!aiText || !aiText.trim()) {
        throw new Error("No readable text detected in the provided image.");
      }
      const cleaned = cleanExtractedText(aiText);
      return {
        text: cleaned,
        sourceType: "image",
        wordCount: countWords(cleaned),
        extractedVia: "ai-vision-ocr",
      };
    } catch (err: any) {
      console.error("[DocumentParser] Image OCR extraction error:", err);
      throw new Error(err.message || "Failed to parse text from the uploaded image.");
    }
  }

  // 4. FALLBACK: Attempt utf-8 decoding
  const fallbackText = fileBuffer.toString("utf-8").trim();
  if (fallbackText && fallbackText.replace(/\s+/g, "").length >= 30) {
    return {
      text: fallbackText,
      sourceType: "unknown",
      wordCount: countWords(fallbackText),
      extractedVia: "plain-text",
    };
  }

  throw new Error(
    `Unsupported file format: ${filename}. Please upload a standard PDF (.pdf) or image (.png, .jpg, .webp).`
  );
}

/**
 * Call Gemini 3.8 Flash multimodal to extract resume text with high fidelity OCR
 */
async function extractTextWithGemini(fileBuffer: Buffer, mimeType: string): Promise<string> {
  const base64Data = fileBuffer.toString("base64");
  const prompt = `You are a high-precision ATS document transcription engine.
Transcribe and extract ALL text from this resume document with 100% exact fidelity.
Guidelines:
1. Preserve all section headers (e.g. SUMMARY, WORK EXPERIENCE, EDUCATION, SKILLS, PROJECTS, CERTIFICATIONS).
2. Retain all bullet points, numbers, percentages, company names, job titles, dates, technologies, metrics, links, email, phone number, and location.
3. Keep the natural top-to-bottom reading order.
4. Output only the pure extracted resume text. Do NOT add any preamble, conversational commentary, or surrounding backticks.`;

  let lastError: any = null;

  for (let attempt = 1; attempt <= 3; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25_000);

    try {
      const res = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": process.env.GEMINI_API_KEY!,
          },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    inlineData: {
                      mimeType: mimeType,
                      data: base64Data,
                    },
                  },
                  {
                    text: prompt,
                  },
                ],
              },
            ],
          }),
        }
      );

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        return candidateText || "";
      }

      if (res.status === 503 || res.status === 429) {
        // Wait 1.2s before retry
        await new Promise((resolve) => setTimeout(resolve, 1200));
        continue;
      }

      const errText = await res.text();
      throw new Error(`AI OCR engine returned status ${res.status}: ${errText.slice(0, 150)}`);
    } catch (err: any) {
      clearTimeout(timeoutId);
      lastError = err;
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  throw lastError || new Error("Failed to process document with AI OCR engine.");
}

function cleanExtractedText(raw: string): string {
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function countWords(str: string): number {
  return str.trim() ? str.trim().split(/\s+/).length : 0;
}
