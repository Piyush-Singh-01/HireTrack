import { X } from "lucide-react";

const SuccessModal = ({ isOpen, onClose, title, message, link }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">
            {title || "Success"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          <p className="text-gray-700 text-sm mb-3">
            {message || "Operation completed successfully."}
          </p>
          {link ? (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-gray-600">Application Link</p>
              <p className="text-sm break-all">{link}</p>
              <button
                type="button"
                className="border text-xs px-2 py-1 rounded-md border-blue text-blue hover:bg-blue hover:text-white w-fit"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(link);
                  } catch (err) {
                    console.error("Failed to copy link:", err);
                  }
                }}
              >
                Copy Link
              </button>
            </div>
          ) : (
            <p className="text-xs text-gray-500">
              Application link is not available yet.
            </p>
          )}
        </div>
        <div className="flex justify-end p-4 bg-gray-50 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-blue rounded-md hover:bg-blue/90 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
