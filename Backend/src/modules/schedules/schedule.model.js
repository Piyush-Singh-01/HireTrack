import mongoose from "mongoose";

const candidateDetailsSchema = new mongoose.Schema(
  {
    // ---SINGLE CANDIDATE INTERVIEW -----
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: function () {
        return (!this.candidateIds || this.candidateIds.length === 0) &&(!this.candidates || this.candidates.length === 0);
      },
      validate: {
        validator: function () {
          return !(this.candidateIds && this.candidateIds.length > 0) && !(this.candidates && this.candidates.length > 0);
        },
        message: "candidateId cannot exist when candidateIds or candidates exist."
      }
    },

    Candidate: {
      type: String,
      required: function () {
        return (!this.candidateIds || this.candidateIds.length === 0) && (!this.candidates || this.candidates.length === 0);
      },
      validate: {
        validator: function () {
          return !(this.candidateIds && this.candidateIds.length > 0) && !(this.candidates && this.candidates.length > 0);
        },
        message: "Candidate cannot exist when candidateIds or candidates exist."
      }
    },

  //------GROUP INTERVIEW -----
    candidateIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: function () {
        return !this.candidateId && !this.Candidate && (!this.candidates || this.candidates.length === 0);
      },
      validate: {
        validator: function () {
          return !(this.candidateId) && !(this.Candidate);
        },
        message: "candidateIds cannot exist when candidateId or Candidate exist."
      }
    }],

    candidates: [{
      candidateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Application"
      },
      name: String,
      email: String
    }],
    
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true
    },

    Date: {
      type: Date,
      required: true
    },
    Time: {
      type: String,
      required: true
    },
    Position: {
      type: String,
      required: true
    },

    Recruiter: {
      type: String,
      required: true
    },
    Mode: {
      type: String,
      required: true,
      enum: ["Online", "Offline"]
    },
    Status: {
      type: String,
      required: true,
      enum: [
        "Start Interview",
        "Completed",
        "Upcoming",
        "Incomplete",
        "hired",
        "On Hold",
        "rejected"
      ]
    },
    Reschedule: {
      type: Boolean,
      required: true,
      default: false
    },
    companyCode: { 
      type: String, 
      required: true, 
      index: true, 
      trim: true 
    },
  },
  { timestamps: true }
);

const CandidateDetails = mongoose.model("CandidateDetail", candidateDetailsSchema);

export default CandidateDetails;

