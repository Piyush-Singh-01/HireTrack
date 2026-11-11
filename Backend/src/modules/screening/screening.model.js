import mongoose from "mongoose";
// Import Application to ensure it's registered
import Application from "../applications/applicantSchema.js";

// Schema for individual screening question
const screeningQuestionSchema = new mongoose.Schema(
  {
    fieldId: { type: String, required: true, trim: true },
    module: { type: String, default: "screening", trim: true },
    question: { type: String, required: true, trim: true },
    type: {
      type: String,
      required: true,
      enum: ["text", "textarea", "radio", "choice", "checkbox", "multipleChoice", "select", "file", "shortAnswer"],
    },
    choices: [{ type: String, trim: true }],
    required: { type: Boolean, default: false },
    correctAnswer: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { _id: false }
);

const screeningSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", index: true },
  screen: [screeningQuestionSchema],
  
  // Scoring thresholds for candidate rating
  ratingThresholds: {
    goodFit: { type: Number, default: 80 },    // >= 80% = "Good fit"
    maybe: { type: Number, default: 60 },      // 60-79% = "Maybe"
    notFit: { type: Number, default: 0 }       // < 60% = "Not a fit"
  },
  companyCode: { 
    type: String, 
    required: true, 
    index: true, 
    trim: true 
  },
  
}, { timestamps: true });

screeningSchema.virtual("noOfQuestions").get(function () {
  return this.screen.length;
});

// Method to validate answers and determine candidate rating
screeningSchema.methods.validateAnswersAndRate = function (userAnswers) {
  const results = [];
  let scoreCount = 0;   // float – supports 0.5 increments for partial credit
  let scoredCount = 0;  // total questions that have a correctAnswer defined
  
  this.screen.forEach((question, index) => {
    const userAnswer =
      userAnswers?.[question.fieldId] ?? userAnswers?.[index];
    let isCorrect = null;
    let questionScore = 0;

    if (
      question.correctAnswer !== null &&
      question.correctAnswer !== undefined &&
      question.correctAnswer !== ""
    ) {
      scoredCount += 1;

      if (question.type === "checkbox" || question.type === "multipleChoice") {
        // --- PARTIAL SCORING for multiple-choice ---
        const expected = Array.isArray(question.correctAnswer)
          ? question.correctAnswer
          : [question.correctAnswer];
        const actual = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
        const expectedSet = expected.map(String);
        const correctChoices = actual.filter((a) =>
          expectedSet.includes(String(a))
        );

        if (
          correctChoices.length === expected.length &&
          actual.length === expected.length
        ) {
          // Full mark: all correct choices selected, no extras
          questionScore = 1.0;
          isCorrect = "full";
        } else if (correctChoices.length > 0) {
          // Half mark: at least one correct choice selected
          questionScore = 0.5;
          isCorrect = "partial";
        } else {
          // Zero: nothing correct
          questionScore = 0;
          isCorrect = false;
        }
      } else if (question.type === "shortAnswer") {

          const answerText = String(userAnswer ?? "").toLowerCase().trim();
        
          const keywords = Array.isArray(question.correctAnswer)
            ? question.correctAnswer
            : [question.correctAnswer];
        
          const matchCount = keywords.filter((key) =>
            answerText.includes(String(key).toLowerCase())
          ).length;
        
          // require at least 1 keyword match
          isCorrect = matchCount > 0;
          questionScore = isCorrect ? 1.0 : 0;
      } else {
          // Single choice / radio / other text types
          const expectedAnswers = Array.isArray(question.correctAnswer)
            ? question.correctAnswer
            : [question.correctAnswer];
        
          isCorrect = expectedAnswers.some(
            (ans) =>
              String(ans).trim().toLowerCase() ===
              String(userAnswer ?? "").trim().toLowerCase()
          );
          questionScore = isCorrect ? 1.0 : 0;
      }
  
      scoreCount += questionScore;
    }
    
    results.push({
      questionIndex: index,
      question: question.question,
      userAnswer: userAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect: isCorrect,
      questionScore: questionScore
    });
  });
  
  const percentage = scoredCount > 0 ? (scoreCount / scoredCount) * 100 : 0;
  
  // Determine candidate rating based on percentage
  // 100%  = "Good fit"  (all questions fully correct)
  // > 0%  = "Maybe"     (at least one correct/partial answer)
  // 0%    = "Not a fit"  (nothing correct → auto-reject)
  let candidateRating;
  if (scoredCount === 0) {
    candidateRating = "pending";
  } else if (percentage === 100) {
    candidateRating = "Good fit";
  } else if (percentage > 0) {
    candidateRating = "Maybe";
  } else {
    candidateRating = "Not a fit";
  }
  
  return {
    totalQuestions: this.screen.length,
    scoredQuestions: scoredCount,
    totalScore: parseFloat(scoreCount.toFixed(1)),
    maxScore: scoredCount,
    percentage: parseFloat(percentage.toFixed(2)),
    candidateRating: candidateRating,
    correctAnswers: Math.floor(scoreCount),  // backward compat
    results: results
  };
};

// Method to update candidate rating in Application schema
screeningSchema.methods.updateCandidateRating = async function(applicantId, userAnswers) {
  const Application = mongoose.model('Application');
  
  const testResult = this.validateAnswersAndRate(userAnswers);
  
  try {
    const updatedApplicant = await Application.findByIdAndUpdate(
      applicantId,
      { 
        candidateRating: testResult.candidateRating,
        screeningTestScore: testResult.percentage
      },
      { new: true }
    );
    
    return {
      ...testResult,
      applicantUpdated: !!updatedApplicant,
      applicantId: applicantId
    };
  } catch (error) {
    throw new Error(`Failed to update candidate rating: ${error.message}`);
  }
};

// Method to get questions without correct answers (for candidate view)
screeningSchema.methods.getQuestionsForCandidate = function () {
  return this.screen.map((question, index) => ({
    questionIndex: index,
    fieldId: question.fieldId,
    module: question.module,
    type: question.type,
    question: question.question,
    choices: question.choices,
    required: question.required,
  }));
};

screeningSchema.set("toJSON", { virtuals: true });
screeningSchema.set("toObject", { virtuals: true });

export default mongoose.model("Screening", screeningSchema);
