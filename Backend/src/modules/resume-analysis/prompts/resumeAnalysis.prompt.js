import { RECOMMENDATION } from "../constants/resumeAnalysis.constants.js";

/**
 * Builds the prompt string for the LLM model to analyze a resume against a job description.
 * 
 * @param {string} resumeText - The parsed plain text of the candidate's resume.
 * @param {string} jobDescription - The formatted job description text.
 * @returns {string} The constructed prompt string.
 */
export const getResumeAnalysisPrompt = (resumeText, jobDescription) => {
  const validRecommendations = Object.values(RECOMMENDATION).join(", ");

  return `You are a professional recruiting assistant and resume parser. Your task is to analyze the candidate's resume text against the provided job description and evaluate how well they match.

Job Description:
"""
${jobDescription}
"""

Candidate Resume Text:
"""
${resumeText}
"""

You must respond with a single, strictly valid JSON object matching the following structure.
Do NOT wrap the response in markdown blocks (such as \`\`\`json), and do NOT provide any explanations, notes, preamble, or postamble. Output only raw JSON.

Required JSON Schema:
{
  "score": {
    "overall": 0,
    "technical": 0,
    "experience": 0,
    "education": 0,
    "projects": 0
  },
  "recommendation": "REVIEW",
  "summary": "A concise summary of why the candidate is a match or not.",
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": ["skill3", "skill4"],
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"]
}

Constraints:
1. All score values (overall, technical, experience, education, projects) must be integers between 0 and 100 representing the match percentage.
2. The recommendation field must be exactly one of the following string values: ${validRecommendations}.
3. The summary field must be a clear, professional summary of the candidate's match (maximum 2000 characters).
4. All skills and strengths/weaknesses must be arrays of strings.`;
};
