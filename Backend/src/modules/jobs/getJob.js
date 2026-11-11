import mongoose from "mongoose";
import Job from "./job.model.js";

// Get all published jobs for the logged-in user's company
const getJob = async (req, res) => {
  try {
    const companyCode = req.user.companyCode; 

    // const today = new Date();
    // today.setHours(23, 59, 59, 999);
    
    // await Job.updateMany(
    //   {
    //     companyCode,
    //     closingDate: { $lte: today },
    //     jobStatus: { $ne: "Closed" },
    //     isDraft: false,
    //   },
    //   {
    //     $set: { jobStatus: "Closed" },
    //   }
    // );

    
    let { page = 1, limit = 10 } = req.query;
    page = Math.max(parseInt(page), 1);
    limit = Math.min(Math.max(parseInt(limit), 1), 50);
    const skip = (page - 1) * limit;

    const filter = { isDraft: false, companyCode };

    const jobs = await Job.find(filter)
      .populate("formId")
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalJobs = await Job.countDocuments(filter);

    res.status(200).json({
      success: true,
      pagination: {
        count: jobs.length,
        totalJobs,
        currentPage: page,
        totalPages: Math.ceil(totalJobs / limit),
      },
      data: jobs,
    });
  } catch (err) {
    console.error("Get Jobs Error:", err);
    res.status(500).json({
      success: false,
      message: "Error while fetching jobs",
    });
  }
};

// Get job by application slug (published + draft allowed for same company)
const getJobBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    // const companyCode = req.user.companyCode;

    // const today = new Date();
    // today.setHours(23, 59, 59, 999);
    
    // await Job.updateMany(
    //   {
        
    //     closingDate: { $lte: today },
    //     jobStatus: { $ne: "Closed" },
    //     isDraft: false,
    //   },
    //   {
    //     $set: { jobStatus: "Closed" },
    //   }
    // );


    if (!slug) {
      return res.status(400).json({ success: false, message: "Slug is required" });
    }

    const isObjectId = mongoose.Types.ObjectId.isValid(slug);
    const query = {
      $or: [
        { applicationSlug: slug },
        { applicationLink: `/apply/${slug}` },
        ...(isObjectId ? [{ _id: slug }] : []),
      ],
    };

    let job = await Job.findOne(query)
      .populate("formId")
      .lean();

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    res.status(200).json({ success: true, data: job });
  } catch (err) {
    console.error("Get Job By Slug Error:", err);
    res.status(500).json({ success: false, message: "Error while fetching job" });
  }
};

// Get job by ID
const getJobById = async (req, res) => {
  try {
    const { id } = req.params;
    const companyCode = req.user.companyCode;

    // const today = new Date();
    // today.setHours(23, 59, 59, 999);
    
    // await Job.updateMany(
    //   {
    //     companyCode,
    //     closingDate: { $lte: today },
    //     jobStatus: { $ne: "Closed" },
    //     isDraft: false,
    //   },
    //   {
    //     $set: { jobStatus: "Closed" },
    //   }
    // );
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid job id" });
    }

    const job = await Job.findOne({ _id: id, companyCode })
      .populate("formId")
      .lean();

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    res.status(200).json({ success: true, data: job });
  } catch (err) {
    console.error("Get Job By ID Error:", err);
    res.status(500).json({ success: false, message: "Error while fetching job" });
  }
};

// Get job by jobCode
const getJobByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const companyCode = req.user.companyCode;

    // const today = new Date();
    // today.setHours(23, 59, 59, 999);
    
    // await Job.updateMany(
    //   {
    //     companyCode,
    //     closingDate: { $lte: today },
    //     jobStatus: { $ne: "Closed" },
    //     isDraft: false,
    //   },
    //   {
    //     $set: { jobStatus: "Closed" },
    //   }
    // );

    if (!code) return res.status(400).json({ success: false, message: "Job code is required" });

    const job = await Job.findOne({ jobCode: code, companyCode }).lean();
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });

    res.status(200).json({ success: true, data: job });
  } catch (err) {
    console.error("Get Job By Code Error:", err);
    res.status(500).json({ success: false, message: "Error while fetching job" });
  }
};

export { getJob, getJobById, getJobBySlug, getJobByCode };
