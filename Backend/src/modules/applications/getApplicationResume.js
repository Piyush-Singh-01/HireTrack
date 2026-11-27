import mongoose from "mongoose";
import Application from "./applicantSchema.js";
import User from "../users/user.model.js";
import { fetchCloudinaryFileBuffer } from "../../common/utils/cloudinary.js";
import { extractResumeAttachment } from "../resume-analysis/helpers/resumeDownloader.js";

const getApplicationResume = async (req, res) => {
  try {
    const companyCode = req.user?.companyCode;
    const { id } = req.params;

    if (!companyCode) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: companyCode missing",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application id",
      });
    }

    const application = await Application.findOne({ _id: id, companyCode }).lean();

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    const attachment = extractResumeAttachment(application.answers);

    if (!attachment?.url) {
      return res.status(404).json({
        success: false,
        message: "No resume file found for this application",
      });
    }

    const superAdmin = await User.findOne({
      companyCode,
      role: "SuperAdmin",
    })
      .select("cloudinary")
      .lean();

    const { buffer, contentType } = await fetchCloudinaryFileBuffer({
      url: attachment.url,
      publicId: attachment.publicId,
      cloudinaryConfig: superAdmin?.cloudinary,
    });

    const rawFileName = attachment.fileName || "resume.pdf";
    const safeFileName = rawFileName.replace(/["\r\n]/g, "_");

    res.setHeader("Content-Type", contentType || "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${safeFileName}"`);
    res.setHeader("Cache-Control", "private, max-age=300");

    return res.status(200).send(buffer);
  } catch (error) {
    console.error("Get Application Resume Error:", error?.message || error);

    return res.status(502).json({
      success: false,
      message: "Failed to load resume file",
      error: error?.message,
    });
  }
};

export default getApplicationResume;
