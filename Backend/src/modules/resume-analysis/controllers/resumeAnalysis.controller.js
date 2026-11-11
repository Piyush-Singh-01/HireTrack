import ResumeAnalysisService from "../service/resumeAnalysis.service.js";
import mongoose from "mongoose";

export const analyzeResume = async (req, res) => {
    try {
        const { applicationId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(applicationId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Application ID",
            });
        }

        const result = await ResumeAnalysisService.analyzeResume({
            applicationId,
            user: req.user,
        });

        return res.status(200).json({
            success: true,
            message: "Resume analyzed successfully.",
            data: result,
        });
    }
    catch (err) {
        console.error("Analyze Resume Controller Error:", err);

        return res.status(500).json({
            success: false,
            message: err.message || "Failed to analyze resume.",
        });
    }
};

export const getResumeAnalysis = async (req, res) => {
    try {
        const { applicationId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(applicationId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Application ID",
            });
        }

        const result = await ResumeAnalysisService.getResumeAnalysis(applicationId);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Resume analysis not found for this application.",
            });
        }

        return res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (err) {
        console.error("Get Resume Analysis Controller Error:", err);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve resume analysis.",
        });
    }
};