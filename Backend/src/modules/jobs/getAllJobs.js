import mongoose from "mongoose";
import Job from "./job.model.js";

const getJobsLookup = async (
  req,
  res
) => {
  try {
    const {
      mode = "list",
      slug,
      code,
      id,
      page = 1,
      limit = 10,
    } = req.query;

    const companyCode =
      req.user?.companyCode;

   // =====================================
    // // AUTO CLOSE EXPIRED JOBS
    // // =====================================
    // const today =
    //   new Date();

    // today.setHours(
    //   23,
    //   59,
    //   59,
    //   999
    // );

    // const autoCloseFilter =
    //   {
    //     closingDate:
    //       {
    //         $lte: today,
    //       },
    //     jobStatus:
    //       {
    //         $ne:
    //           "Closed",
    //       },
    //     isDraft:
    //       false,
    //   };

    // if (companyCode) {
    //   autoCloseFilter.companyCode =
    //     companyCode;
    // }

    // await Job.updateMany(
    //   autoCloseFilter,
    //   {
    //     $set: {
    //       jobStatus:
    //         "Closed",
    //     },
    //   }
    // );

    // =====================================
    // PRIORITY 1 -> SLUG
    // public route
    // =====================================
    if (slug) {
      const job =
        await Job.findOne(
          {
            applicationSlug:
              slug,
          }
        )
          .populate(
            "formId"
          )
          .lean();

      if (!job) {
        return res.status(
          404
        ).json({
          success:
            false,
          message:
            "Job not found",
        });
      }

      return res
        .status(200)
        .json({
          success:
            true,
          data: job,
        });
    }

    // =====================================
    // PRIORITY 2 -> ID
    // protected route recommended
    // =====================================
    if (id) {
      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res.status(
          400
        ).json({
          success:
            false,
          message:
            "Invalid job id",
        });
      }

      const filter =
        { _id: id };

      if (companyCode) {
        filter.companyCode =
          companyCode;
      }

      const job =
        await Job.findOne(
          filter
        )
          .populate(
            "formId"
          )
          .lean();

      if (!job) {
        return res.status(
          404
        ).json({
          success:
            false,
          message:
            "Job not found",
        });
      }

      return res
        .status(200)
        .json({
          success:
            true,
          data: job,
        });
    }

    // =====================================
    // PRIORITY 3 -> CODE
    // protected route recommended
    // =====================================
    if (code) {
      const filter =
        {
          jobCode:
            code,
        };

      if (companyCode) {
        filter.companyCode =
          companyCode;
      }

      const job =
        await Job.findOne(
          filter
        ).lean();

      if (!job) {
        return res.status(
          404
        ).json({
          success:
            false,
          message:
            "Job not found",
        });
      }

      return res
        .status(200)
        .json({
          success:
            true,
          data: job,
        });
    }

    // =====================================
    // DEFAULT MODE -> LIST
    // published jobs only
    // =====================================
    if (!companyCode) {
      return res.status(
        401
      ).json({
        success:
          false,
        message:
          "Unauthorized: companyCode missing",
      });
    }

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

    const filter =
      {
        companyCode,
        isDraft:
          false,
      };

    const [
      jobs,
      totalJobs,
    ] =
      await Promise.all(
        [
          Job.find(
            filter
          )
            .populate(
              "formId"
            )
            .sort({
              publishedAt:
                -1,
            })
            .skip(
              skip
            )
            .limit(
              perPage
            )
            .lean(),

          Job.countDocuments(
            filter
          ),
        ]
      );

    return res
      .status(200)
      .json({
        success:
          true,

        pagination:
          {
            count:
              jobs.length,
            totalJobs,
            currentPage,
            totalPages:
              Math.ceil(
                totalJobs /
                  perPage
              ),
          },

        data: jobs,
      });
  } catch (error) {
    console.error(
      "Job lookup error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Error while fetching job",
    });
  }
};

export default getJobsLookup;
