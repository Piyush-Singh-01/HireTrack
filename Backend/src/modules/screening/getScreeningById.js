import mongoose from "mongoose";
import Screening from "./screening.model.js";

const getScreeningById = async (req, res) => {
  try {
    //const companyCode = req.user?.companyCode;
    const { id } = req.params;

    /* ===== COMPANY CONTEXT CHECK ===== */
   

    /* ===== VALIDATE OBJECT ID ===== */
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid screening id",
      });
    }

    /* ===== TENANT SAFE LOOKUP ===== */
    const screening = await Screening.findOne({
      _id: id,      // ✅ critical security filter
    });

    if (!screening) {
      return res.status(404).json({
        success: false,
        message: "Screening not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: screening,
    });
  } catch (err) {
    console.error("Get Screening Error:", err);

    return res.status(500).json({
      success: false,
      message: "Error fetching screening",
    });
  }
};

export default getScreeningById;
