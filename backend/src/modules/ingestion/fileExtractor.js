import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

/**
 * Extracts raw text from an uploaded file buffer.
 * Supports PDFs (via pdf-parse) and plaintext files (UTF-8).
 * @param {Object} file - Multer file object
 * @returns {Promise<string>} Extracted text
 */
async function extractTextFromFile(file) {
  if (!file || !file.buffer) {
    throw new Error("No file content received.");
  }

  const ext = file.originalname.split(".").pop().toLowerCase();
  
  if (ext === "pdf" || file.mimetype === "application/pdf") {
    try {
      const uint8 = new Uint8Array(file.buffer.buffer, file.buffer.byteOffset, file.buffer.byteLength);
      const instance = new pdfParse.PDFParse(uint8);
      // Join pages with double newlines to treat page boundaries as paragraph boundaries
      const data = await instance.getText({ pageJoiner: "\n\n" });
      
      let rawText = data.text || "";

      // 1. Normalize line endings
      let cleaned = rawText.replace(/\r\n/g, "\n");

      // 2. Remove common page number lines (e.g. "Page 1", "12", "3 of 10")
      cleaned = cleaned.replace(/(?<=^|\n)(page\s+\d+(\s+of\s+\d+)?|\d+\s+of\s+\d+|\d+)(?=\n|$)/ig, "");

      // 3. Replace single newlines (line-wraps within paragraphs) with spaces
      cleaned = cleaned.replace(/(?<!\n)\n(?!\n)/g, " ");

      // 4. Collapse multiple spaces
      cleaned = cleaned.replace(/[ ]+/g, " ");

      // 5. Trim and collapse multiple consecutive newlines (3 or more) to exactly double newlines (\n\n)
      cleaned = cleaned.replace(/\n{3,}/g, "\n\n").trim();

      return cleaned;
    } catch (error) {
      throw new Error(`Failed to parse PDF document: ${error.message}`);
    }
  }
  
  // Default to treating as UTF-8 plaintext (txt, md, csv, json, etc.)
  try {
    return file.buffer.toString("utf-8");
  } catch (error) {
    throw new Error(`Failed to read file as text: ${error.message}`);
  }
}

export default extractTextFromFile;
