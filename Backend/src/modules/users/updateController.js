import UserAndRole from "./userandroleSchema.js";
import bcrypt from "bcryptjs";

const updateUserAndRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { Name, Position, ContactNumber, Email, Role, password } = req.body;

    // ✅ Auth check
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized request",
      });
    }

    const loggedInRole = req.user.Role;
    const companyCode = req.user.companyCode;

    // ✅ Find user
    const user = await UserAndRole.findOne({ _id: id, companyCode });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ✅ Normalize email
    const normalizedEmail = Email?.trim().toLowerCase();
    const currentEmail = user.Email?.trim().toLowerCase();

    // ✅ Role permission check
    if (Role && Role !== user.Role) {
      const rolePermissions = {
        SuperAdmin: ["Admin", "HR", "Interviewer"],
        Admin: ["HR", "Interviewer"],
      };

      if (!rolePermissions[loggedInRole]) {
        return res.status(403).json({
          success: false,
          message: "You cannot update roles",
        });
      }

      if (!rolePermissions[loggedInRole].includes(Role)) {
        return res.status(403).json({
          success: false,
          message: `${loggedInRole} cannot assign role ${Role}`,
        });
      }
    }

    // ✅ Email uniqueness
    if (normalizedEmail && normalizedEmail !== currentEmail) {
      const emailExists = await UserAndRole.findOne({
        Email: normalizedEmail,
        companyCode,
        _id: { $ne: user._id },
      });

      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "Email already exists in this company",
        });
      }
    }

    // ✅ Contact uniqueness
    if (ContactNumber && ContactNumber !== user.ContactNumber) {
      const contactExists = await UserAndRole.findOne({
        ContactNumber,
        companyCode,
        _id: { $ne: user._id },
      });

      if (contactExists) {
        return res.status(400).json({
          success: false,
          message: "Contact number already exists in this company",
        });
      }
    }

    // ✅ Update fields
    if (Name) user.Name = Name;
    if (Position) user.Position = Position;
    if (ContactNumber) user.ContactNumber = ContactNumber;
    if (normalizedEmail) user.Email = normalizedEmail;
    if (Role) user.Role = Role;
    if (password && password.trim() !== "") {
      user.password = await bcrypt.hash(password, 10);
    }

    // ✅ Save with duplicate safeguard
    try {
      await user.save();
    } catch (err) {
      if (err.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "Duplicate field value detected",
          error: err.keyValue,
        });
      }
      throw err;
    }

    // ✅ Response
    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: {
        user: {
          id: user._id,
          Name: user.Name,
          Position: user.Position,
          Email: user.Email,
          Role: user.Role,
          ContactNumber: user.ContactNumber,
          companyCode: user.companyCode,
        },
      },
    });

  } catch (error) {
    console.error("Update User Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export default updateUserAndRole;
