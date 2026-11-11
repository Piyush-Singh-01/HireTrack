import mongoose from "mongoose";
import slugify from "slugify";

const jobSchema = new mongoose.Schema(
  {
  meet:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"InterviewSchedule"
  },
    // DRAFT STATUS
    isDraft: { type: Boolean, default: false },
    draftSavedAt: { type: Date, default: null },
    publishedAt: { type: Date, default: null },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // required: true
    },


    // BASIC JOB DETAILS
    jobTitle: { type: String, required: function () { return !this.isDraft; } },
    jobRole: { type: String, required: function () { return !this.isDraft; } },
    department: { type: String, required: function () { return !this.isDraft; } },
    jobLocation: { type: String, required: function () { return !this.isDraft; } },
    jobType: { type: String, required: function () { return !this.isDraft; } },
    experience: { type: String },
    hiringManager: { 
      name : { type: String, required: function () { return !this.isDraft && (!this.hiringManagers || this.hiringManagers.length === 0); } },
      userId : { 
        type: mongoose.Schema.Types.ObjectId,
        refPath: "hiringManager.onModel", 
        required: function () { return !this.isDraft && (!this.hiringManagers || this.hiringManagers.length === 0); } 
      },
      onModel: {
        type: String,
        required: function () { return !this.isDraft && (!this.hiringManagers || this.hiringManagers.length === 0); },
        enum: ["User", "UserAndRole"],
        default: "UserAndRole"
      }
    },
    hiringManagers: [{ 
      name : { type: String, required: function () { return !this.isDraft; } },
      userId : { 
        type: mongoose.Schema.Types.ObjectId,
        refPath: "hiringManagers.onModel", 
        required: function () { return !this.isDraft; } 
      },
      onModel: {
        type: String,
        required: function () { return !this.isDraft; },
        enum: ["User", "UserAndRole"],
        default: "UserAndRole"
      }
    }],

    numberOfOpenings: { type: Number, min: 1, required: function () { return !this.isDraft; } },
    jobCode: { 
      type: String, 
      required: function () { return !this.isDraft; },
      trim: true
    },
    jobStatus: {
      type: String,
      enum: ["Open", "Closed"],
      default: "Open",
      required: function () { return !this.isDraft; },
    },
    closingDate: { type: Date, required: function () { return !this.isDraft; } },
    postedOn: { type: Date, default: Date.now },
    applicantsCount: { type: Number, default: 0 },

    // JOB DESCRIPTION
    about: { type: String, required: function () { return !this.isDraft; } },
    responsibilities: { type: String, required: function () { return !this.isDraft; } },
    requirements: { type: String, required: function () { return !this.isDraft; } },
    preferredQualifications: { type: String, required: function () { return !this.isDraft; } },
    lookingFor: { type: String, required: function () { return !this.isDraft; } },

    // ADDITIONAL INFO
    companyInfo: { type: String },
    applicationLink: { type: String }, // /apply/<slug>
    applicationSlug: { type: String },
    posterVisuals: [
      {
        fileName: String,
        fileUrl: String,
        fileType: String,
      },
    ],
    companyCode: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },

    // 🔥 NEW: Dynamic Application Form
    formId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Form",
      default: null,
    },

    // Screening Question Set
    screeningId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Screening",
      default: null,
    },
    joiningInstructions: { type: String },
  },
  { timestamps: true }
);
// Compound indexes
// jobSchema.pre("save", function (next) {
jobSchema.pre("save", function (options) {
  // Generate slug if applicationSlug is missing OR if we want to ensure it's always in the correct format
  // For now, we'll focus on ensuring it's generated when missing or when we want to enforce the format.
  // The user specifically mentioned Drafts (saveDraft, updateDraft, publishDraft) were missing companyCode.
  
  const needsSlug = !this.applicationSlug || !this.applicationSlug.endsWith(`-${this.companyCode?.toLowerCase()}`);

  if (needsSlug && !this.isDraft) {
    // If it's not a draft, we MUST have a slug.
    // If it is a draft, we only generate if we have a formId (to avoid broken links)
  }

  // Logic: Generate slug if (missing OR wrong format) AND (not draft OR has formId)
  if (needsSlug && (!this.isDraft || this.formId)) {
    if (!this.companyCode) {
      //return next(new Error("companyCode is required for slug generation"));
        throw new Error("companyCode is required for slug generation");
    }

    const base = slugify(this.jobTitle || this.jobRole || "job", {
      lower: true,
      strict: true,
    });

    this.applicationSlug = `${base}-${this._id
      .toString()
      .slice(-6)}-${this.companyCode.toLowerCase()}`;

    this.applicationLink = `/apply/${this.applicationSlug}`;
  } else if (this.applicationSlug && (!this.applicationLink || !this.applicationLink.includes(this.applicationSlug))) {
    this.applicationLink = `/apply/${this.applicationSlug}`;
  }

  // next();
});

jobSchema.index(
  { companyCode: 1, applicationSlug: 1 },
  {
    unique: true,
    partialFilterExpression: {
      applicationSlug: { $type: "string" }
    }
  }
);
const Job = mongoose.model("Job", jobSchema);
export default Job;
