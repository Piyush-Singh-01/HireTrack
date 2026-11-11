// src/common/utils/mailTemaplate.js
// Ultra-Modern, Executive & Stylish Email Design System for HireTrack

export const DEFAULT_BRAND_LOGO =
  "https://res.cloudinary.com/dpdsjujvp/image/upload/v1793713754/hiretrack_branding/hiretrack_logo.png";

const getCurrentYear = () => new Date().getFullYear();

const formatToAMPM = (time) => {
  if (!time) return "";
  const [hours, minutes] = time.split(":");
  if (!hours || !minutes) return time;
  const date = new Date();
  date.setHours(parseInt(hours), parseInt(minutes));
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const parseDateParts = (dateStr) => {
  if (!dateStr) return { month: "DATE", day: "--", weekday: "TBD" };
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    const parts = String(dateStr).trim().split(/[\s,\-]+/);
    return {
      month: (parts[0] || "DATE").substring(0, 3).toUpperCase(),
      day: parts[1] || "--",
      weekday: "CONFIRMED",
    };
  }
  const month = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const day = d.getDate();
  const weekday = d.toLocaleString("en-US", { weekday: "short" }).toUpperCase();
  return { month, day, weekday };
};

/**
 * Master Responsive Email Container with Executive Design System
 */
const renderMasterTemplate = ({
  theme = "blue", // "blue", "emerald", "amber", "slate"
  badgeText,
  headline,
  subtitle,
  candidateName,
  introParagraphs = [],
  logoUrl,
  orgName = "HireTrack",
  businessEmail = "support@hiretrack.com",
  ticketData = null, // { dateStr, timeStr, role, interviewer, mode, duration }
  detailsList = [], // [{ label, value }]
  ctaButton = null, // { text, url, isMeet }
  guidelines = [], // [{ icon, title, desc }]
  closingNote = null,
}) => {
  const currentYear = getCurrentYear();
  const safeLogo = logoUrl || DEFAULT_BRAND_LOGO;
  const safeOrg = orgName || "HireTrack";
  const safeEmail = businessEmail || "support@hiretrack.com";

  const themes = {
    blue: {
      gradientBar: "linear-gradient(90deg, #38bdf8 0%, #6366f1 50%, #8b5cf6 100%)",
      badgeColor: "#38bdf8",
      badgeBg: "rgba(56, 189, 248, 0.12)",
      badgeBorder: "rgba(56, 189, 248, 0.3)",
      ticketHeaderBg: "#2563eb",
      buttonBg: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
      buttonShadow: "rgba(37, 99, 235, 0.4)",
      accentText: "#2563eb",
    },
    emerald: {
      gradientBar: "linear-gradient(90deg, #34d399 0%, #059669 50%, #0d9488 100%)",
      badgeColor: "#34d399",
      badgeBg: "rgba(52, 211, 153, 0.12)",
      badgeBorder: "rgba(52, 211, 153, 0.3)",
      ticketHeaderBg: "#059669",
      buttonBg: "linear-gradient(135deg, #059669 0%, #0d9488 100%)",
      buttonShadow: "rgba(5, 150, 105, 0.4)",
      accentText: "#059669",
    },
    amber: {
      gradientBar: "linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #ef4444 100%)",
      badgeColor: "#fbbf24",
      badgeBg: "rgba(251, 191, 36, 0.12)",
      badgeBorder: "rgba(251, 191, 36, 0.3)",
      ticketHeaderBg: "#d97706",
      buttonBg: "linear-gradient(135deg, #d97706 0%, #dc2626 100%)",
      buttonShadow: "rgba(217, 119, 6, 0.4)",
      accentText: "#d97706",
    },
    slate: {
      gradientBar: "linear-gradient(90deg, #94a3b8 0%, #64748b 50%, #475569 100%)",
      badgeColor: "#cbd5e1",
      badgeBg: "rgba(203, 213, 225, 0.12)",
      badgeBorder: "rgba(203, 213, 225, 0.3)",
      ticketHeaderBg: "#475569",
      buttonBg: "linear-gradient(135deg, #475569 0%, #334155 100%)",
      buttonShadow: "rgba(71, 85, 105, 0.4)",
      accentText: "#475569",
    },
  };

  const t = themes[theme] || themes.blue;

  // Render Ticket Card if present
  let ticketHtml = "";
  if (ticketData) {
    const { month, day, weekday } = parseDateParts(ticketData.dateStr);
    ticketHtml = `
      <div style="margin: 28px 0; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 16px -2px rgba(15, 23, 42, 0.05);">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
          <tr>
            <!-- Left Date Stamp Ticket Box -->
            <td width="120" align="center" style="background-color: #f8fafc; border-right: 1px dashed #cbd5e1; padding: 22px 14px; vertical-align: middle;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="width: 82px; margin: 0 auto; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
                <tr>
                  <td align="center" style="background-color: ${t.ticketHeaderBg}; color: #ffffff; font-size: 11px; font-weight: 800; letter-spacing: 0.1em; padding: 5px 0;">
                    ${month}
                  </td>
                </tr>
                <tr>
                  <td align="center" style="background-color: #ffffff; padding: 8px 0 6px 0;">
                    <div style="font-size: 28px; font-weight: 900; color: #0f172a; line-height: 1;">
                      ${day}
                    </div>
                    <div style="font-size: 10px; font-weight: 700; color: #64748b; letter-spacing: 0.08em; text-transform: uppercase; margin-top: 4px;">
                      ${weekday}
                    </div>
                  </td>
                </tr>
              </table>
            </td>

            <!-- Right Meeting Information -->
            <td style="padding: 20px 24px; vertical-align: middle;">
              <div style="margin-bottom: 8px;">
                <span style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em;">Confirmed Time</span>
                <div style="font-size: 17px; font-weight: 800; color: #0f172a; margin-top: 2px;">
                  ⏰ ${ticketData.timeStr || "Time TBD"}
                </div>
              </div>
              
              <div style="margin-bottom: 8px;">
                <span style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em;">Position</span>
                <div style="font-size: 14px; font-weight: 700; color: ${t.accentText}; margin-top: 1px;">
                  💼 ${ticketData.role}
                </div>
              </div>

              ${
                ticketData.interviewer
                  ? `
              <div style="margin-bottom: 8px;">
                <span style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em;">Interviewer</span>
                <div style="font-size: 13px; font-weight: 600; color: #334155; margin-top: 1px;">
                  👤 ${ticketData.interviewer}
                </div>
              </div>`
                  : ""
              }

              <div>
                <span style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em;">Platform &amp; Format</span>
                <div style="font-size: 13px; font-weight: 600; color: #334155; margin-top: 1px;">
                  🎥 ${ticketData.mode || "Google Meet Video"} ${
                    ticketData.duration ? `(${ticketData.duration})` : ""
                  }
                </div>
              </div>
            </td>
          </tr>
        </table>
      </div>
    `;
  }

  // Render Details List if present
  let detailsListHtml = "";
  if (detailsList && detailsList.length > 0) {
    detailsListHtml = `
      <div style="margin: 24px 0; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px 22px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${detailsList
            .filter((d) => d && d.value)
            .map(
              (item, idx, arr) => `
            <tr>
              <td style="padding: 10px 0; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em; ${
                idx < arr.length - 1 ? "border-bottom: 1px solid #edf2f7;" : ""
              }">
                ${item.label}
              </td>
              <td style="padding: 10px 0; font-size: 14px; font-weight: 700; color: #0f172a; text-align: right; ${
                idx < arr.length - 1 ? "border-bottom: 1px solid #edf2f7;" : ""
              }">
                ${item.value}
              </td>
            </tr>
          `
            )
            .join("")}
        </table>
      </div>
    `;
  }

  // Render CTA Button
  let ctaHtml = "";
  if (ctaButton && ctaButton.url) {
    ctaHtml = `
      <div style="text-align: center; margin: 30px 0 24px 0;">
        <a href="${ctaButton.url}" target="_blank" style="background: ${t.buttonBg}; color: #ffffff; padding: 16px 36px; font-size: 15px; font-weight: 800; text-decoration: none; border-radius: 12px; display: inline-block; box-shadow: 0 8px 24px -4px ${t.buttonShadow}; letter-spacing: 0.03em;">
          ${
            ctaButton.isMeet
              ? `<span style="vertical-align: middle; margin-right: 8px;">🎥</span>`
              : ""
          }
          ${ctaButton.text} →
        </a>
      </div>
    `;
  }

  // Render Guidelines Cards
  let guidelinesHtml = "";
  if (guidelines && guidelines.length > 0) {
    guidelinesHtml = `
      <div style="margin: 28px 0; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px 22px;">
        <div style="font-size: 12px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 14px;">
          ✦ Session Checklist &amp; Guidelines
        </div>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${guidelines
            .map(
              (g) => `
            <tr>
              <td width="28" style="vertical-align: top; padding: 6px 0; font-size: 15px;">
                ${g.icon || "✓"}
              </td>
              <td style="vertical-align: top; padding: 6px 0 6px 6px;">
                <div style="font-size: 13px; font-weight: 700; color: #1e293b;">${g.title}</div>
                <div style="font-size: 12px; color: #64748b; line-height: 1.5; margin-top: 2px;">${g.desc}</div>
              </td>
            </tr>
          `
            )
            .join("")}
        </table>
      </div>
    `;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${headline}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f4f6fb;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
      color: #334155;
    }
    @media only screen and (max-width: 620px) {
      .email-card {
        width: 100% !important;
        border-radius: 0 !important;
        border: none !important;
      }
      .email-body-padding {
        padding: 24px 20px !important;
      }
      .email-header-padding {
        padding: 24px 20px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 28px 10px; background-color: #f4f6fb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f6fb;">
    <tr>
      <td align="center">
        <!-- Main Premium Email Card -->
        <table role="presentation" class="email-card" width="620" cellpadding="0" cellspacing="0" style="max-width: 620px; width: 100%; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 20px 40px -15px rgba(15, 23, 42, 0.12), 0 0 1px 1px rgba(15, 23, 42, 0.05);">
          
          <!-- Glowing 5px Gradient Accent -->
          <tr>
            <td height="5" style="background: ${t.gradientBar};"></td>
          </tr>

          <!-- Midnight Obsidian Hero Header -->
          <tr>
            <td class="email-header-padding" style="background-color: #0f172a; background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%); padding: 32px 36px 28px 36px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <!-- Top Brand Logo + Floating Badge -->
                <tr>
                  <td align="left" style="vertical-align: middle;">
                    <div style="background: rgba(255, 255, 255, 0.96); padding: 6px 14px; border-radius: 8px; display: inline-block;">
                      <img src="${safeLogo}" alt="${safeOrg}" style="display: block; border: 0; max-height: 38px; max-width: 160px; width: auto; object-fit: contain;" />
                    </div>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <span style="display: inline-block; padding: 6px 14px; background-color: ${t.badgeBg}; color: ${t.badgeColor}; border: 1px solid ${t.badgeBorder}; font-size: 11px; font-weight: 800; letter-spacing: 0.09em; text-transform: uppercase; border-radius: 9999px;">
                      ● ${badgeText}
                    </span>
                  </td>
                </tr>

                <!-- Hero Title inside Obsidian Header -->
                <tr>
                  <td colspan="2" style="padding-top: 24px;">
                    <h1 style="font-size: 25px; font-weight: 900; color: #ffffff; letter-spacing: -0.03em; margin: 0 0 6px 0; line-height: 1.25;">
                      ${headline}
                    </h1>
                    <div style="font-size: 14px; color: #94a3b8; font-weight: 500;">
                      ${subtitle || `${safeOrg} Talent Acquisition`}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body Canvas -->
          <tr>
            <td class="email-body-padding" style="padding: 36px 40px;">
              <!-- Candidate Salutation -->
              <div style="font-size: 16px; font-weight: 800; color: #0f172a; margin-bottom: 16px;">
                Dear ${candidateName},
              </div>

              <!-- Introductory Paragraphs -->
              <div style="font-size: 15px; color: #334155; line-height: 1.75;">
                ${introParagraphs
                  .map((p) => `<p style="margin: 0 0 14px 0;">${p}</p>`)
                  .join("")}
              </div>

              <!-- Ticket Schedule Card (if interview) -->
              ${ticketHtml}

              <!-- Details List (if offer / status update) -->
              ${detailsListHtml}

              <!-- Primary CTA Button -->
              ${ctaHtml}

              <!-- Guidelines & Checklist -->
              ${guidelinesHtml}

              <!-- Closing Note -->
              ${
                closingNote
                  ? `<div style="font-size: 14px; color: #475569; line-height: 1.6; margin: 20px 0 0 0;">${closingNote}</div>`
                  : ""
              }

              <!-- Signature Block -->
              <div style="margin-top: 36px; padding-top: 20px; border-top: 1px solid #f1f5f9;">
                <div style="font-size: 13px; color: #64748b;">Warm regards,</div>
                <div style="font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 4px;">${safeOrg} Hiring Team</div>
              </div>
            </td>
          </tr>

          <!-- Minimalist Sleek Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 26px 40px; text-align: center;">
              <div style="font-size: 12px; color: #64748b; margin-bottom: 8px;">
                Need help or have questions? Contact us at <a href="mailto:${safeEmail}" style="color: #2563eb; font-weight: 600; text-decoration: none;">${safeEmail}</a>
              </div>
              <div style="font-size: 11px; color: #94a3b8; font-weight: 500;">
                Powered by <strong style="color: #475569;">HireTrack</strong> · Streamlined Talent Intelligence
              </div>
              <div style="font-size: 10px; color: #cbd5e1; margin-top: 10px; line-height: 1.5;">
                © ${currentYear} ${safeOrg}. All rights reserved. This email is confidential and intended solely for ${candidateName}.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

export const MailTemplates = {
  // ==========================================
  // 1. CANDIDATE SELECTED / OFFER ANNOUNCEMENT
  // ==========================================
  selected: ({
    candidateName,
    job,
    organizationName,
    businessEmail,
    joiningDate,
    reportingTime,
    logo,
  }) => {
    const formattedReportingTime = formatToAMPM(reportingTime);
    const org = organizationName || "HireTrack";
    const jobTitle = job?.jobTitle || "Selected Role";

    const introParagraphs = [
      `We are thrilled to inform you that following your outstanding performance during our hiring process, you have been <strong style="color: #059669;">selected</strong> for the position of <strong style="color: #0f172a;">${jobTitle}</strong> at <strong style="color: #0f172a;">${org}</strong>!`,
      `Our team was genuinely impressed by your achievements, technical depth, and cultural alignment. We are excited about the prospect of having you join our journey.`,
      `Our Human Resources department is now preparing your official employment offer packet and compensation details, which will be delivered shortly via email.`,
    ];

    const detailsList = [
      { label: "Selected Position", value: jobTitle },
      joiningDate ? { label: "Proposed Joining Date", value: joiningDate } : null,
      formattedReportingTime ? { label: "Reporting Time", value: formattedReportingTime } : null,
      { label: "Organization", value: org },
    ];

    const guidelines = [
      {
        icon: "📩",
        title: "Offer Letter Packet",
        desc: "Review your detailed offer letter and benefits documentation once received.",
      },
      {
        icon: "📋",
        title: "Onboarding Verification",
        desc: "You will receive instructions to verify your background details and documentation.",
      },
      {
        icon: "💬",
        title: "Direct Support",
        desc: "Reply directly to this email if you have any preliminary questions or scheduling requests.",
      },
    ];

    return {
      subject: `🎉 Congratulations! You're Selected for ${jobTitle} Role at ${org}`,
      html: renderMasterTemplate({
        theme: "emerald",
        badgeText: "SELECTION OFFER EXTENDED",
        headline: "Congratulations! You've Been Selected",
        subtitle: `Official Selection Notice · ${jobTitle}`,
        candidateName,
        introParagraphs,
        logoUrl: logo,
        orgName: org,
        businessEmail,
        detailsList,
        guidelines,
      }),
    };
  },

  // ==========================================
  // 2. APPLICATION REJECTION / UPDATE
  // ==========================================
  rejection: ({ candidateName, job, organizationName, businessEmail, logo }) => {
    const org = organizationName || "HireTrack";
    const jobTitle = job?.jobTitle || "Applied Role";

    const introParagraphs = [
      `Thank you very much for investing your time and effort to interview and apply for the <strong style="color: #0f172a;">${jobTitle}</strong> opening at <strong style="color: #0f172a;">${org}</strong>.`,
      `We received an exceptional pool of applicants for this role. Following careful consideration by our evaluation panel, we have made the difficult decision to move forward with other candidates whose current skill profile aligns slightly closer with our immediate project roadmap.`,
      `We were truly impressed with your experience and professionalism throughout our discussions. With your consent, we would love to retain your information in our active talent pool for upcoming openings that match your strengths.`,
      `We wish you the very best of luck in your career progression and thank you once again for your interest in ${org}.`,
    ];

    const detailsList = [
      { label: "Application For", value: jobTitle },
      { label: "Status", value: "Evaluation Completed" },
      { label: "Organization", value: org },
    ];

    return {
      subject: `Update on your application for ${jobTitle} at ${org}`,
      html: renderMasterTemplate({
        theme: "slate",
        badgeText: "APPLICATION UPDATE",
        headline: "Application Status Update",
        subtitle: `${jobTitle} · ${org}`,
        candidateName,
        introParagraphs,
        logoUrl: logo,
        orgName: org,
        businessEmail,
        detailsList,
      }),
    };
  },

  // ==========================================
  // 3. CANDIDATE SHORTLISTED
  // ==========================================
  shortlisted: ({
    candidateName,
    job,
    organizationName,
    businessEmail,
    logo,
  }) => {
    const org = organizationName || "HireTrack";
    const jobTitle = job?.jobTitle || "Role";

    const introParagraphs = [
      `Thank you for applying for the <strong style="color: #0f172a;">${jobTitle}</strong> position at <strong style="color: #0f172a;">${org}</strong>.`,
      `Our hiring team has completed the initial resume and profile screening, and we are delighted to inform you that your application has been <strong style="color: #2563eb;">shortlisted</strong> for the upcoming interview phase!`,
      `Our recruitment coordinator will be in touch shortly with specific meeting dates, interviewers, and calendar invitation links.`,
    ];

    const detailsList = [
      { label: "Position", value: jobTitle },
      { label: "Current Stage", value: "Shortlisted for Round 1" },
      { label: "Organization", value: org },
    ];

    const guidelines = [
      {
        icon: "📅",
        title: "Watch Your Inbox",
        desc: "You will receive calendar scheduling slots for your upcoming technical round.",
      },
      {
        icon: "💼",
        title: "Review Role Scope",
        desc: "Familiarize yourself with the core technologies and responsibilities for the role.",
      },
      {
        icon: "🚀",
        title: "Showcase Your Work",
        desc: "Have your GitHub repositories, portfolio, or case studies ready to discuss.",
      },
    ];

    return {
      subject: `Great news! You're shortlisted for ${jobTitle} at ${org}`,
      html: renderMasterTemplate({
        theme: "blue",
        badgeText: "APPLICATION SHORTLISTED",
        headline: "You've Been Shortlisted!",
        subtitle: `Next Stage Invitation · ${jobTitle}`,
        candidateName,
        introParagraphs,
        logoUrl: logo,
        orgName: org,
        businessEmail,
        detailsList,
        guidelines,
      }),
    };
  },

  // ==========================================
  // 4. INTERVIEW SCHEDULED
  // ==========================================
  interviewScheduled: ({
    candidateName,
    job,
    interviewDate,
    time24,
    meetingLink,
    recruiterName,
    organizationName,
    businessEmail,
    logo,
  }) => {
    const formattedTime = formatToAMPM(time24);
    const org = organizationName || "HireTrack";
    const jobTitle = job?.jobTitle || "Role";

    const introParagraphs = [
      `Thank you for your ongoing interest in the <strong style="color: #0f172a;">${jobTitle}</strong> position at <strong style="color: #0f172a;">${org}</strong>.`,
      `We are pleased to invite you to your scheduled video interview. Please review your session ticket below and make sure to join promptly at the designated time:`,
    ];

    const ticketData = {
      dateStr: interviewDate,
      timeStr: formattedTime,
      role: jobTitle,
      interviewer: recruiterName || `${org} Hiring Lead`,
      mode: "Google Meet (HD Video)",
      duration: "45 Minutes",
    };

    const ctaButton = meetingLink
      ? {
          text: "Join Google Meet",
          url: meetingLink,
          isMeet: true,
        }
      : null;

    const guidelines = [
      {
        icon: "⏱️",
        title: "Join 5 Minutes Early",
        desc: "Connect a few moments early to verify audio and video functionality.",
      },
      {
        icon: "🎧",
        title: "Quiet Environment",
        desc: "Choose a quiet room with good lighting and stable internet access.",
      },
      {
        icon: "📄",
        title: "Resume & Portfolio",
        desc: "Keep your resume and project links available for live screen-sharing.",
      },
    ];

    return {
      subject: `Interview Scheduled: ${jobTitle} – ${org}`,
      html: renderMasterTemplate({
        theme: "blue",
        badgeText: "CONFIRMED INTERVIEW",
        headline: "Interview Scheduled",
        subtitle: `${jobTitle} · ${org}`,
        candidateName,
        introParagraphs,
        logoUrl: logo,
        orgName: org,
        businessEmail,
        ticketData,
        ctaButton,
        guidelines,
      }),
    };
  },

  // ==========================================
  // 5. INTERVIEW RESCHEDULED
  // ==========================================
  interviewRescheduled: ({
    candidateName,
    job,
    newDate,
    time24,
    meetingLink,
    organizationName,
    businessEmail,
    logo,
  }) => {
    const formattedTime = formatToAMPM(time24);
    const org = organizationName || "HireTrack";
    const jobTitle = job?.jobTitle || "Role";

    const introParagraphs = [
      `Please note that your scheduled interview for the <strong style="color: #0f172a;">${jobTitle}</strong> position at <strong style="color: #0f172a;">${org}</strong> has been updated.`,
      `We have confirmed your revised session time. Please review your updated meeting ticket below. This is your confirmed opportunity to attend the interview:`,
    ];

    const ticketData = {
      dateStr: newDate,
      timeStr: formattedTime,
      role: jobTitle,
      mode: "Google Meet (HD Video)",
      duration: "Updated Session",
    };

    const ctaButton = meetingLink
      ? {
          text: "Join Rescheduled Meeting",
          url: meetingLink,
          isMeet: true,
        }
      : null;

    const guidelines = [
      {
        icon: "📅",
        title: "Update Calendar",
        desc: "Please update your calendar with this revised date and time slot.",
      },
      {
        icon: "⏱️",
        title: "Punctuality",
        desc: "Join 5 minutes prior to ensure a smooth connection.",
      },
      {
        icon: "💬",
        title: "Need Help?",
        desc: "If any urgent conflict arises, reply to this email immediately.",
      },
    ];

    return {
      subject: `Interview Rescheduled: ${jobTitle} – ${org}`,
      html: renderMasterTemplate({
        theme: "amber",
        badgeText: "TIME UPDATED · RESCHEDULED",
        headline: "Interview Rescheduled",
        subtitle: `Updated Timing · ${jobTitle}`,
        candidateName,
        introParagraphs,
        logoUrl: logo,
        orgName: org,
        businessEmail,
        ticketData,
        ctaButton,
        guidelines,
      }),
    };
  },

  // ==========================================
  // 6. FORMAL OFFER LETTER EMAIL
  // ==========================================
  offerLetter: ({
    selectedTemplate,
    candidateName,
    companyName,
    companyAddress,
    logo,
    salutation,
    introParagraph,
    position,
    duration,
    startDate,
    endDate,
    location,
    employmentType,
    salary,
    stipend,
    noticePeriod,
    responsibilities,
    joiningInstructions,
    closingNote,
    senderName,
    senderTitle,
    phone,
    email,
    website,
  }) => {
    const org = companyName || "HireTrack";
    const jobTitle = position || "Offer Role";

    const introParagraphs = [
      introParagraph ||
        `We are delighted to extend this formal offer of employment for the position of <strong style="color: #0f172a;">${jobTitle}</strong> at <strong style="color: #0f172a;">${org}</strong>.`,
      `We believe your skills, vision, and leadership will be instrumental in driving our team forward. Please review the key terms of your offer below:`,
    ];

    const detailsList = [
      { label: "Offered Position", value: jobTitle },
      employmentType ? { label: "Employment Type", value: employmentType } : null,
      salary ? { label: "Compensation Package", value: salary } : null,
      stipend ? { label: "Stipend", value: stipend } : null,
      startDate ? { label: "Official Start Date", value: startDate } : null,
      duration ? { label: "Contract Duration", value: duration } : null,
      location ? { label: "Work Location", value: location } : null,
      noticePeriod ? { label: "Notice Period", value: noticePeriod } : null,
      companyAddress ? { label: "Company Office", value: companyAddress } : null,
    ];

    const guidelines = [];
    if (responsibilities) {
      guidelines.push({
        icon: "🎯",
        title: "Key Responsibilities",
        desc: responsibilities.replace(/\n+/g, " · "),
      });
    }
    if (joiningInstructions) {
      guidelines.push({
        icon: "📋",
        title: "Joining Instructions",
        desc: joiningInstructions.replace(/\n+/g, " · "),
      });
    }

    return {
      subject: `Offer Letter: ${jobTitle} | ${org}`,
      html: renderMasterTemplate({
        theme: "emerald",
        badgeText: "OFFICIAL OFFER OF EMPLOYMENT",
        headline: "Offer of Employment",
        subtitle: `${jobTitle} · ${org}`,
        candidateName,
        introParagraphs,
        logoUrl: logo,
        orgName: org,
        businessEmail: email,
        detailsList,
        guidelines: guidelines.length > 0 ? guidelines : undefined,
        closingNote:
          closingNote ||
          "Please review and sign the attached offer letter and return a signed copy to confirm your acceptance.",
      }),
    };
  },

  // ==========================================
  // 7. GROUP DISCUSSION (GD) SCHEDULED
  // ==========================================
  gdScheduled: ({
    candidateName,
    jobTitle,
    interviewDate,
    time24,
    durationMinutes,
    meetingLink,
    organizationName,
    businessEmail,
    recruiterName,
    logo,
  }) => {
    const formattedTime = formatToAMPM(time24);
    const org = organizationName || "HireTrack";
    const roleTitle = jobTitle || "Role";

    const introParagraphs = [
      `You have been scheduled for the <strong style="color: #0f172a;">Group Discussion (GD)</strong> round for the <strong style="color: #0f172a;">${roleTitle}</strong> opening at <strong style="color: #0f172a;">${org}</strong>.`,
      `This session is designed to evaluate structured communication, critical reasoning, and team collaboration. Please review your session ticket below and join promptly:`,
    ];

    const ticketData = {
      dateStr: interviewDate,
      timeStr: formattedTime,
      role: roleTitle,
      interviewer: recruiterName || `${org} GD Moderator`,
      mode: "Google Meet (Group Session)",
      duration: durationMinutes ? `${durationMinutes} Minutes` : "45 Minutes",
    };

    const ctaButton = meetingLink
      ? {
          text: "Join Group Discussion",
          url: meetingLink,
          isMeet: true,
        }
      : null;

    const guidelines = [
      {
        icon: "🎙️",
        title: "Clear Microphone",
        desc: "Ensure clear audio input and minimize background noise.",
      },
      {
        icon: "📹",
        title: "Active Video",
        desc: "Keep your camera turned on and positioned in a well-lit space.",
      },
      {
        icon: "🤝",
        title: "Constructive Collaboration",
        desc: "Engage respectfully, articulate your thoughts clearly, and listen actively.",
      },
    ];

    return {
      subject: `Group Discussion Scheduled: ${roleTitle} – ${org}`,
      html: renderMasterTemplate({
        theme: "blue",
        badgeText: "GROUP DISCUSSION SCHEDULED",
        headline: "Group Discussion Round",
        subtitle: `${roleTitle} · Collaborative Evaluation`,
        candidateName,
        introParagraphs,
        logoUrl: logo,
        orgName: org,
        businessEmail,
        ticketData,
        ctaButton,
        guidelines,
      }),
    };
  },

  // ==========================================
  // 8. GROUP DISCUSSION (GD) RESCHEDULED
  // ==========================================
  gdRescheduled: ({
    candidateName,
    jobTitle,
    interviewDate,
    time24,
    durationMinutes,
    meetingLink,
    organizationName,
    businessEmail,
    recruiterName,
    logo,
  }) => {
    const formattedTime = formatToAMPM(time24);
    const org = organizationName || "HireTrack";
    const roleTitle = jobTitle || "Role";

    const introParagraphs = [
      `Please note that your <strong style="color: #0f172a;">Group Discussion (GD)</strong> round for the <strong style="color: #0f172a;">${roleTitle}</strong> position at <strong style="color: #0f172a;">${org}</strong> has been updated.`,
      `Please review the revised session ticket below and join using the access button at the updated start time:`,
    ];

    const ticketData = {
      dateStr: interviewDate,
      timeStr: formattedTime,
      role: roleTitle,
      interviewer: recruiterName || `${org} Moderator`,
      mode: "Google Meet (Group Session)",
      duration: durationMinutes ? `${durationMinutes} Minutes` : "45 Minutes",
    };

    const ctaButton = meetingLink
      ? {
          text: "Join Rescheduled GD",
          url: meetingLink,
          isMeet: true,
        }
      : null;

    const guidelines = [
      {
        icon: "📅",
        title: "Update Schedule",
        desc: "Add this revised time slot to your calendar to avoid any overlap.",
      },
      {
        icon: "⏱️",
        title: "Join Early",
        desc: "Connect 5 minutes prior to ensure audio and video stability.",
      },
      {
        icon: "💬",
        title: "Contact Coordinator",
        desc: "Reply directly if you need any assistance or have urgent conflicts.",
      },
    ];

    return {
      subject: `Group Discussion Rescheduled: ${roleTitle} – ${org}`,
      html: renderMasterTemplate({
        theme: "amber",
        badgeText: "GD TIME UPDATED · RESCHEDULED",
        headline: "Group Discussion Rescheduled",
        subtitle: `Updated Timing · ${roleTitle}`,
        candidateName,
        introParagraphs,
        logoUrl: logo,
        orgName: org,
        businessEmail,
        ticketData,
        ctaButton,
        guidelines,
      }),
    };
  },
};