import React from "react";
import { AlertTriangle, Check, X, Trash2 } from "lucide-react";
import deletepopupImage from "../../assets/userAndRole/deletepopupImage.png";

function DeletePopup({ isOpen, onConfirm, onCancel, isLoading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm">
      <div
        className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/70 bg-white shadow-[0_24px_80px_-20px_rgba(15,23,42,0.45)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-popup-title"
        aria-describedby="delete-popup-description"
      >
        {/* Decorative top accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 via-red-500 to-orange-400" />

        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          aria-label="Close delete confirmation"
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition duration-200 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X size={18} strokeWidth={2.2} />
        </button>

        <div className="grid grid-cols-1 items-center gap-5 p-6 sm:grid-cols-[1fr_auto] sm:gap-6 sm:p-8">
          <div className="min-w-0">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-rose-600">
              Delete confirmation
            </p>
            <h2
              id="delete-popup-title"
              className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl"
            >
              Are you sure you want to delete this data?
            </h2>
            <p
              id="delete-popup-description"
              className="mt-2 max-w-md text-sm leading-6 text-slate-500"
            >
              This action may be permanent. Please confirm that you want to continue.
            </p>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="inline-flex min-h-11 items-center justify-center cursor-pointer gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={onConfirm}
                disabled={isLoading}
                className="inline-flex min-h-11 items-center justify-center cursor-pointer gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-600/20 transition duration-200 hover:-translate-y-0.5 hover:from-rose-700 hover:to-red-700 hover:shadow-xl hover:shadow-rose-600/25 focus:outline-none focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {isLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Deleting...
                  </>
                ) : (
                  <>
                    Confirm delete
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="hidden sm:flex sm:items-center sm:justify-center">
            <div className="flex h-36 w-36 items-center justify-center rounded-full bg-gradient-to-br from-rose-50 to-orange-50 ring-1 ring-inset ring-rose-100/80">
              <img
                src={deletepopupImage}
                alt=""
                aria-hidden="true"
                className="h-28 w-28 object-contain drop-shadow-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeletePopup;
