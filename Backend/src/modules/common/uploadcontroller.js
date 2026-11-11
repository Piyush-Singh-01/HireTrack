import User from "../users/user.model.js";
import { getCloudinary } from "../../common/utils/cloudinary.js";

const uploadFile = async (req, res) => {
  try {
    const companyCode = req.user?.companyCode;

    if (!companyCode) {
      return res.status(401).json({
        success: false,
        message: "Company context missing",
      });
    }

    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const superAdmin = await User.findOne({
      companyCode,
      role: "SuperAdmin",
    });

    const effectiveCloudName =
      superAdmin?.cloudinary?.cloudName?.trim() || process.env.CLOUDINARY_CLOUD_NAME;
    const effectiveApiKey =
      superAdmin?.cloudinary?.apiKey?.trim() || process.env.CLOUDINARY_API_KEY;
    const effectiveApiSecret =
      superAdmin?.cloudinary?.apiSecret?.trim() || process.env.CLOUDINARY_API_SECRET;

    if (!effectiveCloudName || !effectiveApiKey || !effectiveApiSecret) {
      return res.status(400).json({
        success: false,
        message: "Cloudinary not configured",
      });
    }

    const cloudinaryInstance = getCloudinary(superAdmin?.cloudinary);

    const folder = req.body?.folder
      ? `${companyCode}/${req.body.folder}`
      : `${companyCode}/uploads`;

    const result = await new Promise(
      (resolve, reject) => {
        const stream =
          cloudinaryInstance.uploader.upload_stream(
            {
              folder,
              resource_type: "auto",
            },
            (error, uploaded) => {
              if (error) reject(error);
              else resolve(uploaded);
            }
          );

        stream.end(file.buffer);
      }
    );

    return res.status(201).json({
      success: true,
      data: {
        fileUrl: result.secure_url,
        publicId: result.public_id,
        fileName: file.originalname,
        fileType: file.mimetype,
        size: file.size,
        companyCode,
      },
    });
  } catch (error) {
    console.error("Upload Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default uploadFile;
