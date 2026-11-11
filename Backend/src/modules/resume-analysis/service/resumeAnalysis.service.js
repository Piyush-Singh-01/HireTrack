import Application from "../../applications/applicantSchema.js";
import Job from "../../jobs/job.model.js";
import ResumeAnalysis from "../models/resumeAnalysis.model.js";
import { ANALYSIS_STATUS } from "../constants/resumeAnalysis.constants.js";
import { downloadResume, extractResumeUrl } from "../helpers/resumeDownloader.js";
import { extractTextFromPdf } from "../utils/pdfExtractor.js";
import { buildJobDescription } from "../helpers/jobDescriptionBuilder.js";
import { getResumeAnalysisPrompt } from "../prompts/resumeAnalysis.prompt.js";
import { generateCompletion } from "../providers/openRouter.provider.js";
import { validateAiResponse } from "../validators/aiResponse.validator.js";

class ResumeAnalysisService {
  /**
   * Run the ATS resume analysis for a given application.
   * 
   * @param {object} params - The parameter object.
   * @param {string} params.applicationId - The Mongoose ObjectId of the Application.
   * @param {object} params.user - The request user object containing tenant context.
   * @returns {Promise<object>} The completed ResumeAnalysis document.
   */
  async analyzeResume({ applicationId, user }) {
    let analysis = null;

    try {
      // 1. Find Application
      const application = await Application.findById(applicationId);

      // 2. Validate Application
      if (!application) {
        throw new Error("Application not found.");
      }

      // 3. Find Job
      const job = await Job.findById(application.jobId);

      // 4. Validate Job
      if (!job) {
        throw new Error("Job not found.");
      }

      // 5. Find existing ResumeAnalysis
      analysis = await ResumeAnalysis.findOne({ applicationId });

      // 6. Create ResumeAnalysis if it does not exist
      if (!analysis) {
        analysis = new ResumeAnalysis({
          applicationId,
          jobId: application.jobId,
          candidateId: application.candidateId,
          companyCode: application.companyCode,
          analysisStatus: ANALYSIS_STATUS.PENDING,
        });
      }

      // 7. Update analysisStatus = PROCESSING
      analysis.analysisStatus = ANALYSIS_STATUS.PROCESSING;
      analysis.errorMessage = "";
      await analysis.save();

      // 8. Download resume PDF from Cloudinary URL
      const resumeUrl = extractResumeUrl(application.answers);
      if (!resumeUrl) {
        throw new Error("No resume PDF URL found in candidate answers.");
      }

      const pdfBuffer = await downloadResume(resumeUrl);

      // 9. Extract text from PDF
      const resumeText = await extractTextFromPdf(pdfBuffer);

      // 10. Build a complete Job Description string using all relevant Job fields
      const jobDescription = buildJobDescription(job);

      // 11. Generate the AI prompt
      const prompt = getResumeAnalysisPrompt(resumeText, jobDescription);

      // 12. Call OpenRouter
      // 13. Parse AI JSON (handled inside provider generateCompletion)
      const aiResponse = await generateCompletion(prompt);

      // 14. Validate AI JSON
      validateAiResponse(aiResponse);

      // 15. Update ResumeAnalysis document
      analysis.score = aiResponse.score;
      analysis.recommendation = aiResponse.recommendation;
      analysis.summary = aiResponse.summary;
      analysis.matchedSkills = aiResponse.matchedSkills;
      analysis.missingSkills = aiResponse.missingSkills;
      analysis.strengths = aiResponse.strengths;
      analysis.weaknesses = aiResponse.weaknesses;
      analysis.aiProvider = "OpenRouter";
      analysis.aiModel = "google/gemini-2.5-flash";
      analysis.analyzedAt = new Date();

      // 16. Save and 17. Update analysisStatus = COMPLETED
      analysis.analysisStatus = ANALYSIS_STATUS.COMPLETED;
      await analysis.save();

      // 18. Return analysis
      return analysis;
    } catch (error) {
      console.error(`Error in ResumeAnalysisService for applicationId ${applicationId}:`, error);

      if (analysis) {
        analysis.analysisStatus = ANALYSIS_STATUS.FAILED;
        let errMsg = error.message || String(error);
        if (errMsg.length > 950) {
          errMsg = errMsg.substring(0, 950) + "...";
        }
        analysis.errorMessage = errMsg;
        await analysis.save();
      }

      throw error;
    }
  }

  /**
   * Retrieves an existing resume analysis for a given application ID.
   * 
   * @param {string} applicationId - The Application ID.
   * @returns {Promise<object|null>} The ResumeAnalysis document, if found.
   */
  async getResumeAnalysis(applicationId) {
    return await ResumeAnalysis.findOne({ applicationId });
  }
}

export default new ResumeAnalysisService();