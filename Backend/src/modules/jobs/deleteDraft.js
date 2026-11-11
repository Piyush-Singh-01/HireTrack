import mongoose from "mongoose";
import Job from "./job.model.js";

/**
 * Delete Draft
 * DELETE /api/jobs/deleteDraft/:id
 */
const deleteDraft = async (req, res) => {
  try {
    const { id } = req.params;
    const companyCode = req.user?.companyCode;

    // 1️⃣ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid draft id",
      });
    }

    // 2️⃣ Ensure companyCode exists
    if (!companyCode) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: company code missing",
      });
    }

    // 3️⃣ Find & delete draft with tenant isolation
    const draft = await Job.findOneAndDelete({
      _id: id,
      isDraft: true,
      createdBy: req.user.id,
      companyCode: companyCode,
    });

    if (!draft) {
      return res.status(404).json({
        success: false,
        message:
          "Draft not found, already published, or you are not authorized",
      });
    }

    res.status(200).json({
      success: true,
      message: "Draft deleted successfully",
      data: {
        deletedDraftId: id,
        jobTitle: draft.jobTitle || "Untitled Draft",
      },
    });
  } catch (err) {
    console.error("Delete Draft Error:", err);
    res.status(500).json({
      success: false,
      message: "Error while deleting draft",
    });
  }
};

export default deleteDraft;
