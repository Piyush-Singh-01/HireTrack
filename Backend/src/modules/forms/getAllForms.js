import mongoose from "mongoose";
import Form from "./form.model.js";

const getAllForms = async (req, res) => {
  try {
    const companyCode = req.user.companyCode; // tenant isolation

    const { id, jobId } = req.query;

    /* --------------------------------
       SINGLE FORM (by id)
    -------------------------------- */
    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid formId",
        });
      }

      const form = await Form.findOne({
        _id: id,
        companyCode,
        isActive: true,
      }).populate("jobId", "jobTitle department");

      if (!form) {
        return res.status(404).json({
          success: false,
          message: "Form not found or not authorized",
        });
      }

      return res.status(200).json({
        success: true,
        data: form,
      });
    }

    /* --------------------------------
       MULTIPLE FORMS (list + filter)
    -------------------------------- */
    const query = {
      companyCode,
      isActive: true,
    };

    if (jobId) query.jobId = jobId;

    const forms = await Form.find(query)
      .populate("jobId", "jobTitle department")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: forms.length,
      data: forms,
    });
  } catch (error) {
    console.error("Forms Lookup Error:", error);

    return res.status(500).json({
      success: false,
      message: "Error fetching forms",
      error: error.message,
    });
  }
};

export default getAllForms;


