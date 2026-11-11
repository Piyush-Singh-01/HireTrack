import mongoose from "mongoose";
import Job from "./job.model.js";

const getDraftJobs = async (
  req,
  res
) => {
  try {
    const companyCode =
      req.user?.companyCode;

    if (!companyCode) {
      return res.status(401).json({
        success: false,
        message:
          "Unauthorized: companyCode missing",
      });
    }

    const {
      id,
      page = 1,
      limit = 10,
      sortBy = "draftSavedAt",
      order = "desc",
    } = req.query;

    // =====================================
    // MODE 1 -> GET SINGLE DRAFT
    // =====================================
    if (id) {
      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid draft id",
        });
      }

      const draft =
        await Job.findOne({
          _id: id,
          isDraft: true,
          companyCode,
        })
          .populate(
            "formId"
          )
          .lean();

      if (!draft) {
        return res.status(404).json({
          success: false,
          message:
            "Draft not found for your company",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Draft retrieved successfully",
        data: draft,
      });
    }

    // =====================================
    // MODE 2 -> GET ALL DRAFTS
    // =====================================

    const currentPage =
      Math.max(
        parseInt(
          page
        ) || 1,
        1
      );

    const perPage =
      Math.min(
        Math.max(
          parseInt(
            limit
          ) || 10,
          1
        ),
        50
      );

    const skip =
      (currentPage -
        1) *
      perPage;

    const sortOrder =
      order === "asc"
        ? 1
        : -1;

    const filter = {
      isDraft: true,
      companyCode,
    };

    const [
      drafts,
      totalDrafts,
    ] =
      await Promise.all([
        Job.find(filter)
          .populate(
            "formId"
          )
          .sort({
            [sortBy]:
              sortOrder,
          })
          .skip(skip)
          .limit(perPage)
          .lean(),

        Job.countDocuments(
          filter
        ),
      ]);

    return res.status(200).json({
      success: true,
      message:
        "Drafts retrieved successfully",

      pagination: {
        count:
          drafts.length,
        totalDrafts,
        currentPage,
        totalPages:
          Math.ceil(
            totalDrafts /
              perPage
          ),
      },

      data: drafts,
    });
  } catch (error) {
    console.error(
      "Draft fetch error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Error while fetching drafts",
    });
  }
};

export default getDraftJobs;
