import axios from "axios";

/**
 * Parses response text from AI to extract JSON safely.
 * Handles cases where response is wrapped in markdown code blocks.
 * 
 * @param {string} content - Raw AI output string.
 * @returns {object} Parsed JSON object.
 */
const parseJsonResponse = (content) => {
  let cleaned = content.trim();
  
  // Strip Markdown code blocks if present
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.substring(3);
  }
  
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  
  return JSON.parse(cleaned.trim());
};

/**
 * Call OpenRouter API with a prompt and model.
 * 
 * @param {string} prompt - The prompt text.
 * @param {string} model - The model identifier, defaults to 'google/gemini-2.5-flash'.
 * @returns {Promise<object>} Parsed JSON response.
 */
export const generateCompletion = async (prompt, model = "google/gemini-2.5-flash") => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY environment variable is not defined.");
  }

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        // Request JSON object format from OpenRouter API
        response_format: { type: "json_object" },
        max_tokens: 4000,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:5000",
          "X-Title": "Recruitment ATS System",
        },
        timeout: 60000, // 60s timeout for AI response
      }
    );

    const content = response.data?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("Empty response content from OpenRouter API.");
    }

    return parseJsonResponse(content);
  } catch (error) {
    if (error.response) {
      const details = JSON.stringify(error.response.data);
      throw new Error(`OpenRouter API failed with status ${error.response.status}: ${details}`);
    }
    throw error;
  }
};
