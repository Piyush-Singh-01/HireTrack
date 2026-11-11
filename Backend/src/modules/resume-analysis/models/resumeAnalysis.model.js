import mongoose from "mongoose";
import { RECOMMENDATION, ANALYSIS_STATUS } from "../constants/resumeAnalysis.constants.js";

const ResumeScoreSchema = new mongoose.Schema({
    overall: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    technical: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    experience: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
    },

    education: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
    },

    projects: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
    },
},
    {
        _id: false,
    }
)

const ResumeAnalysisSchema = new mongoose.Schema({
    // ==============================
    // Identity Information
    // ==============================
    applicationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Application",
        required: true,
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
        required: true,
    },
    candidateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Candidate",
        required: true,
    },
    companyCode: {
        type: String,
        required: true,
        trim: true,
    },
    // ==============================
    // AI Analysis Result
    // ==============================
    score: {
        type: ResumeScoreSchema,
        default: () => ({})
    },
    recommendation: {
        type: String,
        enum: Object.values(RECOMMENDATION),
        default: RECOMMENDATION.REVIEW,
    },
    summary: {
        type: String,
        trim: true,
        maxlength: 2000,
        default: "",
    },
    matchedSkills: {
        type: [String],
        default: [],
    },
    missingSkills: {
        type: [String],
        default: [],
    },
    strengths: {
        type: [String],
        default: [],
    },
    weaknesses: {
        type: [String],
        default: [],
    },
    analysisStatus: {
        type: String,
        enum: Object.values(ANALYSIS_STATUS),
        default: ANALYSIS_STATUS.PENDING,
    },
    aiProvider: {
        type: String,
        trim: true,
        default: "",
    },
    aiModel: {
        type: String,
        trim: true,
        default: "",
    },
    errorMessage: {
        type: String,
        maxlength: 1000,
        trim: true,
        default: "",
    },
    analyzedAt: {
        type: Date,
        default: null,
    },
},
    { timestamps: true }
);

export default mongoose.model("ResumeAnalysis", ResumeAnalysisSchema);