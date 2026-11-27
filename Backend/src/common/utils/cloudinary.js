import { v2 as cloudinary } from "cloudinary";
import axios from "axios";
import nodemailer from "nodemailer";


export const getCloudinary = (config) => {
  const instance = { ...cloudinary };

  const cloud_name =
    (config?.cloudName && config.cloudName.trim()) ||
    process.env.CLOUDINARY_CLOUD_NAME;

  const api_key =
    (config?.apiKey && config.apiKey.trim()) ||
    process.env.CLOUDINARY_API_KEY;

  const api_secret =
    (config?.apiSecret && config.apiSecret.trim()) ||
    process.env.CLOUDINARY_API_SECRET;

  instance.config({
    cloud_name,
    api_key,
    api_secret,
  });

  return instance;
};

/**
 * Parses a Cloudinary delivery URL into cloudName, resourceType, deliveryType, publicId, and format.
 */
export const parseCloudinaryUrl = (url) => {
  if (!url || typeof url !== "string") return null;

  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("cloudinary.com")) return null;

    // Path format: /<cloudName>/<resourceType>/<deliveryType>/[transformations/][v<version>/]<publicId>[.<ext>]
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length < 4) return null;

    const [cloudName, resourceType, deliveryType, ...rest] = parts;
    const versionIdx = rest.findIndex((segment) => /^v\d+$/.test(segment));
    const idSegments = versionIdx !== -1 ? rest.slice(versionIdx + 1) : rest;
    if (idSegments.length === 0) return null;

    const joined = decodeURIComponent(idSegments.join("/"));
    const lastDotIdx = joined.lastIndexOf(".");
    const hasExt = lastDotIdx > joined.lastIndexOf("/");
    const ext = hasExt ? joined.slice(lastDotIdx + 1) : "";

    const publicId =
      resourceType === "raw"
        ? joined
        : hasExt
        ? joined.slice(0, lastDotIdx)
        : joined;

    return {
      cloudName,
      resourceType,
      deliveryType,
      publicId,
      format: resourceType === "raw" ? "" : ext || "pdf",
    };
  } catch {
    return null;
  }
};

/**
 * Fetches a resume file as a Buffer, falling back to Cloudinary's authenticated
 * private_download_url when public CDN delivery returns 401/403 (e.g. PDF ACL restriction).
 */
export const fetchCloudinaryFileBuffer = async ({
  url,
  publicId,
  cloudinaryConfig,
  timeout = 30000,
}) => {
  if (!url) {
    throw new Error("No file URL provided.");
  }

  try {
    const response = await axios.get(url, {
      responseType: "arraybuffer",
      timeout,
    });
    return {
      buffer: Buffer.from(response.data),
      contentType: response.headers["content-type"] || "application/pdf",
    };
  } catch (directError) {
    const status = directError?.response?.status;
    const parsed = parseCloudinaryUrl(url);

    // Only attempt authenticated Cloudinary fallback if URL is on Cloudinary
    if (!parsed && !publicId) {
      throw directError;
    }

    const effectiveCloudName =
      (cloudinaryConfig?.cloudName && cloudinaryConfig.cloudName.trim()) ||
      process.env.CLOUDINARY_CLOUD_NAME;
    const effectiveApiKey =
      (cloudinaryConfig?.apiKey && cloudinaryConfig.apiKey.trim()) ||
      process.env.CLOUDINARY_API_KEY;
    const effectiveApiSecret =
      (cloudinaryConfig?.apiSecret && cloudinaryConfig.apiSecret.trim()) ||
      process.env.CLOUDINARY_API_SECRET;

    if (!effectiveCloudName || !effectiveApiKey || !effectiveApiSecret) {
      throw directError;
    }

    // If URL belongs to a different cloud than the configured credentials, don't mask original error
    if (parsed?.cloudName && parsed.cloudName !== effectiveCloudName) {
      throw directError;
    }

    if (status && ![401, 403, 404].includes(status)) {
      throw directError;
    }

    const cloudinaryInstance = getCloudinary({
      cloudName: effectiveCloudName,
      apiKey: effectiveApiKey,
      apiSecret: effectiveApiSecret,
    });

    const resourceType = parsed?.resourceType || "image";
    const deliveryType = parsed?.deliveryType || "upload";
    const format = parsed ? parsed.format : "pdf";
    const targetPublicId = publicId || parsed?.publicId;

    if (!targetPublicId) {
      throw directError;
    }

    const privateUrl = cloudinaryInstance.utils.private_download_url(
      targetPublicId,
      format,
      {
        resource_type: resourceType,
        type: deliveryType,
      }
    );

    const authResponse = await axios.get(privateUrl, {
      responseType: "arraybuffer",
      timeout,
    });

    return {
      buffer: Buffer.from(authResponse.data),
      contentType: authResponse.headers["content-type"] || "application/pdf",
    };
  }
};

export const createTransporter = (
  provider,
  email,
  password,
  host,
  port,
  secure
) => {
  const isGmail =
    provider?.toLowerCase().trim() === "gmail" ||
    email?.includes("@gmail.com");

  if (isGmail) {
    return nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: email,
        pass: password,
      },
    });
  }

  return nodemailer.createTransport({
  host, 
  port, 
  secure, 
  auth: {
     user: email, 
     pass: password,
    
    },
    
  });
};
