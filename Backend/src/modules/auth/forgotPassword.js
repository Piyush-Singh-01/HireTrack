import userModel from "../users/user.model.js";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import validator from "validator";

const forgotPassword = async (req, res) => {
  try {
    const { businessEmail } = req.body;

    if (!businessEmail || !validator.isEmail(businessEmail)) {
      return res.status(400).json({ message: "Please provide a valid businessEmail" });
    }

    const user = await userModel.findOne({ businessEmail,  role: "SuperAdmin", });
    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = jwt.sign(
      {
        id: user._id,
        companyCode: user.companyCode, 
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    if (!process.env.FRONTEND_URL) {
      return res.status(500).json({ message: "FRONTEND_URL not configured" });
    }

    const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, "");

    const resetUrl =`${frontendUrl}/reset-password/${resetToken}`;


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
  
    const candidateName = user.userName || "User";
    const resetLink = resetUrl;
    const logoUrl = user.companyLogo || "https://res.cloudinary.com/dpdsjujvp/image/upload/v1793713754/hiretrack_branding/hiretrack_logo.png";
  
    try {
      await transporter.sendMail({
        from: `"Support" <${process.env.EMAIL_USER}>`,
        to: user.businessEmail,
        subject: "Reset your password",
        text: `Hello ${user.userName || ""},\n\nReset your password using the link below. This link expires in 1 hour:\n${resetUrl}`,
        html: `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
            body {
                margin: 0;
                padding: 0;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                background-color: #f4f6fa;
                color: #333333;
                -webkit-font-smoothing: antialiased;
            }
            .top-header { background-color: #263765; padding: 5px 0; }
            .header-content { max-width: 650px; margin: 0 auto; color: #ffffff; padding: 5px 0; text-align: left; }
 .main-wrapper { padding: 0 20px 20px 20px; position: relative; z-index: 1; }
            .email-container { max-width: 650px; margin: 0 auto; background-color: #ffffff; border-top: 1px solid #ffffff; border-radius: 4px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05); overflow: hidden; }
            .email-title { background-color: #2F3031; color: #ffffff; padding: 20px 30px; font-size: 20px; font-weight: 600; }
            .email-body { padding: 25px 30px 10px 30px; }
            .meta-info { text-align: right; color: #888888; font-size: 13px; margin-bottom: 25px; }
            .meta-info span.dots { letter-spacing: 2px; margin-left: 5px; font-size: 16px; }
            p { line-height: 1.6; margin-bottom: 20px; font-size: 15px; }
            .highlight { font-weight: 700; }
            .info-box { background-color: #edf2fc; padding: 20px 25px; border-radius: 8px; margin: 30px 0; }
            .info-box ul { list-style-type: disc; margin: 0; padding-left: 20px; }
            .info-box li { margin-bottom: 8px; font-size: 15px; }
            .btn-support { background-color: #1a73e8; color: #ffffff; border: none; border-radius: 4px; padding: 10px 20px; font-size: 14px; font-weight: 600; cursor: pointer; display: inline-block; margin-bottom: 25px; text-decoration: none; }
            .sign-off { margin-top: 40px; margin-bottom: 30px; }
            .sign-off p { margin: 0; }
            
            /* Email Safe Banner */
            .banner { background: linear-gradient(90deg, #f8727b 0%, #a45a7b 40%, #2b3a67 100%); padding: 20px 30px; display: table; width: 100%; box-sizing: border-box; }
            .banner-text { display: table-cell; vertical-align: middle; color: #ffffff; }
            .banner-image { display: table-cell; vertical-align: middle; text-align: right; width: 100px; }
            .banner-text h4 { margin: 0 0 5px 0; font-size: 12px; font-weight: 400; letter-spacing: 1px; text-transform: uppercase; color: #ffffff;}
            .banner-text h2 { margin: 0 0 5px 0; font-size: 20px; font-weight: 800; color: #ffffff;}
            .banner-text p { margin: 0; font-size: 12px; color: #e0e0e0; }
            
            .disclaimer { text-align: center; padding: 30px; font-size: 10px; color: #666666; line-height: 1.8; background-color: #ffffff; }
            
            /* Email Safe Footer */
            .bottom-footer { background-color: #263765; padding: 40px 20px 40px 20px; }
            .footer-content { max-width: 650px; margin: 0 auto; display: table; width: 100%; color: #ffffff; font-size: 13px; }
            .social-icons { display: table-cell; vertical-align: middle; text-align: left; }
            .copyright { display: table-cell; vertical-align: middle; text-align: right; white-space: nowrap; }
            .social-link { display: inline-block; text-decoration: none; margin-right: 5px; }
            
            @media (max-width: 600px) {
                .banner, .footer-content { display: block; width: 100%; text-align: center; }
                .banner-text, .banner-image, .social-icons, .copyright { display: block; width: 100%; text-align: center; margin-bottom: 10px; }
            }
        </style>
    </head>
    <body>
    <div style="background-color: #f4f6fa; margin: 0; padding: 0; width: 100%; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <div class="top-header">
            <div class="header-content">
                <img src="${logoUrl}" alt="Company Logo" style="display:block; border:0; height: 120px; width: auto; max-width: 300px; object-fit: contain;" />
            </div>
        </div>

        <div class="main-wrapper">
            <div class="email-container">
                <div class="email-title">Reset Your Password - HireTrack</div>
                <div class="email-body">
                    <p>Dear ${candidateName},</p>

                    <p>We received a request to reset your password for your <span class="highlight">HireTrack</span> account.</p>

                    <p>To create a new password and regain access to your account, please click the button below:</p>
    
                    <a href="${resetLink}" target="_blank" class="btn-support" style="color: white; text-decoration: none;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="16" viewBox="0 0 448 512" fill="currentColor" style="vertical-align: middle; margin-right: 8px; margin-top: -2px;">
                            <path d="M400 224h-24v-72C376 68.2 307.8 0 224 0S72 68.2 72 152v72H48c-26.5 0-48 21.5-48 48v192c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V272c0-26.5-21.5-48-48-48zm-104 0H152v-72c0-39.7 32.3-72 72-72s72 32.3 72 72v72z"/>
                        </svg>
                        Reset Password
                    </a>
                   
                    <p>This link will expire in 15 minutes for security reasons.</p>

                    <p class="highlight">Password Reset Instructions :</p>
                    <ul style="list-style-type: disc; padding-left: 20px; margin-bottom: 25px;">
                        <li style="margin-bottom: 8px; font-size: 15px;">Click the reset password button above.</li>
                        <li style="margin-bottom: 8px; font-size: 15px;">The password reset link will expire in 15 minutes for security reasons.</li>
                        <li style="margin-bottom: 8px; font-size: 15px;">Ensure a stable internet connection.</li>
                        <li style="margin-bottom: 8px; font-size: 15px;">Create a strong password with a mix of letters, numbers, and special characters.</li>
                        <li style="margin-bottom: 8px; font-size: 15px;">If you did not request a password reset, you can safely ignore this email.</li>
                    </ul>
    
                    <p>If you face any issues, please contact our support team at <a href="mailto:${process.env.EMAIL_USER}" style="color: #1a73e8; text-decoration: underline;">${process.env.EMAIL_USER}</a>.</p>
    
                    <div class="sign-off">
                        <p>Best Regards,</p>
                        <p class="highlight">HireTrack Team</p>
                    </div>
                </div>
    
                <div class="banner">
                    <div class="banner-text">
                        <h4>HIRETRACK</h4>
                        <h2>STREAMLINED TALENT INTELLIGENCE</h2>
                        <p>Fast, smart, and reliable recruitment management</p>
                    </div>
                </div>
                
               
            </div>
        </div>
    
        <div class="bottom-footer">
            <div class="footer-content">
                <div class="copyright" style="text-align: center; width: 100%;">
                    <span style="vertical-align: middle; color: #B5E6FF; font-size: 14px; font-weight: 500;">Powered by</span>
                    <span style="vertical-align: middle; color: #ffffff; font-size: 16px; font-weight: 700; margin-left: 8px;">HireTrack</span>
                </div>
            </div>
        </div>
        </div>
    </body>
    </html>`,
      });
    } catch (emailErr) {
      console.error("Failed to send reset email:", emailErr);
      return res.status(500).json({ message: "Failed to send reset email" });
    }

    return res.status(200).json({ message: "Reset password email sent" });
  } catch (err) {
    console.error("forgotPassword error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export default forgotPassword;
