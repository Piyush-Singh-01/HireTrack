import React, { useState } from "react";
import popupCancel from "../../assets/userAndRole/popupCancel.png";
import { useDisableAccountToggle } from "../../hooks/useUserAndRole";

function DeactivatePopUp({
  isOpen,
  onClose,
  selectedUserId,
  title,
  message,
  onConfirm,
  onCancel,
  isEnableMode,
}) {
  const { mutate: toggleStatus, isLoading } = useDisableAccountToggle();

  const handleConfirm = () => {
    if (!selectedUserId) return;

    toggleStatus(selectedUserId, {
      onSuccess: () => {
        onConfirm?.();
        onClose();
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3 sm:px-0">
      <div className="bg-white rounded-xl shadow-lg w-[70%] sm:w-[70%] md:max-w-sm p-4 sm:p-5 md:p-6">
        <h3 className="text-base sm:text-lg md:text-lg font-semibold text-center mb-1 sm:mb-2">
          {title}
        </h3>

        <p className="text-xs sm:text-sm md:text-base text-center text-gray-600 mb-4 sm:mb-5 md:mb-6">
          {message}
        </p>

        <div className="flex justify-center gap-3 sm:gap-4">
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`px-4 sm:px-5 md:px-6 py-1.5 sm:py-2 rounded-lg text-white text-xs sm:text-sm md:text-base font-medium transition cursor-pointer ${
              isEnableMode
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {isLoading ? "Processing..." : "Yes"}
          </button>

          <button
            onClick={onCancel}
            className="px-4 sm:px-5 md:px-6 py-1.5 sm:py-2 rounded-lg bg-gray-300 text-gray-800 text-xs sm:text-sm md:text-base font-medium hover:bg-gray-400 cursor-pointer"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeactivatePopUp;
