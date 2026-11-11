import User from "./user.model.js";
import UserAndRole from "./userandroleSchema.js";

const getHiringManagers = async (req, res) => {
  try {
    const companyCode = req.user?.companyCode;

    if (!companyCode) {
      return res.status(400).json({
        success: false,
        message: "Company code context missing",
      });
    }

    // 1. Fetch company SuperAdmin(s)
    const superAdmins = await User.find({
      companyCode,
      role: "SuperAdmin",
    }).select("userName businessEmail role").lean();

    // 2. Fetch active team members from UserAndRole
    const teamMembers = await UserAndRole.find({
      companyCode,
      accountStatus: "Active",
    }).select("Name Email Role").lean();

    // 3. Map all to a standardized structure
    const managers = [
      ...superAdmins.map((admin) => ({
        _id: admin._id,
        name: admin.userName,
        email: admin.businessEmail,
        role: admin.role,
        onModel: "User",
      })),
      ...teamMembers.map((member) => ({
        _id: member._id,
        name: member.Name,
        email: member.Email,
        role: member.Role,
        onModel: "UserAndRole",
      })),
    ];

    return res.status(200).json({
      success: true,
      data: managers,
    });
  } catch (error) {
    console.error("Error in getHiringManagers:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching hiring managers",
      error: error.message,
    });
  }
};

export default getHiringManagers;
