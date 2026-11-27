import User from "../../users/user.model.js";
import { fetchCloudinaryFileBuffer } from "../../../common/utils/cloudinary.js";

const pickUrlFromItem = (item) => {
  if (!item) return null;
  if (typeof item === "string" && item.startsWith("http")) {
    return { url: item, publicId: null, fileName: null };
  }
  if (typeof item === "object") {
    const url = item.url || item.fileUrl || item.secure_url;
    if (typeof url === "string" && url.startsWith("http")) {
      return {
        url,
        publicId: item.publicId || item.public_id || null,
        fileName: item.fileName || item.originalname || null,
      };
    }
  }
  return null;
};

/**
 * Extracts the resume attachment metadata (url, publicId, fileName) from candidate answers.
 *
 * @param {object} answers - The answers object from the Application model.
 * @returns {{ url: string, publicId: string|null, fileName: string|null } | null}
 */
export const extractResumeAttachment = (answers) => {
  if (!answers || typeof answers !== "object") {
    return null;
  }

  // 1. Direct check of common keys
  const commonKeys = ["attachments", "resume", "resumeUrl", "resume_url", "cv", "file", "pdf"];
  for (const key of commonKeys) {
    const val = answers[key];
    if (!val) continue;

    if (Array.isArray(val)) {
      for (const item of val) {
        const picked = pickUrlFromItem(item);
        if (picked) return picked;
      }
    } else {
      const picked = pickUrlFromItem(val);
      if (picked) return picked;
    }
  }

  // 2. Scan all properties in answers for a Cloudinary PDF link or .pdf extension
  const isPdfOrCloudinary = (url) => {
    const lower = url.toLowerCase();
    return lower.includes("cloudinary.com") || lower.includes(".pdf");
  };

  for (const val of Object.values(answers)) {
    if (!val) continue;

    if (Array.isArray(val)) {
      for (const item of val) {
        const picked = pickUrlFromItem(item);
        if (picked && isPdfOrCloudinary(picked.url)) return picked;
      }
    } else {
      const picked = pickUrlFromItem(val);
      if (picked && isPdfOrCloudinary(picked.url)) return picked;
    }
  }

  return null;
};

/**
 * Extracts the resume URL from the candidate's application answers.
 * Uses multiple lookup strategies to handle dynamic form structures.
 * 
 * @param {object} answers - The answers object from the Application model.
 * @returns {string|null} The extracted resume URL, or null if not found.
 */
export const extractResumeUrl = (answers) => {
  return extractResumeAttachment(answers)?.url || null;
};

/**
 * Downloads a resume PDF from a given URL and returns it as a Buffer.
 * Supports authenticated Cloudinary fallback when public PDF delivery is restricted.
 * 
 * @param {string} url - The URL to download the file from.
 * @param {object} [options] - Optional tenant/Cloudinary metadata.
 * @param {string} [options.companyCode] - Tenant companyCode for custom Cloudinary config.
 * @param {string} [options.publicId] - Optional Cloudinary public_id.
 * @returns {Promise<Buffer>} The file content buffer.
 */
export const downloadResume = async (url, options = {}) => {
  if (!url) {
    throw new Error("Cannot download resume: No URL provided.");
  }

  try {
    let cloudinaryConfig = options.cloudinaryConfig || null;
    if (!cloudinaryConfig && options.companyCode) {
      const superAdmin = await User.findOne({
        companyCode: options.companyCode,
        role: "SuperAdmin",
      })
        .select("cloudinary")
        .lean();
      cloudinaryConfig = superAdmin?.cloudinary || null;
    }

    const { buffer } = await fetchCloudinaryFileBuffer({
      url,
      publicId: options.publicId,
      cloudinaryConfig,
      timeout: 30000,
    });

    return buffer;
  } catch (error) {
    throw new Error(`Failed to download resume from ${url}: ${error.message}`);
  }
};
