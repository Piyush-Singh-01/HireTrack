import mongoose from "mongoose";
import Job from "./job.model.js";
import UserandRole from "../users/userandroleSchema.js";

const createJob = async (req, res) => {
  try {
    const companyCode = req.user.companyCode;

    const {
      isDraft = false,
      jobTitle,
      jobRole,
      department,
      jobLocation,
      jobType,
      jobCode,
      experience,
      hiringManager,
      hiringManagers,
      numberOfOpenings,
      jobStatus,
      closingDate,
      about,
      responsibilities,
      requirements,
      preferredQualifications,
      lookingFor,
      applicationLink,
      companyInfo,
      posterVisuals,
      formId,
      joiningInstructions,
    } = req.body;

    let hiringManagerObject = null;
    let hiringManagersArray = [];

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
        if (managerInput.onModel) {
          onModel = managerInput.onModel;
        }
      }

      if (mongoose.Types.ObjectId.isValid(searchValue)) {
        if (onModel === "User") {
          const User = mongoose.model("User");
          managerProfile = await User.findOne({ _id: searchValue, companyCode });
        } else {
          managerProfile = await UserandRole.findOne({ _id: searchValue, companyCode });
          if (!managerProfile) {
            const User = mongoose.model("User");
            managerProfile = await User.findOne({ _id: searchValue, companyCode });
            if (managerProfile) onModel = "User";
          }
        }
      }

      if (!managerProfile && typeof searchValue === "string" && searchValue.trim()) {
        managerProfile = await UserandRole.findOne({
          $and: [
            { companyCode },
            { $or: [{ Name: searchValue }, { Email: searchValue.toLowerCase() }] },
          ],
        });
        if (!managerProfile) {
          const User = mongoose.model("User");
          managerProfile = await User.findOne({
            $and: [
              { companyCode },
              { $or: [{ userName: searchValue }, { businessEmail: searchValue.toLowerCase() }] },
            ],
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

    if (hiringManagers && Array.isArray(hiringManagers) && hiringManagers.length > 0) {
      for (const hm of hiringManagers) {
        const processed = await processManager(hm);
        if (processed) hiringManagersArray.push(processed);
      }
    } else if (hiringManager) {
      const processed = await processManager(hiringManager);
      if (processed) hiringManagerObject = processed;
    }

    if (!isDraft && !hiringManagerObject && hiringManagersArray.length === 0) {
      return res.status(400).json({
        success: false,
        message: `Hiring manager(s) not found or not provided`,
      });
    }
    //--------------------------------
    // Required fields only if NOT draft
    // -----------------------------
    if (!isDraft) {
      const requiredFields = [
        jobTitle,
        jobRole,
        department,
        jobLocation,
        jobType,
        jobCode,
        hiringManager,
        numberOfOpenings,
        closingDate,
        about,
        responsibilities,
        requirements,
        preferredQualifications,
        lookingFor,
      ];

      if (requiredFields.some((f) => !f)) {
        return res.status(400).json({
          success: false,
          message: "All required fields must be provided for published job",
        });
      }
    }

    // -----------------------------
    // Unique jobCode check per company
    // -----------------------------
const autoJobCode = await generateUniqueJobCode(companyCode);

    // -----------------------------
    // Slug generator
    // -----------------------------
    const slugify = (value) =>
      String(value || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    // -----------------------------
    // Create Job
    // -----------------------------
    const newJob = new Job({
      companyCode, // 🔥 company association
      isDraft,
      jobTitle,
      jobRole,
      department,
      jobLocation,
      jobType,
      jobCode:autoJobCode,
      experience,
      hiringManager: hiringManagerObject,
      hiringManagers: hiringManagersArray,
      numberOfOpenings,
      jobStatus: jobStatus || "Open",
      closingDate,
      about,
      responsibilities,
      requirements,
      preferredQualifications,
      lookingFor,
      applicationLink,
      companyInfo,
      posterVisuals,
      formId: formId || null,
      draftSavedAt: isDraft ? new Date() : null,
      publishedAt: isDraft ? null : new Date(),
      createdBy:req.user.id,
            joiningInstructions,
    });


    await newJob.save();

    res.status(201).json({
      success: true,
      message: isDraft ? "Job saved as draft" : "Job created successfully",
      data: newJob,
    });
  } catch (err) {
    console.error("Create Job Error:", err);

    if (err.name === "ValidationError") {
      const fields = Object.keys(err.errors || {});
      return res.status(400).json({
        success: false,
        message: `Validation failed for: ${fields.join(", ")}`,
      });
    }

    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate jobCode",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

export default createJob;



const generateJobCode = (length = 8) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};


const generateUniqueJobCode = async (companyCode) => {
  let jobCode;
  let isDuplicate = true;

  while (isDuplicate) {
    jobCode = generateJobCode(8);

    const existing = await Job.findOne({ jobCode, companyCode });
    if (!existing) {
      isDuplicate = false;
    }
  }

  return jobCode;
};
