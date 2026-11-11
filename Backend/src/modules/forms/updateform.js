import mongoose from "mongoose";
import Form from "./form.model.js";

const updateForm = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    const companyCode = req.user.companyCode; // tenant isolation

    // -------------------------
    // Validate formId
    // -------------------------
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid formId",
      });
    }

    // Prevent sensitive fields from being updated
    delete updateData._id;
    delete updateData.jobId;
    delete updateData.companyCode;

    // -------------------------
    // Find & update form
    // -------------------------
    const updatedForm = await Form.findOneAndUpdate(
      { _id: id, companyCode },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedForm) {
      return res.status(404).json({
        success: false,
        message: "Form not found or you are not authorized to update it",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Form updated successfully",
      data: updatedForm,
    });
  } catch (error) {
    console.error("Update Form Error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: `Validation failed: ${Object.keys(error.errors).join(", ")}`,
      });
    }
    return res.status(500).json({
      success: false,
      message: "Error updating form",
      error: error.message,
    });
  }
};

export default updateForm;
