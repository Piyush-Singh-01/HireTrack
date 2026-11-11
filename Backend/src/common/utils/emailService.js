import userModel from "../../modules/users/user.model.js";
import nodemailer from "nodemailer"
export const sendEmail = async ({
  companyCode,
  to,
  bcc,
  subject,
  html,
  attachments,
}) => {
  try {
    if (!to) throw new Error("Recipient email missing");

    const admin = await userModel.findOne({
      companyCode,
      role: "SuperAdmin",
    }).lean();

    if (!admin) throw new Error("SuperAdmin not found");

    const config = admin.emailConfig;

    const authUser = config?.authEmail || process.env.EMAIL_USER;
    const authPass = config?.authPassword || process.env.EMAIL_PASS;

    if (!authUser || !authPass) {
      throw new Error("SMTP config missing (neither company emailConfig nor .env credentials provided)");
    }

    const isGmail =
      config?.provider?.toLowerCase().trim() === "gmail" ||
      authUser.toLowerCase().includes("@gmail.com");

    let transporter;

    if (isGmail) {
      transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: authUser,
          pass: authPass,
        },
      });
    } else {
      const host = config?.smtpHost || "smtp.hostinger.com";
      const port = Number(config?.smtpPort) || 465;
      const secure =
        port === 465
          ? true
          : port === 587
          ? false
          : config?.smtpSecure !== undefined
          ? Boolean(config.smtpSecure)
          : (port === 465);

      transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user: authUser,
          pass: authPass,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });
    }

    await transporter.verify();

    const senderName = admin.organizationName || "HireTrack";
    const info = await transporter.sendMail({
      from: `"${senderName}" <${authUser}>`,
      to,
      bcc: bcc || authUser,
      subject,
      html,
      attachments: attachments || [],
    });

    console.log(`✅ Email sent → ${to}`);
    return info;

  } catch (error) {
    console.error("❌ Email Error:", error.message);
    throw error;
  }
};
