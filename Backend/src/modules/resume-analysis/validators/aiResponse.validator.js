import { RECOMMENDATION } from "../constants/resumeAnalysis.constants.js";

/**
 * Validates the AI response structure and limits.
 * Throws descriptive errors if validation fails.
 * 
 * @param {object} data - Parsed JSON object from the AI completion.
 * @returns {boolean} True if validation passes.
 */
export const validateAiResponse = (data) => {
  if (!data || typeof data !== "object") {
    throw new Error("AI response must be a valid JSON object.");
  }

  // Validate Score
  if (!data.score || typeof data.score !== "object") {
    throw new Error("AI response is missing a 'score' object.");
  }

  const scoreKeys = ["overall", "technical", "experience", "education", "projects"];
  for (const key of scoreKeys) {
    const value = data.score[key];
    if (value === undefined || value === null) {
      throw new Error(`Score field '${key}' is required.`);
    }
    if (typeof value !== "number" || isNaN(value) || value < 0 || value > 100) {
      throw new Error(
        `Score field '${key}' must be a number between 0 and 100. Received: ${value}`
      );
    }
  }

  // Validate Recommendation
  const validRecommendations = Object.values(RECOMMENDATION);
  if (
    !data.recommendation ||
    typeof data.recommendation !== "string" ||
    !validRecommendations.includes(data.recommendation)
  ) {
    throw new Error(
      `Recommendation must be one of the following: [${validRecommendations.join(
        ", "
      )}]. Received: '${data.recommendation}'`
    );
  }

  // Validate Summary
  if (data.summary === undefined || data.summary === null) {
    throw new Error("Summary string is required.");
  }
  if (typeof data.summary !== "string") {
    throw new Error(`Summary must be a string. Received type: ${typeof data.summary}`);
  }
  if (data.summary.trim() === "") {
    throw new Error("Summary must not be an empty string.");
  }

  // Validate Arrays
  const arrayFields = [
    { name: "matchedSkills", value: data.matchedSkills },
    { name: "missingSkills", value: data.missingSkills },
    { name: "strengths", value: data.strengths },
    { name: "weaknesses", value: data.weaknesses },
  ];

  for (const field of arrayFields) {
    if (field.value === undefined || field.value === null) {
      throw new Error(`Array field '${field.name}' is required.`);
    }
    if (!Array.isArray(field.value)) {
      throw new Error(`Field '${field.name}' must be an array.`);
    }
    for (let i = 0; i < field.value.length; i++) {
      if (typeof field.value[i] !== "string") {
        throw new Error(
          `All items in '${field.name}' must be strings. Item at index ${i} is: ${typeof field.value[i]}`
        );
      }
    }
  }

  return true;
};
