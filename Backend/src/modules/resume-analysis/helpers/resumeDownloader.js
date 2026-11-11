import axios from "axios";

/**
 * Extracts the resume URL from the candidate's application answers.
 * Uses multiple lookup strategies to handle dynamic form structures.
 * 
 * @param {object} answers - The answers object from the Application model.
 * @returns {string|null} The extracted resume URL, or null if not found.
 */
export const extractResumeUrl = (answers) => {
  if (!answers || typeof answers !== "object") {
    return null;
  }

  // 1. Direct check of common keys
  const commonKeys = ["resume", "resumeUrl", "resume_url", "cv", "file", "pdf", "attachments"];
  for (const key of commonKeys) {
    const val = answers[key];
    if (val) {
      if (typeof val === "string" && val.startsWith("http")) {
        return val;
      }
      if (Array.isArray(val)) {
        for (const item of val) {
          if (item && typeof item === "object") {
            const url = item.url || item.fileUrl || item.secure_url;
            if (typeof url === "string" && url.startsWith("http")) {
              return url;
            }
          } else if (typeof item === "string" && item.startsWith("http")) {
            return item;
          }
        }
      }
      if (typeof val === "object" && typeof val.url === "string" && val.url.startsWith("http")) {
        return val.url;
      }
      if (typeof val === "object" && typeof val.fileUrl === "string" && val.fileUrl.startsWith("http")) {
        return val.fileUrl;
      }
    }
  }

  // 2. Scan all properties in answers for a Cloudinary PDF link or .pdf extension
  for (const [key, val] of Object.entries(answers)) {
    if (typeof val === "string" && val.startsWith("http")) {
      const lowerVal = val.toLowerCase();
      if (lowerVal.includes("cloudinary.com") || lowerVal.includes(".pdf")) {
        return val;
      }
    }
    if (Array.isArray(val)) {
      for (const item of val) {
        if (item && typeof item === "object") {
          const url = item.url || item.fileUrl || item.secure_url;
          if (typeof url === "string" && url.startsWith("http")) {
            const lowerUrl = url.toLowerCase();
            if (lowerUrl.includes("cloudinary.com") || lowerUrl.includes(".pdf")) {
              return url;
            }
          }
        } else if (typeof item === "string" && item.startsWith("http")) {
          const lowerItem = item.toLowerCase();
          if (lowerItem.includes("cloudinary.com") || lowerItem.includes(".pdf")) {
            return item;
          }
        }
      }
    }
    if (val && typeof val === "object") {
      const url = val.url || val.fileUrl || val.secure_url;
      if (typeof url === "string" && url.startsWith("http")) {
        const lowerUrl = url.toLowerCase();
        if (lowerUrl.includes("cloudinary.com") || lowerUrl.includes(".pdf")) {
          return url;
        }
      }
    }
  }

  return null;
};

/**
 * Downloads a resume PDF from a given URL and returns it as a Buffer.
 * 
 * @param {string} url - The URL to download the file from.
 * @returns {Promise<Buffer>} The file content buffer.
 */
export const downloadResume = async (url) => {
  if (!url) {
    throw new Error("Cannot download resume: No URL provided.");
  }

  try {
    const response = await axios.get(url, {
      responseType: "arraybuffer",
      timeout: 30000, // 30s timeout
    });

    return Buffer.from(response.data);
  } catch (error) {
    throw new Error(`Failed to download resume from ${url}: ${error.message}`);
  }
};
