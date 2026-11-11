import UserAndRole from "./userandroleSchema.js";

const deleteUserAndRole = async (req, res) => {
  try {
    const { id } = req.params;
    const companyCode = req.user.companyCode;
    const loggedInRole = req.user.Role;

    // 1️⃣ Fetch the user in the same company
    const userToDelete = await UserAndRole.findOne({ _id: id, companyCode });
    if (!userToDelete) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const targetRole = userToDelete.Role;

    // 2️⃣ Permission rules
    if (
      (loggedInRole === "Admin" && targetRole === "SuperAdmin") ||
      (loggedInRole === "SuperAdmin" && targetRole === "SuperAdmin")
    ) {
      return res.status(403).json({
        success: false,
        message: `${loggedInRole} cannot delete ${targetRole}`,
      });
    }

    // 3️⃣ Delete user
    await UserAndRole.findOneAndDelete({ _id: id, companyCode });

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });

  } catch (error) {
    console.error("Delete User Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message,
    });
  }
};

export default deleteUserAndRole;
