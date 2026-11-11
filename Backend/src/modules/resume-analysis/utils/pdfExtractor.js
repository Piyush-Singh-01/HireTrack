import { createRequire } from "module";
const require = createRequire(import.meta.url);

// Polyfill DOMMatrix for pdf-parse/pdfjs-dist in Node.js environments
// This prevents a ReferenceError during backend initialization
if (typeof global.DOMMatrix === 'undefined') {
  global.DOMMatrix = class DOMMatrix {
    constructor(init) { this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0; }
  };
}

const { PDFParse } = require("pdf-parse");

/**
 * Extracts plain text from a PDF file buffer.
 * Cleans up the text by removing duplicate/redundant whitespace and newlines.
 * 
 * @param {Buffer} pdfBuffer - The raw binary buffer of the PDF file.
 * @returns {Promise<string>} The cleaned plain text content.
 */
export const extractTextFromPdf = async (pdfBuffer) => {
  if (!Buffer.isBuffer(pdfBuffer)) {
    throw new Error("Invalid input: Expected a Buffer containing PDF data.");
  }

  try {
    const parser = new PDFParse({ data: pdfBuffer });
    const data = await parser.getText();
    if (!data || !data.text) {
      throw new Error("No text content could be extracted from the PDF.");
    }

    // Replace multiple spaces/tabs/newlines with a single space
    const cleanedText = data.text.replace(/\s+/g, " ").trim();
    return cleanedText;
  } catch (error) {
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
};
