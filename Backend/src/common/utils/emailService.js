import userModel from "../../modules/users/user.model.js";
import nodemailer from "nodemailer";

const buildTransporterOptions = ({ authUser, authPass, config, useStartTls = false }) => {
  const isGmail =
    config?.provider?.toLowerCase().trim() === "gmail" ||
    authUser.toLowerCase().includes("@gmail.com");

  const timeoutOptions = {
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 12000,
  };

  if (isGmail) {
    return {
      isGmail: true,
      options: {
        host: "smtp.gmail.com",
        port: useStartTls ? 587 : 465,
        secure: !useStartTls,
        ...(useStartTls ? { requireTLS: true } : {}),
        family: 4,
        auth: {
          user: authUser,
          pass: authPass,
        },
        ...timeoutOptions,
      },
    };
  }

  const host = config?.smtpHost || "smtp.hostinger.com";
  const port = Number(config?.smtpPort) || 465;
  const secure =
    port === 465
      ? true
      : port === 587
      ? false
      : config?.smtpSecure !== undefined
      ? Boolean(config.smtpSecure)
      : port === 465;

  return {
    isGmail: false,
    options: {
      host,
      port,
      secure,
      family: 4,
      auth: {
        user: authUser,
        pass: authPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
      ...timeoutOptions,
    },
  };
};

export const sendEmail = async ({
  companyCode,
  from,
  to,
  bcc,
  subject,
  html,
  attachments,
}) => {
  try {
    if (!to) throw new Error("Recipient email missing");

    const admin = await userModel
      .findOne({
        companyCode,
        role: "SuperAdmin",
      })
      .lean();

    if (!admin) throw new Error("SuperAdmin not found");

    const config = admin.emailConfig;

    const authUser = config?.authEmail || process.env.EMAIL_USER;
    const authPass = config?.authPassword || process.env.EMAIL_PASS;

    if (!authUser || !authPass) {
      throw new Error(
        "SMTP config missing (neither company emailConfig nor .env credentials provided)"
      );
    }

    const senderName = admin.organizationName || "HireTrack";
    const mailOptions = {
      from: `"${senderName}" <${authUser}>`,
      ...(from && from !== authUser ? { replyTo: from } : {}),
      to,
      bcc: bcc || authUser,
      subject,
      html,
      attachments: attachments || [],
    };

    const primary = buildTransporterOptions({
      authUser,
      authPass,
      config,
      useStartTls: false,
    });

    try {
      const transporter = nodemailer.createTransport(primary.options);
      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ Email sent → ${to}`);
      return info;
    } catch (primaryErr) {
      // Fallback for Gmail: try STARTTLS on port 587 if port 465 was blocked/timed out
      if (primary.isGmail) {
        console.warn(
          `⚠️ Gmail port 465 failed (${primaryErr.message}), retrying port 587 STARTTLS...`
        );
        const fallback = buildTransporterOptions({
          authUser,
          authPass,
          config,
          useStartTls: true,
        });
        const fallbackTransporter = nodemailer.createTransport(fallback.options);
        const info = await fallbackTransporter.sendMail(mailOptions);
        console.log(`✅ Email sent via 587 → ${to}`);
        return info;
      }
      throw primaryErr;
    }
  } catch (error) {
    console.error("❌ Email Error:", error.message);
    throw error;
  }
};
