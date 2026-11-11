import Application from "./applicantSchema.js";
import Job from "../jobs/job.model.js";
import userModel from "../users/user.model.js";
import { getCloudinary } from "../../common/utils/cloudinary.js";

export const uploadPdf = async (req, res) => {
  try {
    const { slug } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const job = await Job.findOne({ applicationSlug: slug });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const companyCode = job.companyCode;

    const superAdmin = await userModel.findOne({
      companyCode,
      role: "SuperAdmin",
    });

    const cloudinaryConfig = {
      cloudName: superAdmin?.cloudinary?.cloudName || process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: superAdmin?.cloudinary?.apiKey || process.env.CLOUDINARY_API_KEY,
      apiSecret: superAdmin?.cloudinary?.apiSecret || process.env.CLOUDINARY_API_SECRET,
    };

    if (!cloudinaryConfig.cloudName || !cloudinaryConfig.apiKey || !cloudinaryConfig.apiSecret) {
      return res.status(400).json({
        success: false,
        message: "Cloudinary configuration is missing (both SuperAdmin profile and .env)",
      });
    }

    const cloudinaryInstance = getCloudinary(cloudinaryConfig);

    const result = await new Promise((resolve, reject) => {
      cloudinaryInstance.uploader.upload_stream(
        {
          folder: `${companyCode}/temp`,
          resource_type: "auto",
        },
        (error, uploaded) => {
          if (error) return reject(error);
          resolve(uploaded);
        }
      ).end(req.file.buffer);
    });

    return res.status(200).json({
      success: true,
      file: {
        url: result.secure_url,
        publicId: result.public_id,
        fileName: req.file.originalname,
      },
    });

  } catch (error) {
    console.log("Upload Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
