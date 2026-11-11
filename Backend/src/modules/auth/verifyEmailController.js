import jwt from "jsonwebtoken";
import User from "../users/user.model.js";
import UserAndRole from "../users/userandroleSchema.js";

const verifyEmail = async (req, res) => {
  try {
    const token = req.params.token || req.query.token;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token missing",
      });
    }

    // ✅ Decode token (only contains user ID)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { id } = decoded; // remove companyCode

    /* ================= Check in Users ================= */
    const user = await User.findById(id);

    if (user) {
      if (user.isVerified) {
        return res.json({
          success: true,
          message: "Already verified",
        });
      }

      user.isVerified = true;
      user.verifiedAt = new Date();
      await user.save();

      return res.json({
        success: true,
        message: "User verified successfully",
      });
    }

    /* ================= Check in Employees ================= */
    const employee = await UserAndRole.findById(id);

    if (employee) {
      if (employee.isVerified) {
        return res.json({
          success: true,
          message: "Already verified",
        });
      }

      employee.isVerified = true;
      employee.accountStatus = "Active";
      employee.verifiedAt = new Date();
      await employee.save();

      return res.json({
        success: true,
        message: "Employee verified successfully",
      });
    }

    /* ================= NOT FOUND ================= */
    return res.status(404).json({
      success: false,
      message: "User not found",
    });

  } catch (error) {
    console.error("Verify error:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(400).json({
        success: false,
        message: "Link expired",
      });
    }

    return res.status(400).json({
      success: false,
      message: "Invalid token",
    });
  }
};

export default verifyEmail;
