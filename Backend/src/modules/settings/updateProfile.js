import UserandRole from "../users/userandroleSchema.js";
import User from "../users/user.model.js";
import bcrypt from "bcryptjs";
import { getCloudinary } from "../../common/utils/cloudinary.js";

const updateProfile = async (req, res) => {
  try {
    // -------------------------------
    // Auth Check
    // -------------------------------
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const userId = req.user.id;
    const companyCode = req.user.companyCode;
    const role = req.user.role || req.user.Role;

    const {
      password,
      name,
      contactNumber,
      position,
      cloudName,
      apiKey,
      apiSecret,
      authEmail,
      authPassword,
      provider,
      smtpHost,
      smtpPort,
      smtpSecure,
      businessEmail,
      organizationName,
    } = req.body;

    // -------------------------------
    // Get User
    // -------------------------------
    let userData;

    if (role === "SuperAdmin") {
      userData = await User.findOne({ _id: userId, companyCode });
    } else {
      userData = await UserandRole.findOne({ _id: userId, companyCode });
    }

    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // -------------------------------
    // Password Validation (optional)
    // -------------------------------
    if (password) {
      const isMatch = await bcrypt.compare(
        password,
        userData.password || userData.Password
      );

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid password",
        });
      }
    }

    // -------------------------------
    // Duplicate Email Check (FIXED)
    // -------------------------------
    if (businessEmail) {
      const existingUser = await User.findOne({
        businessEmail,
        companyCode,
        _id: { $ne: userId }, // ✅ exclude current user
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User already exists in this company",
        });
      }
    }

    // -------------------------------
    // Get Company Cloud Config
    // -------------------------------
    const companyCloudUser = await User.findOne({
      companyCode,
      role: "SuperAdmin",
    });

    if (!companyCloudUser) {
      return res.status(400).json({
        success: false,
        message: "SuperAdmin not found",
      });
    }

    let companyCloud = companyCloudUser?.cloudinary;

    // ===============================
    // SUPER ADMIN UPDATE
    // ===============================
    if (role === "SuperAdmin") {
      // Cloudinary update (only update if all three are provided and non-empty)
      if (cloudName?.trim() && apiKey?.trim() && apiSecret?.trim()) {
        companyCloudUser.cloudinary = {
          cloudName: cloudName.trim(),
          apiKey: apiKey.trim(),
          apiSecret: apiSecret.trim(),
        };
        await companyCloudUser.save();
        companyCloud = companyCloudUser.cloudinary;
      }

      // Email config update
      const emailConfigUpdate = {};
      if (provider) emailConfigUpdate.provider = provider;
      if (authEmail) emailConfigUpdate.authEmail = authEmail;
      if (authPassword) emailConfigUpdate.authPassword = authPassword;
      if (smtpHost) emailConfigUpdate.smtpHost = smtpHost;
      if (smtpPort) emailConfigUpdate.smtpPort = smtpPort;
      if (smtpSecure !== undefined)
        emailConfigUpdate.smtpSecure = smtpSecure;

      // Profile Photo & Company Logo Uploads
      let profilePhoto;
      let companyLogo;

      if (req.files) {
        const effectiveCloudName =
          companyCloud?.cloudName?.trim() || process.env.CLOUDINARY_CLOUD_NAME;
        const effectiveApiKey =
          companyCloud?.apiKey?.trim() || process.env.CLOUDINARY_API_KEY;
        const effectiveApiSecret =
          companyCloud?.apiSecret?.trim() || process.env.CLOUDINARY_API_SECRET;

        if (!effectiveCloudName || !effectiveApiKey || !effectiveApiSecret) {
          return res.status(400).json({
            success: false,
            message: "Cloudinary not configured. Please supply Cloudinary credentials.",
          });
        }

        const cloudinaryInstance = getCloudinary(companyCloud);

        // Upload Profile Photo if present
        if (req.files.profilePhoto && req.files.profilePhoto[0]) {
          const result = await new Promise((resolve, reject) => {
            cloudinaryInstance.uploader
              .upload_stream({ folder: "profiles" }, (err, result) => {
                if (err) reject(err);
                else resolve(result);
              })
              .end(req.files.profilePhoto[0].buffer);
          });
          profilePhoto = result.secure_url;
        }

        // Upload Company Logo if present
        if (req.files.companyLogo && req.files.companyLogo[0]) {
          const result = await new Promise((resolve, reject) => {
            cloudinaryInstance.uploader
              .upload_stream({ folder: "company_logos" }, (err, result) => {
                if (err) reject(err);
                else resolve(result);
              })
              .end(req.files.companyLogo[0].buffer);
          });
          companyLogo = result.secure_url;
        }
      }

      // -------------------------------
      // Build Update Data
      // -------------------------------
      const updateData = {};

      if (name) updateData.userName = name;
      if (contactNumber) updateData.contactNumber = contactNumber;
      if (businessEmail) updateData.businessEmail = businessEmail;
      if (organizationName !== undefined) updateData.organizationName = organizationName;
      if (profilePhoto) updateData.profilePhoto = profilePhoto;
      if (companyLogo) updateData.companyLogo = companyLogo;

      if (Object.keys(emailConfigUpdate).length > 0) {
        updateData.emailConfig = {
          ...companyCloudUser.emailConfig,
          ...emailConfigUpdate,
        };
      }

      const updatedUser = await User.findOneAndUpdate(
        { _id: userId, companyCode },
        { $set: updateData },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        message: "SuperAdmin updated successfully",
        data: updatedUser,
      });
    }

    // ===============================
    // NORMAL USER UPDATE
    // ===============================
    else {
      let profilePhoto;

      if (req.files && req.files.profilePhoto && req.files.profilePhoto[0]) {
        const effectiveCloudName =
          companyCloud?.cloudName?.trim() || process.env.CLOUDINARY_CLOUD_NAME;
        const effectiveApiKey =
          companyCloud?.apiKey?.trim() || process.env.CLOUDINARY_API_KEY;
        const effectiveApiSecret =
          companyCloud?.apiSecret?.trim() || process.env.CLOUDINARY_API_SECRET;

        if (!effectiveCloudName || !effectiveApiKey || !effectiveApiSecret) {
          return res.status(400).json({
            success: false,
            message: "Cloudinary not configured",
          });
        }

        const cloudinaryInstance = getCloudinary(companyCloud);

        const result = await new Promise((resolve, reject) => {
          cloudinaryInstance.uploader
            .upload_stream({ folder: "profiles" }, (err, result) => {
              if (err) reject(err);
              else resolve(result);
            })
            .end(req.files.profilePhoto[0].buffer);
        });

        profilePhoto = result.secure_url;
      }

      const updateData = {};
      if (name) updateData.Name = name;
      if (contactNumber) updateData.ContactNumber = contactNumber;
      if (position) updateData.Position = position;
      if (profilePhoto) updateData.profilePhoto = profilePhoto;

      const updatedUserRole = await UserandRole.findOneAndUpdate(
        { _id: userId, companyCode },
        { $set: updateData },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: updatedUserRole,
      });
    }
  } catch (error) {
    console.error("Update Profile Error:", error);

    // Handle duplicate key (extra safety)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate field value detected",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default updateProfile;
