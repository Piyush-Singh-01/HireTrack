import mongoose from "mongoose";

const CandidateSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    companyCode: { 
      type: String, 
      required: true, 
      index: true, 
      trim: true
     },
    mobile: { type: String },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      index: true,
    },

  },
  { timestamps: true }
);


export default mongoose.model("Candidate", CandidateSchema);

