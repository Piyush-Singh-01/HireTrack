import Application from "./applicantSchema.js";

/**
 * Get count of candidates hired in the current month
 * GET /api/applications/hired-this-month/count
 */
const getHiredThisMonthCount = async (req, res) => {
  try {
    const companyCode = req.user?.companyCode;

    if (!companyCode) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: companyCode missing",
      });
    }

    const now = new Date();

    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
      0, 0, 0, 0
    );

    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23, 59, 59, 999
    );

    const hiredThisMonthCount = await Application.countDocuments({
      companyCode,                      // ✅ Tenant isolation (critical)
      profileStatus: "hired",
      "hiringDetails.hiredOn": {
        $gte: startOfMonth,
        $lte: endOfMonth,
      },
    });

    res.status(200).json({
      success: true,
      message: "Hired this month count retrieved successfully",
      data: {
        hiredThisMonthCount,
        month: now.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
      },
    });
  } catch (error) {
    console.error("Error fetching hired this month count:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export default getHiredThisMonthCount;
