import mongoose from "mongoose";

/**
 * Field definition for dynamic application forms
 * Stable key: fieldId (NEVER change once live)
 */
const FormFieldSchema = new mongoose.Schema(
  {
    /* ---------------- CORE IDENTITY ---------------- */
    fieldId: {
      type: String,
      required: true,
      trim: true,
    },

    label: {
      type: String,
      required: true,
      trim: true,
    },

    /* ---------------- INPUT TYPE ---------------- */
    type: {
      type: String,
      required: true,
      enum: [
        "text",
        "email",
        "number",
        "select",
        "date",
        "file",
        "textarea",
        "checkbox",
        "radio",
        "shortAnswer",
      ],
    },

    /* ---------------- UI BEHAVIOR ---------------- */
    required: {
      type: Boolean,
      default: false,
    },

    options: {
      type: [String],
      default: [],
    },

    placeholder: {
      type: String,
      trim: true,
    },

    defaultValue: {
      type: mongoose.Schema.Types.Mixed,
    },

    /**
     * UI / UX metadata (frontend use only)
     */
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {
        hidden: false,
        rows: 3,

        /* ---------- SCREENING CONFIG ---------- */
        isScreening: false,        // is this a screening question?
        autoEvaluate: false,      // system evaluates answer
        score: 0,                 // marks for this question
        negativeScore: 0,         // optional
        correctAnswer: null       // string | number | object
      },
    },

    /**
     * Validation rules (runtime checked)
     * Examples:
     * { min: 2, max: 50 }
     * { regex: "^[0-9]{10}$" }
     * { allowedValues: ["A","B","C"] }
     */
    validation: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { _id: false }
);

/**
 * Complete Form Model
 * Links to Job and contains dynamic fields including screening questions
 */
const FormSchema = new mongoose.Schema(
  {
    /* ---------------- JOB LINKAGE ---------------- */
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },
    /* ---------------- TENANT AWARE ---------------- */
    companyCode: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },

    /* ---------------- FORM METADATA ---------------- */
    title: {
      type: String,
      required: true,
      trim: true,
      default: "Application Form",
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },
    moduleConfig: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    selectedModules: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },


    /* ---------------- DYNAMIC FIELDS ---------------- */
    fields: {
      type: [FormFieldSchema],
      required: true,
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: "Form must have at least one field",
      },
    },

    /* ---------------- STATUS & VERSION ---------------- */
    isActive: {
      type: Boolean,
      default: true,
    },

    version: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

/* ---------------- INDEXES ---------------- */

/* ---------------- VIRTUAL PROPERTIES ---------------- */
FormSchema.virtual("totalFields").get(function () {
  return this.fields.length;
});

FormSchema.virtual("screeningQuestionsCount").get(function () {
  return this.fields.filter((f) => f.meta?.isScreening === true).length;
});

FormSchema.virtual("maxScreeningScore").get(function () {
  return this.fields
    .filter((f) => f.meta?.isScreening === true)
    .reduce((sum, f) => sum + (Number(f.meta?.score) || 0), 0);
});

/* ---------------- ENABLE VIRTUALS IN JSON ---------------- */
FormSchema.set("toJSON", { virtuals: true });
FormSchema.set("toObject", { virtuals: true });

export default mongoose.model("Form", FormSchema);

