import mongoose from "mongoose";
import Application from "./applicantSchema.js";

const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const companyCode = req.user?.companyCode;

    if (!companyCode) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: companyCode missing",
      });
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application id",
      });
    }

    // Soft delete is often safer in production
    // For hard delete, ensure companyCode matches
    const deletedApplication = await Application.findOneAndDelete({
      _id: id,
      companyCode,
    });

    if (!deletedApplication) {
      return res.status(404).json({
        success: false,
        message: "Application not found or not authorized",
      });
    }

    res.status(200).json({
      success: true,
      message: "Application deleted successfully",
      data: { applicationId: deletedApplication._id },
    });
  } catch (error) {
    console.error("Delete Application Error:", error);

    res.status(500).json({
      success: false,
      message: "Error deleting application",
      error: error.message,
    });
  }
};

export default deleteApplication;
