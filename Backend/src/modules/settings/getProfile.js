import UserandRole from "../users/userandroleSchema.js";
import User from "../users/user.model.js";

const getProfile = async (req, res) => {
  try {
    const companyCode = req.user?.companyCode;
    const role = req.user?.role || req.user?.Role;

    const email =
      req.user?.email ||
      req.user?.businessEmail ||
      req.user?.Email;

    if (!companyCode || !email) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    let data;

    /* =========================
       SUPER ADMIN PROFILE
    ========================= */

    if (role === "SuperAdmin") {
      const user = await User.findOne({
        businessEmail: email,
        companyCode,
      }).select("-password");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      data = {
        userName: user.userName,
        businessEmail: user.businessEmail,
        organizationName: user.organizationName,
        role: user.role,
        contactNumber: user.contactNumber,
        department: user.department,
        companyCode: user.companyCode,
        profilePhoto: user.profilePhoto,
        // subscription: user.subscription,
        // googleCalendar: user.googleCalendar,
        emailConfig: user.emailConfig,
        cloudinary:user.cloudinary,
        googleCalendar:user.googleCalendar,
        isconnected:user.googleCalendar.isConnected,
        companyLogo: user.companyLogo,
      };
    }

    /* =========================
       USERANDROLE PROFILE
    ========================= */

    else {
      const userRole = await UserandRole.findOne({
        Email: email,
        companyCode,
      }).select("-Password");

      if (!userRole) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const adminUser = await User.findOne({
        companyCode,
        role: "SuperAdmin",
      }).select("companyLogo");

      data = {
        name: userRole.Name,
        email: userRole.Email,
        role: userRole.Role,
        position: userRole.Position,
        contactNumber: userRole.ContactNumber,
        profilePhoto: userRole.profilePhoto,
        companyCode: userRole.companyCode,
        accountStatus: userRole.accountStatus,
        companyLogo: adminUser?.companyLogo,
        // permissions: userRole.permissions,
      };
    }

    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default getProfile;
