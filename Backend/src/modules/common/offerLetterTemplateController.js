import OfferLetterTemplate from "./OfferLetterTemplateSchema.js";
import Application from "../applications/applicantSchema.js";
import userModel from "../users/user.model.js";
import Job from "../jobs/job.model.js";
import { sendEmail } from "../../common/utils/emailService.js";
import { MailTemplates } from "../../common/utils/mailTemaplate.js";
import { generateOfferLetterPdf } from "../../common/utils/generateOfferLetterPdf.js";

// @desc    Get offer letter template for the company
// @route   GET /api/offer-letter-template
// @access  Private
export const getOfferLetterTemplate = async (req, res) => {
  try {
    const { companyCode } = req.user;
    const { jobId } = req.query;

    if (!jobId) {
      return res
        .status(400)
        .json({ success: false, message: "jobId is required" });
    }

    const template = await OfferLetterTemplate.findOne({ companyCode, jobId });

    if (!template) {
      return res.status(200).json({
        success: true,
        data: null,
        message: "No template found for this job",
      });
    }

    res.status(200).json({
      success: true,
      data: template,
    });
  } catch (error) {
    console.error("Error fetching offer letter template:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// @desc    Save or update offer letter template
// @route   POST /api/offer-letter-template
// @access  Private
export const saveOfferLetterTemplate = async (req, res) => {
  try {
    const { companyCode } = req.user;
    const { jobId, ...templateData } = req.body;

    if (!jobId) {
      return res
        .status(400)
        .json({ success: false, message: "jobId is required" });
    }

    // Attempt to drop old single-field unique index if it exists
    try {
      await OfferLetterTemplate.collection.dropIndex("companyCode_1");
    } catch (e) {
      // Index might not exist or already dropped, ignore
    }

    const template = await OfferLetterTemplate.findOneAndUpdate(
      { companyCode, jobId },
      { ...templateData, companyCode, jobId },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    res.status(200).json({
      success: true,
      data: template,
      message: "Template saved successfully",
    });
  } catch (error) {
    console.error("Error saving offer letter template:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
      error: error,
    });
  }
};

// @desc    Send offer letter email to selected candidates
// @route   POST /api/offer-letter-template/send
// @access  Private
export const sendOfferLetter = async (req, res) => {
  try {
    const { companyCode } = req.user;
    const { jobId, candidateIds, templateData } = req.body;

    if (!jobId) {
      return res
        .status(400)
        .json({ success: false, message: "jobId is required" });
    }

    if (
      !candidateIds ||
      !Array.isArray(candidateIds) ||
      candidateIds.length === 0
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message: "At least one candidate must be selected",
        });
    }

    if (!templateData) {
      return res
        .status(400)
        .json({ success: false, message: "Template data is required" });
    }

    // Fetch SuperAdmin profile for phone & email
    const admin = await userModel
      .findOne({
        companyCode,
        role: "SuperAdmin",
      })
      .lean();

    const adminPhone = admin?.contactNumber || "";
    const adminEmail = admin?.businessEmail || "";

    // Fetch all selected applications to get candidate emails and names
    const applications = await Application.find({
      _id: { $in: candidateIds },
      jobId,
      companyCode,
    }).lean();

    if (applications.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No candidates found for the given IDs",
      });
    }

    // Fetch job details for joining instructions
    const job = await Job.findById(jobId).lean();
    const joiningInstructions = job?.joiningInstructions || "";

    const results = { sent: 0, failed: 0, errors: [] };
    // console.time(`Total Send Offer Letters Process`);

    // Send individual emails to each candidate
    for (const app of applications) {
      try {
        const candidateName =
          `${app.answers?.firstName || ""} ${app.answers?.middleName || ""} ${app.answers?.lastName || ""}`.replace(/\s+/g, ' ').trim() ||
          app.answers?.full_name ||
          app.answers?.name ||
          "Candidate";

        const candidateEmail = app.answers?.email;

        if (!candidateEmail) {
          results.failed++;
          results.errors.push(`No email found for candidate: ${candidateName}`);
          continue;
        }

        // Generate the offer letter HTML for this candidate
        // Logo 1: Profile/Company logo for mail template header
        const mailLogoValue = admin?.companyLogo || null;
        const isBase64MailLogo = mailLogoValue && mailLogoValue.startsWith("data:");
        const logoForMailHeader = isBase64MailLogo ? "cid:companyLogo" : mailLogoValue;

        // Logo 2: Offer letter specific logo for PDF only
        const pdfLogoValue = templateData.logo || null;
        
        const selectedTemplate = templateData.selectedTemplate || 'default';
        const selectedColor = templateData.selectedColor || 'blue';
        
        const { subject, html } = MailTemplates.offerLetter({
          selectedTemplate,
          selectedColor,
          candidateName,
          companyName: templateData.companyName || "",
          companyAddress: templateData.companyAddress || "",
          logo: logoForMailHeader,
          salutation: templateData.salutation || "Dear",
          introParagraph: templateData.introParagraph || "",
          position: templateData.position || "",
          duration: templateData.duration || "6 months",
          startDate: templateData.startDate || "",
          endDate: templateData.endDate || "",
          location: templateData.location || "Remote",
          employmentType: templateData.employmentType,
          salary: templateData.salary || "",
          stipend: templateData.stipend || "Unpaid Internship",
          noticePeriod:
            templateData.noticePeriod || "One week (5 working days)",
          responsibilities: templateData.responsibilities || "",
          notice: templateData.notice || "",
          joiningInstructions: joiningInstructions || templateData.notice || "",
          closingNote: templateData.closingNote || "",
          senderName: templateData.senderName || admin?.userName || "",
          senderTitle: templateData.senderTitle || "",
          phone: templateData.phone || adminPhone,
          email: templateData.contactEmail || adminEmail,
          website: templateData.website || "",
          signature: templateData.signature || null,
        });

        // Build attachments — embed base64 logo as CID inline image for mail header
        const attachments = [];
        if (mailLogoValue && mailLogoValue.startsWith("data:")) {
          const matches = mailLogoValue.match(/^data:(.+);base64,(.+)$/);
          if (matches) {
            const mimeType = matches[1];
            const ext = mimeType.split("/")[1] || "png";
            attachments.push({
              filename: `logo.${ext}`,
              content: matches[2],
              encoding: "base64",
              cid: "companyLogo",
            });
          }
        }
        
        // Add Agreement PDF if provided
        if (templateData.agreement && templateData.agreement.startsWith("data:application/pdf;base64,")) {
          attachments.push({
            filename: "Agreement.pdf",
            content: templateData.agreement.split(",")[1],
            encoding: "base64",
            contentType: "application/pdf",
          });
        }

        // Generate PDF attachment of the offer letter
        const pdfTemplateData = {
          selectedTemplate,
          selectedColor,
          candidateName,
          companyName: templateData.companyName || "",
          companyAddress: templateData.companyAddress || "",
          logo: pdfLogoValue,
          salutation: templateData.salutation || "Dear",
          introParagraph: templateData.introParagraph || "",
          position: templateData.position || "",
          duration: templateData.duration || "6 months",
          startDate: templateData.startDate || "",
          endDate: templateData.endDate || "",
          location: templateData.location || "Remote",
          employmentType: templateData.employmentType,
          salary: templateData.salary || "",
          stipend: templateData.stipend || "Unpaid Internship",
          noticePeriod:
            templateData.noticePeriod || "One week (5 working days)",
          responsibilities: templateData.responsibilities || "",
          notice: templateData.notice || "",
          joiningInstructions: joiningInstructions || templateData.notice || "",
          closingNote: templateData.closingNote || "",
          senderName: templateData.senderName || admin?.userName || "",
          senderTitle: templateData.senderTitle || "",
          phone: templateData.phone || adminPhone,
          email: templateData.contactEmail || adminEmail,
          website: templateData.website || "",
          signature: templateData.signature || null,
        };

        try {
          // console.time(`Full PDF Generation - ${candidateName}`);
          const pdfBuffer = await generateOfferLetterPdf(pdfTemplateData);
          // console.timeEnd(`Full PDF Generation - ${candidateName}`);
          attachments.push({
            filename: `Offer_Letter_${candidateName.replace(/\s+/g, "_")}.pdf`,
            content: pdfBuffer,
            contentType: "application/pdf",
          });
          console.log(`📄 PDF generated for: ${candidateName}`);
        } catch (pdfErr) {
          console.error(
            `⚠️ PDF generation failed for ${candidateName}:`,
            pdfErr.message,
          );
          // Throw error so we DON'T send the email without the PDF
          throw new Error(`PDF generation failed: ${pdfErr.message}`);
        }

        // Send email using existing email service
        // console.time(`Send Email - ${candidateName}`);
        await sendEmail({
          companyCode,
          to: candidateEmail,
          subject,
          html,
          attachments,
        });
        // console.timeEnd(`Send Email - ${candidateName}`);

        // Mark offer letter as sent in the application
        await Application.updateOne(
          { _id: app._id },
          { $set: { "hiringDetails.offerLetterSent": true } },
        );

        results.sent++;
        console.log(
          `✅ Offer letter sent to: ${candidateName} (${candidateEmail})`,
        );
      } catch (emailError) {
        results.failed++;
        const name = app.answers?.name || "Unknown";
        results.errors.push(`Failed to send to ${name}: ${emailError.message}`);
        console.error(
          `❌ Failed to send offer letter to ${name}:`,
          emailError.message,
        );
      }
      }
      // console.timeEnd(`Total Send Offer Letters Process`);

      if (results.sent === 0 && results.failed > 0) {
        return res.status(400).json({
          success: false,
          message: "Failed to send offer letter",
          data: results,
        });
      }

      res.status(200).json({
        success: true,
        message: `Offer letters sent: ${results.sent}/${applications.length}` + (results.failed > 0 ? `. Failed: ${results.failed}` : ""),
        data: results,
      });
  } catch (error) {
    console.error("Error sending offer letters:", error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: error.message || "Server Error",
      });
    }
  }
};

