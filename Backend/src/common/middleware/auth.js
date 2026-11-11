import jwt from "jsonwebtoken";
import User from "../../modules/users/user.model.js";
import UserAndRole from "../../modules/users/userandroleSchema.js";

const protect = async (req, res, next) => {
  try {
    /* ================= TOKEN ================= */

    const token =
      req.cookies?.token ||
      (req.headers.authorization && req.headers.authorization.split(" ")[1]) ||
      req.cookies?.token ||
      req.query.token;

    if (!token || token === "undefined") {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token missing",
      });
    }

    /* ================= VERIFY ================= */

    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET
    );

    if (!decoded?.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
    }

    /* ================= SUPER ADMIN ================= */

    const superAdmin = await User.findById(decoded.id);

    if (superAdmin && superAdmin.role === "SuperAdmin") {
      req.user = {
        id: superAdmin._id,
        name: superAdmin.userName,
        email: superAdmin.businessEmail.toLowerCase(),
        Role: "SuperAdmin",
        companyCode: superAdmin.companyCode,

        // 🔥 ADD THIS (IMPORTANT)
        googleCalendar: superAdmin.googleCalendar || null,
      };

      
      return next();
    }

    /* ================= EMPLOYEE ================= */

    const employee = await UserAndRole.findById(decoded.id);

    if (!employee) {
      return res.status(403).json({
        success: false,
        message: "Access revoked. Contact admin.",
      });
    }

    if (employee.accountStatus !== "Active") {
      return res.status(403).json({
        success: false,
        message: `Account ${employee.accountStatus}`,
      });
    }

    const normalizedEmployeeRole = employee.Role
      ? employee.Role.toString().trim()
      : "Interviewer";

    req.user = {
      id: employee._id,
      name: employee.Name,
      email: employee.Email.toLowerCase(),
      Role: normalizedEmployeeRole,
      companyCode: employee.companyCode,
      createdBy: employee.createdBy || null,

      // 🔥 OPTIONAL (if employees also have calendar)
      googleCalendar: employee.googleCalendar || null,
    };

    console.log("👤 Employee User:", req.user);

    next();
  } catch (error) {
    console.error("Protect middleware error:", error);

    return res.status(401).json({
      success: false,
      message: "Token invalid or expired",
    });
  }
};

export default protect;

