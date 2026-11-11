import mongoose from "mongoose";
import Form from "./form.model.js";

const deleteForm = async (req, res) => {
  try {
    const { id } = req.params;
    const companyCode = req.user.companyCode; // tenant isolation

    // -------------------------
    // Validate ObjectId
    // -------------------------
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid formId",
      });
    }

    // -------------------------
    // Soft-delete (deactivate) with tenant check
    // -------------------------
    const deletedForm = await Form.findOneAndUpdate(
      { _id: id, companyCode },
      { isActive: false },
      { new: true }
    );

    if (!deletedForm) {
      return res.status(404).json({
        success: false,
        message: "Form not found or not authorized",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Form deactivated successfully",
      data: deletedForm,
    });
  } catch (error) {
    console.error("Delete Form Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error deactivating form",
      error: error.message,
    });
  }
};

export default deleteForm;
