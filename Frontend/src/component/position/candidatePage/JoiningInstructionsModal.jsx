import React, { useState, useEffect } from "react";
import { X, Save, ClipboardList } from "lucide-react";
import axiosInstance from "../../../utils/AxiosInstance";
import ApiRoutes from "../../../utils/ApiRoutes";

const JoiningInstructionsModal = ({ isOpen, onClose, jobId, isDraft, initialInstructions, onSaveSuccess }) => {
  const [instructions, setInstructions] = useState(initialInstructions || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(!initialInstructions);

  useEffect(() => {
    setInstructions(initialInstructions || "");
    setIsEditing(!initialInstructions);
  }, [initialInstructions, isOpen]);

  if (!isOpen) return null;

  const handleTextChange = (e) => {
    if (!isEditing) return;
    let value = e.target.value;
    
    // When ". " is typed, format the current line with a bullet and start a new bulleted line
    if (value.length > instructions.length && value.endsWith(". ")) {
      const lines = value.split("\n");
      const lastLineIndex = lines.length - 1;
      let lastLine = lines[lastLineIndex];
      
      // Process the current line: remove trailing space, add bullet if missing
      let content = lastLine.slice(0, -1).trim();
      if (content && !content.startsWith("•")) {
        lines[lastLineIndex] = "• " + content;
      } else {
        lines[lastLineIndex] = content;
      }
      
      // Join and add a newline with a new bullet point
      value = lines.join("\n") + "\n• ";
    }
    
    setInstructions(value);
  };

  const handleSave = async () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    setIsSaving(true);
    try {
      // Use correct endpoint based on draft status
      const url = isDraft 
        ? ApiRoutes.POSITION.UPDATEDRAFT(jobId) 
        : ApiRoutes.POSITION.UPDATEJOB(jobId);

      const response = await axiosInstance.put(url, {
        joiningInstructions: instructions,
      });

      if (response.data.success) {
        onSaveSuccess(instructions);
        setIsEditing(false);
        // onClose(); // Keep it open so user can see it's saved and in view mode
      }
    } catch (error) {
      console.error("Error saving joining instructions:", error);
      const errorMessage = error.response?.data?.message || "Failed to save instructions. Please try again.";
      alert(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all scale-100 animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <ClipboardList size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-800">
              Onboarding Details
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-sm text-gray-500 mb-4">
            Type your instructions below. These instructions will be included when sending the offer letter.
          </p>
          <textarea
            value={instructions}
            onChange={handleTextChange}
            readOnly={!isEditing}
            placeholder={`Instructions :\n• Please report at 9:00 AM at the main reception.\n• Carry original documents (ID proof, Degree certificates) for verification.\n• Dress code: Business Professional.\n• Contact person: Sarah (HR) - 9876543210.`}
            className={`w-full h-64 p-4 text-gray-700 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-all ${!isEditing ? 'bg-white' : 'bg-gray-50'}`}
          />
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-4 p-5 bg-gray-50 border-t">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-6 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-all cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-8 py-2.5 text-sm font-semibold text-white bg-blue rounded-lg hover:bg-blue-700 active:bg-blue-800 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              isEditing ? <Save size={18} /> : <ClipboardList size={18} />
            )}
            <span>{isSaving ? "Saving..." : (isEditing ? "Save Instructions" : "Edit Instructions")}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoiningInstructionsModal;
