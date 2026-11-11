import Job from "../jobs/job.model.js";
import mongoose from "mongoose";

export const getJobs = async (req, res) => {
  try {
    let {
      type = "all",
      single,
      page = 1,
      limit = 10,
      sortBy,
      sortOrder = "desc",
    } = req.query;

    const companyCode = req.user?.companyCode;

    if (!companyCode) {
      return res.status(401).json({
        success: false,
        message:
          "Unauthorized: companyCode missing",
      });
    }

    // =================================================
    // SINGLE FETCH BY ID
    // =================================================
    if (single) {
      if (
        !mongoose.Types.ObjectId.isValid(
          single
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid job ID format",
          error: "INVALID_JOB_ID",
        });
      }

      const job =
        await Job.findOne({
          _id: single,
          companyCode,
        })
          .populate("formId", "_id")
          .select({
            jobTitle: 1,
            jobRole: 1,
            department: 1,
            jobLocation: 1,
            jobType: 1,
            hiringManager: 1,
            numberOfOpenings: 1,
            jobStatus: 1,
            closingDate: 1,
            postedOn: 1,

            about: 1,
            responsibilities: 1,
            requirements: 1,
            preferredQualifications: 1,
            lookingFor: 1,

            applicationLink: 1,
            companyInfo: 1,
            experience: 1,
            isDraft: 1,
            jobCode: 1,
            posterVisuals: 1,
            formId: 1,
            createdAt: 1,
          })
          .lean();

      if (!job) {
        return res.status(404).json({
          success: false,
          message:
            "Job not found",
          error:
            "JOB_NOT_FOUND",
        });
      }

      const now = new Date();

      const closingDate =
        job.closingDate
          ? new Date(
              job.closingDate
            )
          : null;

      const isActive =
        job.jobStatus ===
          "Open" &&
        closingDate &&
        closingDate > now;

      const daysRemaining =
        isActive
          ? Math.ceil(
              (closingDate -
                now) /
                (1000 *
                  60 *
                  60 *
                  24)
            )
          : 0;

      return res
        .status(200)
        .json({
          success: true,
          message:
            "Job retrieved successfully",

          data: {
            job,
            isActive,
            daysRemaining,
            canApply:
              Boolean(
                job.formId
              ),
          },
        });
    }

    // =================================================
    // LISTING MODE
    // =================================================

    page = Math.max(
      parseInt(page) || 1,
      1
    );

    limit = Math.min(
      Math.max(
        parseInt(limit) ||
          10,
        1
      ),
      50
    );

    const skip =
      (page - 1) * limit;

    type =
      type.toLowerCase();

    if (
      ![
        "all",
        "open",
        "closed",
      ].includes(type)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid type. Allowed: all, open, closed",
      });
    }

    if (!sortBy) {
      sortBy =
        type === "all"
          ? "createdAt"
          : "publishedAt";
    }

    const sort = {
      [sortBy]:
        sortOrder ===
        "asc"
          ? 1
          : -1,
    };

    const filter = {
      companyCode,
      isDraft: false,
    };

    const today =
      new Date();

    today.setHours(
      0,
      0,
      0,
      0
    );

    // ---------------------------------
    // OPEN
    // ---------------------------------
    if (type === "open") {
      filter.isDraft =
        false;

      filter.$nor = [
        {
          jobStatus:
            "Closed",
        },
        {
          closingDate:
            {
              $lt: today,
            },
        },
      ];
    }

    // ---------------------------------
    // CLOSED
    // ---------------------------------
    if (
      type === "closed"
    ) {
      filter.isDraft =
        false;

      filter.$or = [
        {
          jobStatus:
            "Closed",
        },
        {
          closingDate:
            {
              $lt: today,
            },
        },
      ];
    }

    const [jobs, totalJobs] =
      await Promise.all([
        Job.find(filter)
          .populate(
            "formId",
            "_id title"
          )
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),

        Job.countDocuments(
          filter
        ),
      ]);

    const totalPages =
      Math.ceil(
        totalJobs / limit
      ) || 1;

    return res
      .status(200)
      .json({
        success: true,
        message: `${type} jobs retrieved successfully`,

        data: {
          type,
          jobs,

          pagination:
            {
              currentPage:
                page,
              totalPages,
              totalJobs,
              hasNextPage:
                page <
                totalPages,
              hasPrevPage:
                page >
                1,
              limit,
            },
        },
      });
  } catch (error) {
    console.error(
      "Error fetching jobs:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Internal server error",
    });
  }
};

export default getJobs;

