import mongoose from "mongoose";
import Application from "./applicantSchema.js";

const getAllApplications = async (req, res) => {
  try {
    const companyCode = req.user?.companyCode;

    if (!companyCode) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: companyCode missing",
      });
    }

    const { id, jobId, status } = req.query;

    /* ---------------- GET SINGLE ---------------- */
    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid application id",
        });
      }

      const application = await Application.findOne({
        _id: id,
        companyCode,
      })
        .populate("candidateId", "name email mobile")
        .populate("jobId", "jobTitle department")
        .populate("formId", "fields title")
        .lean();

      if (!application) {
        return res.status(404).json({
          success: false,
          message: "Application not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: application,
      });
    }

    /* ---------------- GET ALL ---------------- */
    const filter = { companyCode };

    if (jobId && mongoose.Types.ObjectId.isValid(jobId)) {
      filter.jobId = jobId;
    }

    if (status) {
      filter.profileStatus = status;
    }

    const applications = await Application.find(filter)
      .populate("candidateId", "name email mobile")
      .populate("jobId", "jobTitle department")
      .populate("formId", "fields title")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });

  } catch (error) {
    console.error("Application Lookup Error:", error);

    return res.status(500).json({
      success: false,
      message: "Error fetching applications",
      error: error.message,
    });
  }
};

export default getAllApplications;
