import React from "react";
import deletepopupImage from "../../../assets/userAndRole/deletepopupImage.png";
import { useDeleteDraft } from "../../../hooks/useDeleteDraft";
import Toast from "../../ui/Toast";
import { Check, Trash2, X } from "lucide-react";

function DeletePopup({ id, isOpen, setIsOpen }) {
  const { mutate: deleteDraft, isLoading } = useDeleteDraft();

  if (!isOpen) return null;

  const handleDelete = () => {
    deleteDraft(id, {
      onSuccess: () => {
        setIsOpen(false);
        Toast.success("Draft deleted successfully");
      },
      onError: (error) => {
        console.error(error);
        Toast.error(error?.response?.data?.message || "Failed to delete draft");
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm" />

      {/* Confirmation modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-draft-title"
        className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/70 bg-white shadow-[0_25px_80px_-20px_rgba(15,23,42,0.45)]"
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-indigo-600 via-violet-500 to-fuchsia-500" />

        <div className="flex flex-col items-center gap-6 px-6 py-8 sm:px-9 sm:py-9 sm:flex-row sm:gap-7">
          <div className="flex min-w-0 flex-1 flex-col items-center text-center sm:items-start sm:text-left">

            <span className="mb-2 inline-flex items-center rounded-full bg-rose-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-rose-600 ring-1 ring-rose-100">
              Delete confirmation
            </span>

            <h2
              id="delete-draft-title"
              className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl"
            >
              Are you sure you want to delete this draft?
            </h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              This action will permanently remove the selected draft. Please
              confirm that you want to continue.
            </p>

            <div className="mt-7 flex w-full flex-col-reverse gap-3 sm:w-auto sm:flex-row">
              <button
                type="button"
                className="inline-flex items-center justify-center cursor-pointer gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 shadow-sm transition duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-100"
                onClick={() => setIsOpen(false)}
              >
                <span>Cancel</span>
              </button>

              <button
                type="button"
                onClick={() => handleDelete(id)}
                className="inline-flex items-center justify-center cursor-pointer gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-600/20 transition duration-200 hover:-translate-y-0.5 hover:from-rose-700 hover:to-red-700 hover:shadow-xl hover:shadow-rose-600/25 focus:outline-none focus:ring-4 focus:ring-rose-200"
              >
                <span>{isLoading ? "Deleting..." : "Confirm delete"}</span>
              </button>
            </div>
          </div>

          <div className="hidden shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 p-3 ring-1 ring-rose-100 sm:flex">
            <img
              src={deletepopupImage}
              alt="Delete draft illustration"
              className="h-36 w-36 object-contain md:h-40 md:w-40"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeletePopup;
