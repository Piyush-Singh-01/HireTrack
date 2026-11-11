import React from "react";
import popupCancel from "../../../assets/userAndRole/popupCancel.png";
import { IoClose } from "react-icons/io5";

function SaveDraftPopUp({ isOpen, onSave, onDiscard, isSaving, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1"
          aria-label="Close"
        >
          <IoClose className="text-2xl" />
        </button>

        <div className="p-6 text-center">
          <div className="flex justify-center mb-4 text-amber-500">
             <img src={popupCancel} alt="Alert" className="w-16 h-16" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Unsaved Changes
          </h2>
          <p className="text-gray-600 mb-8">
            Do you want to save your progress as a draft before leaving?
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onDiscard}
              disabled={isSaving}
              className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition disabled:opacity-50 cursor-pointer"
            >
              No, Discard
            </button>
            <button
              onClick={onSave}
              disabled={isSaving}
              className="px-6 py-2 rounded-lg bg-blue text-white font-medium hover:bg-blue-700 transition disabled:opacity-50 shadow-md cursor-pointer"
            >
              {isSaving ? "Saving..." : "Yes, Save Draft"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SaveDraftPopUp;

