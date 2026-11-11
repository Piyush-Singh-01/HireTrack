import mongoose from "mongoose";

const offerLetterTemplateSchema = new mongoose.Schema(
  {
    companyCode: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    jobId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    companyName: { type: String, trim: true },
    companyAddress: { type: String, trim: true },
    logo: { type: String }, // Base64 or URL
    selectedTemplate: { type: String, default: "default", enum: ["default", "customize1", "customize2"] },
    selectedColor: { type: String, default: "blue", enum: ["blue", "darkblue", "lightgreen", "pink", "purple"] },
    salutation: { type: String, default: "Dear" },
    candidateName: { type: String, trim: true },
    introParagraph: { type: String },
    date: { type: String },
    position: { type: String },
    duration: { type: String },
    startDate: { type: String },
    endDate: { type: String },
    noticePeriod: { type: String },
    location: { type: String },
    stipend: { type: String },
    responsibilities: { type: String },
    notice: { type: String },
    closingNote: { type: String },
    signature: { type: String },
    website: { type: String },
    agreement: { type: String }, // Base64 PDF
  },
  { timestamps: true, strict: false }
);

offerLetterTemplateSchema.index({ companyCode: 1, jobId: 1 }, { unique: true });

const OfferLetterTemplate = mongoose.model("OfferLetterTemplate", offerLetterTemplateSchema);
export default OfferLetterTemplate;

