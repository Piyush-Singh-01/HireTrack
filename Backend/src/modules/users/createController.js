import UserAndRole from "./userandroleSchema.js";
// import Profile from "../../model/profileModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "./user.model.js";
import { createTransporter } from "../../common/utils/cloudinary.js";

const createUserAndRole = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized request",
      });
    }

    const creatorRole = req.user.Role;

    const { Name, Position, Role, ContactNumber, Email, password } = req.body;

    // Validation
    if (!Name || !Position || !Role || !ContactNumber || !Email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const permissions = {
      SuperAdmin: ["Admin", "Interviewer"],
      Admin: ["Interviewer"],
    };

    if (!permissions[creatorRole]) {
      return res.status(403).json({ success: false, message: "You do not have permission to create users" });
    }

    if (!permissions[creatorRole].includes(Role)) {
      return res.status(403).json({ success: false, message: `${creatorRole} cannot create ${Role}` });
    }

    //  Check for existing email/contact in the same company
    const emailExists = await UserAndRole.findOne({ Email, companyCode: req.user.companyCode });
    if (emailExists) return res.status(400).json({ success: false, message: "Email already exists in this company" });

    const contactExists = await UserAndRole.findOne({ ContactNumber, companyCode: req.user.companyCode });
    if (contactExists) return res.status(400).json({ success: false, message: "Contact number already exists in this company" });

    //  Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userModel.findOne({
      companyCode: req.user.companyCode,
      role: "SuperAdmin"
    });

    const authEmail = user?.emailConfig?.authEmail || process.env.EMAIL_USER;
    const authPassword = user?.emailConfig?.authPassword || process.env.EMAIL_PASS;
    const provider = user?.emailConfig?.provider || "gmail";
    const smtpHost = user?.emailConfig?.smtpHost;
    const smtpPort = user?.emailConfig?.smtpPort;
    const smtpSecure = user?.emailConfig?.smtpSecure;

    if (!authEmail || !authPassword) {
      return res.status(500).json({
        success: false,
        message: "Email configuration is missing (both SuperAdmin profile and .env)"
      });
    }


    const newUser = await UserAndRole.create({
      Name,
      Position,
      Role,
      ContactNumber,
      Email,
      password: hashedPassword,
      profilePhoto:"",
      companyCode: req.user.companyCode,
      accountStatus: "Active",
      isVerified: false,
    });


    const token = jwt.sign(
      { id: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    const frontendUrl = (
      process.env.FRONTEND_URL || "http://localhost:5173"
    ).replace(/\/+$/, "");

    const verificationUrl =
      `${frontendUrl}/verify-email/${token}`;

      
      const transporter = createTransporter(
        provider,
        authEmail,
        authPassword,
        smtpHost,
        smtpPort,
        smtpSecure
      );
  

  // change email get from superadmin profile 
      await transporter.sendMail({
        from: authEmail,  
        to: Email,
        subject: "Verify your account",
        html: ` <div style="font-family: Arial, sans-serif; text-align: center; padding: 30px; background-color: #f7f7f7;">
        <div style="max-width: 500px; margin: auto; background-color: #ffffff; padding: 40px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h2 style="color: #333333;">Welcome to Our Platform!</h2>
          <p style="color: #555555; font-size: 16px;">
            Please verify your email address to complete your registration.
          </p>
          <a href="${verificationUrl}" 
             style="display: inline-block; margin-top: 20px; padding: 12px 25px; font-size: 16px; color: #ffffff; background-color: #007BFF; text-decoration: none; border-radius: 5px;">
            Verify Email
          </a>
          <p style="color: #999999; font-size: 12px; margin-top: 30px;">
            If you did not sign up for this account, you can ignore this email.
          </p>
        </div>
      </div>`,
      });
  

    // Return safe response
    res.status(201).json({
      success: true,
      message: "User and Profile created successfully",
      data: {
        id: newUser._id,
        Name: newUser.Name,
        Role: newUser.Role,
        Email: newUser.Email,
        Position: newUser.Position,
        companyCode: newUser.companyCode,
        accountStatus: newUser.accountStatus,
      },
    });

  } catch (error) {
    console.error("Create User Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export default createUserAndRole;
