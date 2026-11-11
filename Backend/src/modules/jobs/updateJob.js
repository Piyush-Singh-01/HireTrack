import mongoose from "mongoose";
import Job from "./job.model.js";

/**
 * Update Published Job (SaaS multi-tenant)
 * PUT /api/jobs/:id
 */
const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const companyCode = req.user.companyCode;

    // -------------------------
    // Security: Ignore jobCode from payload
    // -------------------------
    delete req.body.jobCode;

    // -------------------------
    // Validate ObjectId
    // -------------------------
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job id",
      });
    }

    // -------------------------
    // Allowed fields
    // -------------------------
    const allowedFields = [
      "jobTitle",
      "jobRole",
      "department",
      "jobLocation",
      "jobType",
      "experience",
      "hiringManager",
      "numberOfOpenings",
      "jobStatus",
      "closingDate",
      "about",
      "responsibilities",
      "requirements",
      "preferredQualifications",
      "lookingFor",
      "companyInfo",
      "applicationLink",
      "posterVisuals",
      "formId",
      "screeningId",
            "joiningInstructions",

    ];

    const updateData = {};
    console.log("=== UPDATE JOB DEBUG ===");
    console.log("req.body.screeningId:", req.body.screeningId);
    
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        // Prevent accidental nullification of critical references
        if ((field === "screeningId" || field === "formId") && req.body[field] === null) {
          return;
        }
        updateData[field] = req.body[field];
      }
    });
    console.log("updateData.screeningId after filter:", updateData.screeningId);

    const processManager = async (managerInput) => {
      if (!managerInput) return null;
      if (typeof managerInput === "object" && managerInput.userId && managerInput.name && managerInput.onModel) {
        return {
          name: managerInput.name,
          userId: managerInput.userId,
          onModel: managerInput.onModel,
        };
      }
      
      let managerProfile = null;
      let onModel = "UserAndRole";
      let searchValue = managerInput;

      if (typeof managerInput === "object" && !mongoose.Types.ObjectId.isValid(managerInput)) {
        searchValue = managerInput.userId || managerInput.name || "";
        if (managerInput.onModel) onModel = managerInput.onModel;
      }

      if (mongoose.Types.ObjectId.isValid(searchValue)) {
        if (onModel === "User") {
          const User = mongoose.model("User");
          managerProfile = await User.findOne({ _id: searchValue, companyCode });
        } else {
          const UserAndRole = mongoose.model("UserAndRole");
          managerProfile = await UserAndRole.findOne({ _id: searchValue, companyCode });
          if (!managerProfile) {
            const User = mongoose.model("User");
            managerProfile = await User.findOne({ _id: searchValue, companyCode });
            if (managerProfile) onModel = "User";
          }
        }
      }

      if (!managerProfile && typeof searchValue === "string" && searchValue.trim()) {
        const UserAndRole = mongoose.model("UserAndRole");
        managerProfile = await UserAndRole.findOne({
          $and: [{ companyCode }, { $or: [{ Name: searchValue }, { Email: searchValue.toLowerCase() }] }],
        });
        if (!managerProfile) {
          const User = mongoose.model("User");
          managerProfile = await User.findOne({
            $and: [{ companyCode }, { $or: [{ userName: searchValue }, { businessEmail: searchValue.toLowerCase() }] }],
          });
          if (managerProfile) onModel = "User";
        }
      }

      if (managerProfile) {
        return {
          name: managerProfile.Name || managerProfile.userName,
          userId: managerProfile._id,
          onModel: onModel,
        };
      }
      return null;
    };

    if (req.body.hiringManagers !== undefined && Array.isArray(req.body.hiringManagers)) {
      const arr = [];
      for (const hm of req.body.hiringManagers) {
        const processed = await processManager(hm);
        if (processed) arr.push(processed);
      }
      updateData.hiringManagers = arr;
    }

    if (req.body.hiringManager !== undefined) {
      if (req.body.hiringManager) {
        const processed = await processManager(req.body.hiringManager);
        if (processed) updateData.hiringManager = processed;
      } else {
        updateData.hiringManager = null;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields to update",
      });
    }

    // -------------------------
    // Fetch job (tenant-safe)
    // -------------------------
    const job = await Job.findOne({ _id: id, companyCode });
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found for your company",
      });
    }

    // -------------------------
    // Apply updates
    // -------------------------
    Object.assign(job, updateData);

    // -------------------------
    // Publish logic
    // -------------------------
    job.isDraft = false;
    job.publishedAt = new Date();

    // -------------------------
    // Save with retry (handles duplicate jobCode)
    // -------------------------
    let saved = false;

    while (!saved) {
      try {
        // Ensure jobCode exists
        if (!job.jobCode || job.jobCode.trim() === "") {
          job.jobCode = await generateUniqueJobCode(companyCode);
        }

        await job.save();
        saved = true;

      } catch (err) {
        if (err.code === 11000) {
          // Duplicate → regenerate and retry
          job.jobCode = undefined;
          continue;
        }
        throw err;
      }
    }

    res.status(200).json({
      success: true,
      message: "Job updated successfully",
      data: job,
    });

  } catch (error) {
    console.error("Update Job Error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Invalid data entered",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export default updateJob;

/**
 * Generate unique jobCode per company
 */
const generateUniqueJobCode = async (companyCode) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code;
  let exists = true;

  while (exists) {
    code = Array.from({ length: 8 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join("");

    exists = await Job.findOne({ jobCode: code, companyCode });
  }

  return code;
};
