import mongoose from "mongoose";
import Job from "./job.model.js";
import Application from "../applications/applicantSchema.js";

const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const companyCode = req.user.companyCode;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job id",
      });
    }

    // Find job with tenant safety
    const job = await Job.findOne({ _id: id, companyCode });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found for your company",
      });
    }

    // ✅ Delete all applications for this job (tenant-aware)
    const deletedApplications = await Application.deleteMany({
      jobId: id,
      companyCode,
    });

    // ✅ Delete the job
    await Job.findOneAndDelete({ _id: id, companyCode });

    return res.status(200).json({
      success: true,
      message: "Job and associated applications deleted successfully",
      data: {
        deletedJobId: id,
        jobTitle: job.jobTitle,
        applicationsDeleted: deletedApplications.deletedCount,
      },
    });
  } catch (err) {
    console.error("Delete Job Error:", err);

    return res.status(500).json({
      success: false,
      message: "Error while deleting job",
    });
  }
};

export default deleteJob;
