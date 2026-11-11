import mongoose from "mongoose";
import Application from "./applicantSchema.js";
import Job from "../jobs/job.model.js";
import Candidate from "../interviews/candidateInterview.model.js";
import { sendEmail } from "../../common/utils/emailService.js";

/**
 * POST /hired/:jobId
 * Mark an application as hired
 */
const postHired = async (req, res) => {
  try {
    const { jobId } = req.params;
    const {
      applicationId,
      salary = null,
      startDate = null,
      hiringNotes = "",
      offerLetterSent = false,
    } = req.body;

    const companyCode = req.user.companyCode; // ✅ ADDED

    if (!applicationId) {
      return res.status(400).json({
        success: false,
        message: "applicationId is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid jobId format",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid applicationId format",
      });
    }

    // ✅ companyCode added
    const job = await Job.findOne({ 
      _id: jobId, 
      isDraft: false,
      companyCode
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found or not published",
      });
    }

    // ✅ companyCode added
    const application = await Application.findOne({
      _id: applicationId,
      jobId,
      companyCode
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found for this job",
      });
    }

    if (application.profileStatus === "hired") {
      return res.status(400).json({
        success: false,
        message: "Candidate is already hired for this job",
      });
    }

    if (application.profileStatus === "rejected") {
      return res.status(400).json({
        success: false,
        message: "Cannot hire a rejected candidate",
      });
    }

    if (salary !== null && (typeof salary !== "number" || salary <= 0)) {
      return res.status(400).json({
        success: false,
        message: "Salary must be a positive number",
      });
    }

    if (startDate && isNaN(Date.parse(startDate))) {
      return res.status(400).json({
        success: false,
        message: "Invalid startDate format (use YYYY-MM-DD)",
      });
    }

    const candidate = await Candidate.findById(
      application.candidateId
    ).lean();

    const previousStatus = application.profileStatus;

    application.profileStatus = "hired";
    application.candidateRating = "Good fit";

    application.hiringDetails = {
      hiredOn: new Date(),
      salary,
      startDate: startDate ? new Date(startDate) : null,
      hiringNotes,
      offerLetterSent,
    };

    if (hiringNotes) {
      application.candidateFeedback = {
        ...(application.candidateFeedback || {}),
        feedbackDescription: application.candidateFeedback?.feedbackDescription
          ? `${application.candidateFeedback.feedbackDescription}\n\nHired: ${hiringNotes}`
          : `Hired: ${hiringNotes}`,
      };
    }

    await application.save({ validateBeforeSave: false });

    // ✅ companyCode added
    await Candidate.updateOne(
      { 
        candidateId: application._id,
        companyCode
      },
      {
        $set: {
          Status: "hired",
        },
      }
    );

    const offerAcceptanceLink = '';

    console.log("------------------------------MAIL--------------------------------");
    const candidateName = application?.answers?.name || `${application?.answers?.firstName || ""} ${application?.answers?.lastName || ""}` || candidate?.name ;
  //   await sendEmail({
  //     companyCode:companyCode,
  //     to: application.answers.email,
  //     subject: `Offer Letter - ${job.jobTitle} | ${job.companyInfo}`,
  //     html: `<!DOCTYPE html>
  //     <html lang="en">
  //     <head>
  //         <meta charset="UTF-8">
  //         <meta name="viewport" content="width=device-width, initial-scale=1.0">
  //         <title>Application Offerletter - ${job.jobTitle}</title>
  //         <style>
  //             /* Your original CSS preserved exactly */
  //             body {
  //                 margin: 0;
  //                 padding: 0;
  //                 font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  //                 background-color: #f4f6fa;
  //                 color: #333333;
  //                 -webkit-font-smoothing: antialiased;
  //             }
  //             .top-header { background-color: #263765; padding: 80px 20px; }
  //             .header-content { max-width: 650px; margin: 0 auto; color: #ffffff; display: flex; align-items: center; gap: 10px; }
  //             .logo-text { font-size: 20px; line-height: 1.1; }
  //             .logo-text span { font-weight: 800; font-size: 22px; letter-spacing: 0.5px; }
  //             .main-wrapper { padding: 0 20px; margin-top: -40px; margin-bottom: -40px; position: relative; z-index: 1; }
  //             .email-container { max-width: 650px; margin: 0 auto; background-color: #ffffff; border-top: 1px solid #ffffff; border-radius: 4px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05); overflow: hidden; }
  //             .email-title { background-color: #2F3031; color: #ffffff; padding: 20px 30px; font-size: 20px; font-weight: 600; }
  //             .email-body { padding: 25px 30px 10px 30px; }
  //             .meta-info { text-align: right; color: #888888; font-size: 13px; margin-bottom: 25px; }
  //             .meta-info span.dots { letter-spacing: 2px; margin-left: 5px; font-size: 16px; }
  //             p { line-height: 1.6; margin-bottom: 20px; font-size: 15px; }
  //             .highlight { font-weight: 700; }
  //             .info-box { background-color: #edf2fc; padding: 20px 25px; border-radius: 8px; margin: 30px 0; }
  //             .info-box ul { list-style-type: disc; margin: 0; padding-left: 20px; }
  //             .info-box li { margin-bottom: 8px; font-size: 15px; }
  //             .info-box li:last-child { margin-bottom: 0; }
  //             .btn-support { background-color: #1a73e8; color: #ffffff; border: none; border-radius: 4px; padding: 10px 20px; font-size: 14px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; margin-bottom: 25px; }
  //             a { color: #1a73e8; text-decoration: underline; font-weight: 600; }
  //             .sign-off { margin-top: 40px; margin-bottom: 30px; }
  //             .sign-off p { margin: 0; }
  //             .banner { background: linear-gradient(90deg, #f8727b 0%, #a45a7b 40%, #2b3a67 100%); color: #ffffff; padding: 20px 30px; display: flex; justify-content: space-between; align-items: center; }
  //             .banner-text h4 { margin: 0 0 5px 0; font-size: 12px; font-weight: 400; letter-spacing: 1px; text-transform: uppercase; }
  //             .banner-text h2 { margin: 0 0 5px 0; font-size: 20px; font-weight: 800; }
  //             .banner-text p { margin: 0; font-size: 12px; color: #e0e0e0; }
  //             .badge-container { display: flex; flex-direction: column; align-items: center; position: relative; }
  //             .badge { width: 50px; height: 50px; background-color: #db2b39; border: 3px solid #6b7a9e; border-radius: 50%; display: flex; justify-content: center; align-items: center; text-align: center; font-size: 7px; font-weight: bold; line-height: 1.1; box-shadow: 0 0 0 2px #2b3a67; }
  //             .stars { color: #ffd700; font-size: 12px; margin-top: 5px; letter-spacing: 1px; }
  //             .disclaimer { text-align: center; padding: 30px; font-size: 10px; color: #666666; line-height: 1.8; background-color: #ffffff; }
  //             .disclaimer p { margin: 0 0 5px 0; font-size: 10px; }
  //             .disclaimer a { color: #666666; text-decoration: none; font-weight: normal; }
  //             .bottom-footer { background-color: #263765; padding: 80px 20px 60px 20px; }
  //             .footer-content { max-width: 650px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; color: #ffffff; font-size: 13px; }
  //             .social-icons { display: flex; gap: 15px; align-items: center; }
  //             .social-link { display: inline-flex; align-items: center; justify-content: center; width: 34px; height: 34px; transition: all 0.3s ease; text-decoration: none; }
  //             .social-link:hover { transform: translateY(-3px); filter: brightness(1.1); }
  //             .social-link.whatsapp { background-color: #25D366; border-radius: 50%; }
  //             .social-link.instagram { background: radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%); border-radius: 8px; }
  //             .social-link.linkedin { background-color: #0077B5; border-radius: 4px; }
  //             .social-link.x { background-color: transparent; }
  //             @media (max-width: 600px) {
  //                 .banner { flex-direction: column; align-items: flex-start; gap: 20px; }
  //                 .footer-content { flex-direction: column; gap: 15px; text-align: center; }
  //             }
  //         </style>
  //     </head>
  //     <body>
      
  //         <div class="top-header">
  //             <div class="header-content">
  //                <img src="https://asset.techjose.com/Interview-app/71a1f81d1bee7ef521daa0cf17b2e90974d03f6615ec2fd1ef5ff9844b942906.png" alt="Company Logo" width="230" height="100" style="display:block; border:0;" />
  //             </div>
  //         </div>
      
  //         <div class="main-wrapper">
  //             <div class="email-container">
  //                 <div class="email-title">Application Update</div>
  //                 <div class="email-body">
  //                 <div class="meta-info">
  //                     8:30 PM | 5 hours ago <span class="dots">&#8226;&#8226;&#8226;</span>
  //                 </div>
  
  //                 <p>Dear ${candidateName},</p>
  
  //                 <p>We are pleased to inform you that you have been <span class="highlight">selected for the position of ${job.jobTitle} at ${job.companyInfo}.</span></p>
  
  //                 <p>Congratulations! Based on your performance throughout the selection process, we are excited to welcome you to our team.</p>
  
  //                 <p><span class="highlight">📍  Joining Details</span></p>
  
  //                 <div class="info-box">
  //                     <ul>
  //                         <li><span class="highlight">Position:</span> ${job.jobTitle} </li>
  //                         <li><span class="highlight">Joining Date:</span>${startDate}</li>
  //                         <li><span class="highlight">Reporting Time:</span> 9:30 AM</li>
  //                     </ul>
  //                 </div>
  
  //                   <p class="highlight">Instructions :</p>
  //                 <ul style="list-style-type: disc; padding-left: 20px; margin-bottom: 25px;">
  //                     <li style="margin-bottom: 8px; font-size: 15px;">Please bring a copy of your documents</li>
  //                     <li style="margin-bottom: 8px; font-size: 15px;">Carry a valid ID proof</li>
  //                     <li style="margin-bottom: 8px; font-size: 15px;">Report to the HR Department on arrival</li>
  //                     <li style="margin-bottom: 8px; font-size: 15px;">
  // Dress in formal attire</li>
  //                 </ul>
  
  //                 <p>We are excited to have you on board and look forward to working with you.</p>
  //                 <p>If you face any issues, please contact us at <a href="mailto:${businessEmail}">${businessEmail}</a>.</p>
  
  //                 <div class="sign-off">
  //                     <p>Best Regards,</p>
  //                     <p class="highlight"> ${job.companyInfo}</p>
  //                 </div>
  //             </div>
  //                 <div class="banner">
  //                 <div class="banner-text">
  //                 <h4>WE ARE</h4>
  //                 <h2>GREAT PLACE TO WORK - CERTIFIED™</h2>
  //                 <p>Building and sustaining High-Performance Culture™</p>
  //             </div>
  //                     <div class="banner-text">
  //                     <img src="https://asset.techjose.com/Interview-app/Frame%202121458767.png" alt="Company Logo" width="150" height="40" style="display:block; border:0;" />
  //                     </div>
  //                 </div>
                  
  //                 <div class="disclaimer">
  //                 <p>You're receiving this email from <span class="highlight">Techjose Talentos</span> regarding your recent activity.</p>
  //                 <p>If you'd like to stay updated with future opportunities and notifications, please subscribe to our updates.</p>
  //                 <p>If you no longer wish to receive these emails, you can unsubscribe at any time.</p>
  //                 <p style="margin-top: 15px;">
  //                 <a href="#">Unsubscribe</a> | <a href="#">Privacy Policy</a> | <a href="#">Help Center</a>
  //             </p>
  //                 </div>
  //             </div>
  //         </div>
      
  //         <div class="bottom-footer">
  //             <div class="footer-content">
  //                 <div class="social-icons">
  //                     <a href="#" title="WhatsApp"><img src="https://asset.techjose.com/Interview-app/logos_whatsapp-icon.png" width="24" height="24" style="display:block; padding:5px; border:0;"/></a>
  //                     <a href="#" title="Instagram"><img src="https://asset.techjose.com/Interview-app/Group.png" width="24" height="24" style="display:block; padding:5px; border:0;"/></a>
  //                     <a href="#" title="LinkedIn"><img src="https://asset.techjose.com/Interview-app/Group%20(1).png" width="24" height="24" style="display:block;padding:5px; border:0;"/></a>
  //                     <a href="#" title="X"><img src="https://asset.techjose.com/Interview-app/Clip%20path%20group.png" width="24" height="24" style="display:block; padding:5px; border:0;"/></a>
  //                 </div>
  //                 <div class="copyright">
  //                 &copy;2025 Techjose. All Rights Reserved.
  //             </div>
  //             </div>
  //         </div>
  //     </body>
  //     </html>
  //     `,
  //   });
    return res.status(200).json({
      success: true,
      message: "Candidate hired successfully",
      data: {
        application: {
          applicationId: application._id,
          previousStatus,
          profileStatus: application.profileStatus,
          candidateRating: application.candidateRating,
          hiringDetails: application.hiringDetails,
        },
        candidate: {
          candidateId: candidate?._id || null,
          name: candidate?.name || "Unknown",
          email: candidate?.email || null,
        },
        job: {
          jobId: job._id,
          jobTitle: job.jobTitle,
          department: job.department,
          hiringManager: job.hiringManager,
        },
        email: `Offer letter sent via email to ${candidate?.email}`
      },
    });
  } catch (error) {
    console.error("Error hiring candidate:", error);
    return res.status(500).json({
      success: false,
      message: "Error hiring candidate",
    });
  }
};

export default postHired;
