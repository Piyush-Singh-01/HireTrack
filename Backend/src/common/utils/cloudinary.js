import { v2 as cloudinary } from "cloudinary";
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
