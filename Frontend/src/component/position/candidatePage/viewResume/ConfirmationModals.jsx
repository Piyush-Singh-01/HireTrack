import React from "react";
import { HiOutlineCheckCircle } from "react-icons/hi";
import Confirm from "../../../../assets/viewTask/confirmmail.png";
import { ModalShell, IconCircle, CheckIcon, XIcon, WarningIcon } from "./shared";

/**
 * ConfirmationModals
 * Shortlist and Reject confirmation modals rendered conditionally.
 */
const ConfirmationModals = ({
  shortlist,
  onToggleShortlist,
  onShortlistConfirm,
  isShortlisting,
  showRejectModal,
  onToggleRejectModal,
  onConfirmReject,
  isRejecting,
}) => (
  <>
    {/* Shortlist Confirmation Modal */}
    {shortlist && (
      <ModalShell width="max-w-xl">
        <div className="flex-1 p-8">
          <div className="flex items-start gap-4">
            <IconCircle tone="bg-gradient-to-br from-emerald-500 to-teal-500">
              <CheckIcon />
            </IconCircle>
            <div>
              <p className="text-lg font-bold text-slate-900">Shortlist candidate?</p>
              <p className="mt-1 text-sm text-slate-600">
                Are you sure you want to shortlist this candidate?
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => onToggleShortlist(false)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-rose-300 bg-white px-4 py-2 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-600 hover:text-white"
            >
              <XIcon /> Cancel
            </button>
            <button
              type="button"
              disabled={isShortlisting}
              onClick={onShortlistConfirm}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold shadow-md transition-all ${
                isShortlisting
                  ? "cursor-not-allowed bg-slate-100 text-slate-400"
                  : "cursor-pointer bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:opacity-90"
              }`}
            >
              {isShortlisting ? "Shortlisting..." : "Confirm"} <HiOutlineCheckCircle />
            </button>
          </div>
        </div>
        <div className="hidden w-[35%] items-center justify-center bg-slate-50 p-4 sm:flex">
          <img src={Confirm} alt="Confirm" className="h-auto w-full object-contain" />
        </div>
      </ModalShell>
    )}

    {/* Reject Confirmation Modal */}
    {showRejectModal && (
      <ModalShell width="max-w-xl">
        <div className="flex-1 p-8">
          <div className="flex items-start gap-4">
            <IconCircle tone="bg-gradient-to-br from-rose-500 to-red-600">
              <WarningIcon />
            </IconCircle>
            <div>
              <p className="text-lg font-bold text-slate-900">Reject candidate?</p>
              <p className="mt-1 text-sm text-slate-600">
                Are you sure you want to Reject this candidate?
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => onToggleRejectModal(false)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
            >
              <XIcon /> Cancel
            </button>
            <button
              type="button"
              disabled={isRejecting}
              onClick={onConfirmReject}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:opacity-90 disabled:opacity-60"
            >
              {isRejecting ? "Rejecting..." : "Confirm"} <HiOutlineCheckCircle />
            </button>
          </div>
        </div>
        <div className="hidden w-[35%] items-center justify-center bg-slate-50 p-4 sm:flex">
          <img src={Confirm} alt="Confirm" className="h-auto w-full object-contain" />
        </div>
      </ModalShell>
    )}
  </>
);

export default ConfirmationModals;
