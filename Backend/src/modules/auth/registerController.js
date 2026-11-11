import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import User from "../users/user.model.js";
// import Profile from "../settings/settings.model.js";

const generateCompanyCode = () =>
  Math.random().toString(36).substring(2, 8).toUpperCase();

const registerController = async (req, res) => {
  try {
    const {
      userName,
      businessEmail,
      organizationName,
      contactNumber,
      createNewPassword,
      confirmNewPassword,
    } = req.body;

    const role = "SuperAdmin"; // ✅ fixed role

    /* ================= VALIDATION ================= */

    if (
      !userName ||
      !businessEmail ||
      !organizationName ||
      !contactNumber ||
      !createNewPassword ||
      !confirmNewPassword
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields required",
      });
    }

    if (createNewPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(businessEmail)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    /* ================= CHECK COMPANY ================= */

    // const companyExists = await User.findOne({
    //   organizationName,
    //   role: "SuperAdmin",
    // });

    // if (companyExists) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Company already registered",
    //   });
    // }

    const emailExists = await User.findOne({
      businessEmail,
      role: "SuperAdmin",
    });

    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: "SuperAdmin already exists with this email",
      });
    }


    const companyCode = generateCompanyCode();

    const hashedPassword = await bcrypt.hash(createNewPassword, 10);

    const user = await User.create({
      userName,
      businessEmail,
      organizationName,
      role,
      contactNumber,
      profilePhoto:"",
      companyCode,
      password: hashedPassword,
      isVerified: false,
    });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    const frontendUrl = (
      process.env.FRONTEND_URL || "http://localhost:5173"
    ).replace(/\/+$/, "");

    const verificationUrl =
      `${frontendUrl}/verify-email/${token}`;

    const isGmail = process.env.EMAIL_USER?.toLowerCase().includes("@gmail.com");
    const transporter = isGmail
      ? nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        })
      : nodemailer.createTransport({
          host: "smtp.hostinger.com",
          port: 465,
          secure: true,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: businessEmail,
        subject: "Verify Your Email",
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

      return res.status(201).json({
      success: true,
      message: "SuperAdmin registered. Please verify your email.",
      user: {
        id: user._id,
        userName: user.userName,
        businessEmail: user.businessEmail,
        companyCode: user.companyCode,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export default registerController;
