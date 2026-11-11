import { calculateAverageTimeToHire } from "../../common/utils/analytics.js";

const averageTimeToHire = async (req, res) => {
  try {
    const companyCode = req.user?.companyCode;

    if (!companyCode) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: companyCode missing",
      });
    }

    const result = await calculateAverageTimeToHire(companyCode);

    res.json({
      success: true,
      averageTimeToHire: result.formatted,
    });

  } catch (err) {
    console.error("Error calculating average time to hire:", err);

    res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};

export default averageTimeToHire;
